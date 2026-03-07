"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

import { useTranslation } from '@/hooks/use-translation';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, Target, BookOpen, Sparkles, AlertCircle, CalendarDays, GraduationCap, ClipboardCheck, Layers3, Flame, Lightbulb, ArrowRight
} from 'lucide-react';
import type { QuizSession, UserProfile } from '@/types';
import { format } from 'date-fns';

interface OverallStats {
  totalQuestions: number;
  overallAccuracy: number;
  topicsCovered: number;
  totalStudyDays: number;
  currentStreak: number;
}

const QuickStartCard = ({ mode, title, description, icon: Icon, onClick }: { mode: string; title: string; description: string; icon: React.ElementType, onClick: () => void; }) => (
    <Card
      className="group cursor-pointer border-primary/15 hover:border-primary/30 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-lg font-semibold leading-tight">{title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{description}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
      </CardHeader>
    </Card>
);

const DailyFactCard = ({ fact }: { fact: string | null }) => {
  const { t } = useTranslation();
  if (!fact) return null;

  return (
    <Card className="bg-primary/5 border-primary/20 shadow-sm overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
          <Lightbulb className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" />
          {t('dashboard.dailyFact.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <p className="text-sm italic text-muted-foreground leading-relaxed">
          &quot;{fact}&quot;
        </p>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const router = useRouter();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [dailyFact, setDailyFact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            setUserProfile(profileData);

            const sessionsCollection = collection(db, 'users', user.uid, 'quiz_sessions');
            const q = query(sessionsCollection, orderBy('quizDate', 'desc'));
            const sessionsSnapshot = await getDocs(q);
            const sessions = sessionsSnapshot.docs.map(doc => ({
              ...doc.data(), 
              quizDate: doc.data().quizDate.toDate()
            })) as QuizSession[];

            let totalCorrect = 0;
            let totalAnswered = 0;
            const uniqueTopics = new Set<string>();
            const uniqueDays = new Set<string>();

            sessions.forEach(session => {
                totalCorrect += session.correctAnswers ?? 0;
                totalAnswered += session.actualNumberOfQuestions ?? 0;
                if (session.quizConfig?.mainLocalization) {
                  uniqueTopics.add(session.quizConfig.mainLocalization);
                }
                uniqueDays.add(format(session.quizDate instanceof Date ? session.quizDate : new Date(String(session.quizDate)), 'yyyy-MM-dd'));
            });

            const overallAccuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;
            
            const sortedDates = Array.from(uniqueDays).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
            let streak = 0;
            if (sortedDates.length > 0) {
              const today = new Date();
              const todayStr = format(today, 'yyyy-MM-dd');
              const yesterday = new Date();
              yesterday.setDate(today.getDate() - 1);
              const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

              if (uniqueDays.has(todayStr) || uniqueDays.has(yesterdayStr)) {
                streak = 1;
                for (let i = 0; i < sortedDates.length - 1; i++) {
                  const diff = Math.round((sortedDates[i].getTime() - sortedDates[i+1].getTime()) / (1000 * 3600 * 24));
                  if (diff === 1) {
                    streak++;
                  } else {
                    break;
                  }
                }
              }
            }

            setOverallStats({
              totalQuestions: profileData.totalQuestionsAnsweredAllTime || totalAnswered,
              overallAccuracy,
              topicsCovered: uniqueTopics.size,
              totalStudyDays: uniqueDays.size,
              currentStreak: streak
            });

            const factsSnap = await getDocs(query(collection(db, 'dailyFacts'), limit(10)));
            if (!factsSnap.empty) {
              const randomIdx = Math.floor(Math.random() * factsSnap.size);
              const factData = factsSnap.docs[randomIdx].data();
              setDailyFact(factData.fact?.[language] || factData.fact?.en || null);
            }

          } else {
            setError("User profile not found.");
          }
        } catch (err: any) {
          console.error("Error fetching user data:", err);
          setError(err.message);
        }
      } else {
        router.push('/auth/login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router, language]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>{t('error.title')}</AlertTitle><AlertDescription>{t('dashboard.stats.errorFetchingData', { message: error })}</AlertDescription></Alert>;
  }

  const quickStartModes = [
    { mode: 'tutor', title: t('nav.tutorMode'), description: t('studyModes.tutor.description'), icon: GraduationCap },
    { mode: 'exam', title: t('nav.examMode'), description: t('studyModes.exam.description'), icon: ClipboardCheck },
    { mode: 'flashcards', title: t('nav.flashcards'), description: t('studyModes.flashcards.description'), icon: Layers3 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.welcomeBack', { name: userProfile?.displayName || 'User' })}</h1>
          <p className="text-muted-foreground">{t('dashboard.overview')}</p>
        </div>
        {overallStats?.currentStreak && overallStats.currentStreak > 0 && (
          <Badge variant="secondary" className="w-fit px-4 py-2 text-md flex items-center gap-2 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200">
            <Flame className="h-5 w-5 fill-current" />
            {t('dashboard.stats.studyStreakValue', { days: overallStats.currentStreak.toString() })}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('dashboard.stats.totalQuestionsPracticed')} value={overallStats?.totalQuestions || 0} icon={BookOpen} href="/progress" className="border-primary/10" aria-label={t('dashboard.stats.totalQuestionsPracticed')} />
        <StatCard title={t('dashboard.stats.overallAccuracy')} value={`${(overallStats?.overallAccuracy || 0).toFixed(0)}%`} icon={Target} href="/progress" className="border-primary/10" aria-label={t('dashboard.stats.overallAccuracy')} />
        <StatCard title={t('dashboard.stats.studyActivity')} value={overallStats?.totalStudyDays || 0} icon={CalendarDays} href="/progress" className="border-primary/10" aria-label={t('dashboard.stats.studyActivity')} />
        <StatCard title={t('dashboard.stats.topicsCovered')} value={overallStats?.topicsCovered || 0} icon={TrendingUp} description={t('progressPage.topicBreakdownTitle')} href="/progress" className="border-primary/10" aria-label={t('dashboard.stats.topicsCovered')} />
      </div>

      <DailyFactCard fact={dailyFact} />

       <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              {t('dashboard.quickStart.title')}
            </h2>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {quickStartModes.map(mode => (
                    <QuickStartCard 
                        key={mode.mode}
                        {...mode}
                        onClick={() => router.push(`/study/${mode.mode}`)}
                    />
                ))}
            </div>
        </div>
    </div>
  );
}
