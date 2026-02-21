
"use client"

import { useState, useEffect, useMemo, useCallback } from "react";
import { BarChart as LayersIcon, CheckCheck, TrendingUp, Loader2, AlertCircle, BookOpen, Brain, CheckCircle as CheckCircleIcon, Activity as ActivityIcon, XCircle as XCircleIcon, CircleDashed as CircleDashedIcon, Calendar as CalendarIcon, Shield, Layers, Trophy, Zap, Target, ArrowDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ComposedChart, Line, Legend, ResponsiveContainer, Cell } from "recharts";
import type { TooltipProps } from "recharts";
import { StatCard } from "@/components/dashboard/stat-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp, type QueryDocumentSnapshot, where, documentId, type DocumentData } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import type { QuizSession, UserQuestionState, CourseStats, CoursePerformanceData, ModuleStats } from "@/types";
import { useTranslation } from "@/hooks/use-translation";
import { subcategoryDisplayNames } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameDay, isSameWeek, isSameMonth, parseISO } from "date-fns";
import { es, de, enGB } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import courseModuleQuestions from '@/lib/course-module-questions.json';

const localeMap: Record<string, any> = {
  es: es,
  de: de,
  en: enGB,
};

const progressTopicStructure: Record<string, string[]> = {
  "Head": ["Anatomy", "CranialNerves", "GeneticDevMetabolic", "InfectionandInflammation", "NeurodegenDementiaDemyelinating", "Neuroimaging", "OrbitandEye", "Other", "Trauma", "Tumors", "Vascular"],
  "Spine": ["TreatmentManagement", "AnatomyRegions", "ImagingModalitiesFeatures", "PathologiesConditions", "NeoplasmsTumors", "ClinicalPresentationSymptoms"],
  "Neck": ["OralOropharynx", "NasalSinus", "SenseHeadNeckReg", "GlandLymphatic", "Other"],
  "General": ["GenMuscStruct", "HeadNeckCNS", "TrunkAndViscera"]
};

interface AggregatedTopicStats {
  correct: number;
  attempted: number;
  percentage: number;
  subtopics: Record<string, { correct: number; attempted: number; percentage: number }>;
}

interface PerformanceStyle {
  textColor: string;
  iconColor: string;
  progressValue: number;
  progressRootClass: string;
  IconComponent: React.ElementType;
}

const getPerformanceStyles = (percentage: number, attempted: number): PerformanceStyle => {
  const progressValue = attempted > 0 ? Math.max(0, Math.min(100, percentage)) : 0;
  const baseProgressRootClass = "h-2 w-full rounded-full bg-muted overflow-hidden";

  if (attempted === 0) {
    return {
      textColor: "text-muted-foreground",
      iconColor: "text-muted-foreground",
      progressValue,
      progressRootClass: `${baseProgressRootClass} [&>*:first-child]:bg-muted-foreground/50`,
      IconComponent: CircleDashedIcon,
    };
  }
  if (percentage >= 80) {
    return {
      textColor: "text-green-600 dark:text-green-400",
      iconColor: "text-green-600 dark:text-green-400",
      progressValue,
      progressRootClass: `${baseProgressRootClass} [&>*:first-child]:bg-green-500`,
      IconComponent: CheckCircleIcon,
    };
  } else if (percentage >= 50) {
    return {
      textColor: "text-yellow-500 dark:text-yellow-400",
      iconColor: "text-yellow-500 dark:text-yellow-400",
      progressValue,
      progressRootClass: `${baseProgressRootClass} [&>*:first-child]:bg-yellow-500`,
      IconComponent: ActivityIcon,
    };
  } else {
    return {
      textColor: "text-red-500 dark:text-red-400",
      iconColor: "text-red-500 dark:text-red-400",
      progressValue,
      progressRootClass: `${baseProgressRootClass} [&>*:first-child]:bg-red-500`,
      IconComponent: XCircleIcon,
    };
  }
};

interface ChartDataItem {
  periodLabel: string;
  correct: number;
  incorrect: number;
  attempted: number;
  accuracy: number;
  date: Date;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  const { t } = useTranslation();
  if (active && payload && payload.length) {
    const correct = payload.find(p => p.dataKey === 'correct')?.value ?? 0;
    const incorrect = payload.find(p => p.dataKey === 'incorrect')?.value ?? 0;
    const accuracy = payload.find(p => p.dataKey === 'accuracy')?.value ?? 0;

    return (
      <div className="p-2 bg-background border border-border rounded-md shadow-lg text-xs">
        <p className="font-bold mb-1">{label}</p>
        <p style={{ color: 'hsl(var(--chart-1))' }}>{t('progressPage.tooltip.correct')}: {correct}</p>
        <p style={{ color: 'hsl(var(--chart-2))' }}>{t('progressPage.tooltip.incorrect')}: {incorrect}</p>
        <p style={{ color: 'hsl(var(--chart-3))' }}>{t('progressPage.tooltip.accuracy')}: {accuracy.toFixed(0)}%</p>
      </div>
    );
  }
  return null;
};

export default function ProgressPage() {
  const { t, language } = useTranslation();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [allSessions, setAllSessions] = useState<QuizSession[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [performanceChartData, setPerformanceChartData] = useState<ChartDataItem[]>([]);
  const [activePeriod, setActivePeriod] = useState<'daily' | 'weekly' | 'monthly' | 'total'>('monthly');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const [kpiData, setKpiData] = useState({
    bestDayPerc: 0,
    bestDayDate: "N/A",
    maxQsDay: 0,
    maxQsDayDate: "N/A",
    overallAvgPerc: 0,
    totalSessionsInRange: 0,
  });

  const [mostPracticedTopic, setMostPracticedTopic] = useState<string>("N/A");
  const [topicPerformanceData, setTopicPerformanceData] = useState<Record<string, AggregatedTopicStats>>({});
  const [isLoadingTopicDetails, setIsLoadingTopicDetails] = useState(true);
  const [topicDetailsError, setTopicDetailsError] = useState<string | null>(null);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformanceData>({});

  const currentLocale = localeMap[language] || enGB;

  useEffect(() => {
    // Hydration-safe date initialization
    setDateRange({
      from: addDays(new Date(), -29),
      to: new Date(),
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data()?.role || 'user');
        } else {
          setUserRole('user');
        }
      } else {
        setFirebaseUser(null);
        setUserRole(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchAllUserSessions = useCallback(async (userId: string) => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      const sessionsCollectionRef = collection(db, "users", userId, "quiz_sessions");
      const q = query(sessionsCollectionRef, orderBy("quizDate", "asc"));
      const querySnapshot = await getDocs(q);
      const sessions: QuizSession[] = [];
      querySnapshot.forEach((docSnap: QueryDocumentSnapshot) => {
        const data = docSnap.data();
        sessions.push({
          id: docSnap.id,
          ...data,
          quizDate: (data.quizDate as Timestamp).toDate(),
        } as QuizSession);
      });
      setAllSessions(sessions);
    } catch (err: any) {
      console.error("Error fetching user sessions:", err);
      setDataError(t('progressPage.errorFetchingOverall', { message: err.message }));
    } finally {
      setIsLoadingData(false);
    }
  }, [t]);

  const processPerformanceData = useCallback(() => {
    if (allSessions.length === 0 || !dateRange) {
      setPerformanceChartData([]);
      setMostPracticedTopic(t('common.notAvailable'));
      return;
    }

    const filteredSessions = allSessions.filter(session => {
      if (activePeriod === 'total') return true; // Ignore date range for "Total" view
      if (!dateRange?.from) return true;
      const sessionDate = session.quizDate;
      const fromDate = dateRange.from;
      const toDate = dateRange.to ? addDays(dateRange.to, 1) : addDays(new Date(), 1);
      return sessionDate >= fromDate && sessionDate < toDate;
    });

    if (filteredSessions.length === 0) {
      setPerformanceChartData([]);
      setMostPracticedTopic(t('common.notAvailable'));
      return;
    }

    const aggregated: Record<string, { correct: number; incorrect: number; attempted: number; date: Date, sessionsCount: number }> = {};
    let intervalFunction;
    let periodFormat: string;

    if (activePeriod === 'daily') {
      intervalFunction = (range: { start: Date, end: Date }) => eachDayOfInterval(range);
      periodFormat = "MMM d, yyyy";
    } else if (activePeriod === 'weekly') {
      intervalFunction = (range: { start: Date, end: Date }) => eachWeekOfInterval(range, { weekStartsOn: 1 });
      periodFormat = "MMM d, yyyy";
    } else if (activePeriod === 'monthly') {
      intervalFunction = (range: { start: Date, end: Date }) => eachMonthOfInterval(range);
      periodFormat = "MMM yyyy";
    } else {
      // Total view: just one period covering everything
      intervalFunction = (range: { start: Date, end: Date }) => [range.start];
      periodFormat = "yyyy"; // Overall year or custom label
    }

    const firstSessionDate = filteredSessions[0].quizDate;
    const lastSessionDate = filteredSessions[filteredSessions.length - 1].quizDate;
    const periodsInRange = intervalFunction({ start: firstSessionDate, end: lastSessionDate });

    periodsInRange.forEach(periodStart => {
      const key = format(periodStart, periodFormat, { locale: currentLocale });
      aggregated[key] = { correct: 0, incorrect: 0, attempted: 0, date: periodStart, sessionsCount: 0 };
    });

    filteredSessions.forEach(session => {
      let periodKey: string;
      if (activePeriod === 'daily') {
        periodKey = format(session.quizDate, periodFormat, { locale: currentLocale });
      } else if (activePeriod === 'weekly') {
        periodKey = format(startOfWeek(session.quizDate, { weekStartsOn: 1 }), periodFormat, { locale: currentLocale });
      } else if (activePeriod === 'monthly') {
        periodKey = format(startOfMonth(session.quizDate), periodFormat, { locale: currentLocale });
      } else {
        periodKey = t('progressPage.buttons.total', { defaultValue: 'All Time' });
      }

      if (activePeriod === 'total') {
        if (!aggregated[periodKey]) {
          aggregated[periodKey] = { correct: 0, incorrect: 0, attempted: 0, date: firstSessionDate, sessionsCount: 0 };
        }
      }

      if (aggregated[periodKey]) {
        aggregated[periodKey].correct += session.correctAnswers || 0;
        aggregated[periodKey].incorrect += session.incorrectAnswers || 0;
        aggregated[periodKey].attempted += session.actualNumberOfQuestions || 0;
        aggregated[periodKey].sessionsCount += 1;
      }
    });

    const chartData: ChartDataItem[] = Object.entries(aggregated)
      .map(([periodLabel, data]) => ({
        periodLabel,
        correct: data.correct,
        incorrect: data.incorrect,
        attempted: data.attempted,
        accuracy: data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0,
        date: data.date,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    setPerformanceChartData(chartData);

    let bestDayPerc = 0;
    let bestDayDate = t('common.notAvailable');
    let maxQsDay = 0;
    let maxQsDayDate = t('common.notAvailable');
    let totalCorrectInRange = 0;
    let totalAttemptedInRange = 0;

    const dailyAggForKpi: Record<string, { correct: number; attempted: number; date: Date }> = {};
    filteredSessions.forEach(session => {
      const dayKey = format(session.quizDate, "yyyy-MM-dd");
      if (!dailyAggForKpi[dayKey]) {
        dailyAggForKpi[dayKey] = { correct: 0, attempted: 0, date: session.quizDate };
      }
      dailyAggForKpi[dayKey].correct += session.correctAnswers || 0;
      dailyAggForKpi[dayKey].attempted += session.actualNumberOfQuestions || 0;
      totalCorrectInRange += session.correctAnswers || 0;
      totalAttemptedInRange += session.actualNumberOfQuestions || 0;
    });

    Object.values(dailyAggForKpi).forEach(dayData => {
      const dayAccuracy = dayData.attempted > 0 ? (dayData.correct / dayData.attempted) * 100 : 0;
      if (dayAccuracy > bestDayPerc) {
        bestDayPerc = dayAccuracy;
        bestDayDate = format(dayData.date, "MMM d, yyyy", { locale: currentLocale });
      }

      if (dayData.attempted > maxQsDay) {
        maxQsDay = dayData.attempted;
        maxQsDayDate = format(dayData.date, "MMM d, yyyy", { locale: currentLocale });
      }
    });

    setKpiData({
      bestDayPerc: Math.round(bestDayPerc),
      bestDayDate,
      maxQsDay,
      maxQsDayDate,
      overallAvgPerc: totalAttemptedInRange > 0 ? Math.round((totalCorrectInRange / totalAttemptedInRange) * 100) : 0,
      totalSessionsInRange: filteredSessions.length
    });

  }, [allSessions, activePeriod, dateRange, currentLocale, t]);

  const calculateCoursePerformance = useCallback((
    userStates: Map<string, UserQuestionState>,
    courseData: typeof courseModuleQuestions
  ) => {
    const performance: CoursePerformanceData = {};
    const typedCourseData = courseData as Record<string, Record<string, string[]>>;

    for (const courseName in typedCourseData) {
      performance[courseName] = { correct: 0, attempted: 0, percentage: 0, modules: {} };
      let totalCourseCorrect = 0;
      let totalCourseAttempted = 0;

      for (const moduleName in typedCourseData[courseName]) {
        performance[courseName].modules[moduleName] = { correct: 0, attempted: 0, percentage: 0 };
        const questionIds = typedCourseData[courseName][moduleName];
        let moduleCorrect = 0;
        let moduleAttempted = 0;

        for (const qId of questionIds) {
          if (userStates.has(qId)) {
            const state = userStates.get(qId)!;
            const correct = state.correctCount || 0;
            const incorrect = state.incorrectCount || 0;
            const attempted = correct + incorrect;
            if (attempted > 0) {
              moduleCorrect += correct;
              moduleAttempted += attempted;
            }
          }
        }

        if (moduleAttempted > 0) {
          performance[courseName].modules[moduleName] = {
            correct: moduleCorrect,
            attempted: moduleAttempted,
            percentage: Math.round((moduleCorrect / moduleAttempted) * 100),
          };
          totalCourseCorrect += moduleCorrect;
          totalCourseAttempted += moduleAttempted;
        }
      }

      if (totalCourseAttempted > 0) {
        performance[courseName].correct = totalCourseCorrect;
        performance[courseName].attempted = totalCourseAttempted;
        performance[courseName].percentage = Math.round((totalCourseCorrect / totalCourseAttempted) * 100);
      }
    }
    setCoursePerformance(performance);
  }, []);

  const fetchTopicPerformanceDetails = useCallback(async (userId: string) => {
    setIsLoadingTopicDetails(true);
    setTopicDetailsError(null);
    try {
      const userQuestionsCollectionRef = collection(db, "users", userId, "userQuestions");
      const userQuestionsSnapshot = await getDocs(userQuestionsCollectionRef);
      const userQuestionStates = new Map<string, UserQuestionState>();
      userQuestionsSnapshot.forEach(docSnap => {
        userQuestionStates.set(docSnap.id, docSnap.data() as UserQuestionState);
      });

      if (userQuestionStates.size === 0) {
        setTopicPerformanceData({});
        setCoursePerformance({});
        setIsLoadingTopicDetails(false);
        return;
      }

      calculateCoursePerformance(userQuestionStates, courseModuleQuestions);

      const questionIds = [...userQuestionStates.keys()];
      const questionDetailsMap = new Map<string, { category: string; subcategory?: string }>();

      const questionPromises = [];
      for (let i = 0; i < questionIds.length; i += 30) {
        const batchIds = questionIds.slice(i, i + Math.min(30, questionIds.length - i));
        if (batchIds.length > 0) {
          const questionsQuery = query(collection(db, "questions"), where(documentId(), "in", batchIds));
          questionPromises.push(getDocs(questionsQuery).then(questionDocsSnapshot => {
            questionDocsSnapshot.forEach(docSnap => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                questionDetailsMap.set(docSnap.id, {
                  category: data.main_localization,
                  subcategory: data.sub_main_location
                });
              }
            });
          }));
        }
      }
      await Promise.all(questionPromises);

      const aggregatedData: Record<string, AggregatedTopicStats> = {};

      userQuestionStates.forEach((uqs, questionId) => {
        const details = questionDetailsMap.get(questionId);
        if (!details) return;

        const categoryKey = details.category;
        const subcategoryKey = details.subcategory || "N/A";

        if (!aggregatedData[categoryKey]) {
          aggregatedData[categoryKey] = { correct: 0, attempted: 0, percentage: 0, subtopics: {} };
        }

        const correct = uqs.correctCount || 0;
        const incorrect = uqs.incorrectCount || 0;
        const attempted = correct + incorrect;

        if (attempted > 0) {
          aggregatedData[categoryKey].correct += correct;
          aggregatedData[categoryKey].attempted += attempted;

          if (!aggregatedData[categoryKey].subtopics[subcategoryKey]) {
            aggregatedData[categoryKey].subtopics[subcategoryKey] = { correct: 0, attempted: 0, percentage: 0 };
          }
          aggregatedData[categoryKey].subtopics[subcategoryKey].correct += correct;
          aggregatedData[categoryKey].subtopics[subcategoryKey].attempted += attempted;
        }
      });

      for (const catKey in aggregatedData) {
        const catData = aggregatedData[catKey];
        catData.percentage = catData.attempted > 0 ? Math.round((catData.correct / catData.attempted) * 100) : 0;
        for (const subKey in catData.subtopics) {
          const subData = catData.subtopics[subKey];
          subData.percentage = subData.attempted > 0 ? Math.round((subData.correct / subData.attempted) * 100) : 0;
        }
      }
      setTopicPerformanceData(aggregatedData);

    } catch (err: any) {
      console.error("Error fetching topic performance details:", err);
      setTopicDetailsError(t('progressPage.errorFetchingTopicDetails', { message: err.message }));
    } finally {
      setIsLoadingTopicDetails(false);
    }
  }, [t, calculateCoursePerformance]);

  useEffect(() => {
    if (!authLoading && firebaseUser && !firebaseUser.isAnonymous) {
      fetchAllUserSessions(firebaseUser.uid);
      fetchTopicPerformanceDetails(firebaseUser.uid);
    }
  }, [authLoading, firebaseUser, fetchAllUserSessions, fetchTopicPerformanceDetails]);

  useEffect(() => {
    processPerformanceData();
  }, [allSessions, activePeriod, dateRange, processPerformanceData]);

  if (authLoading || (isLoadingData && firebaseUser && !firebaseUser.isAnonymous)) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">{authLoading ? t('loading.auth') : t('loading.progress')}</p>
      </div>
    );
  }

  if (!firebaseUser || firebaseUser.isAnonymous) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="default" className="shadow">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('auth.loginRequiredTitle')}</AlertTitle>
          <AlertDescription>
            {t('auth.loginRequiredMessageProgress')}{" "}
            <Button variant="link" asChild className="p-0 h-auto"><Link href="/auth/login">{t('userNav.logIn')}</Link></Button>
            {" "}{t('auth.loginRequiredMessageProgressAfterLink')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error.title')}</AlertTitle>
          <AlertDescription>{dataError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{t('progressPage.title')}</h1>
      </div>
      <p className="text-muted-foreground mb-8">{t('progressPage.description')}</p>

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>{t('progressPage.performanceOverTime')}</CardTitle>
              <CardDescription>{t('progressPage.monthlyCorrectIncorrect')}</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} disabled={isLoadingData} />
              <div className="flex bg-muted p-1 rounded-md">
                <Button size="sm" variant={activePeriod === 'daily' ? 'default' : 'ghost'} onClick={() => setActivePeriod('daily')} disabled={isLoadingData}>{t('progressPage.buttons.daily')}</Button>
                <Button size="sm" variant={activePeriod === 'weekly' ? 'default' : 'ghost'} onClick={() => setActivePeriod('weekly')} disabled={isLoadingData}>{t('progressPage.buttons.weekly')}</Button>
                <Button size="sm" variant={activePeriod === 'monthly' ? 'default' : 'ghost'} onClick={() => setActivePeriod('monthly')} disabled={isLoadingData}>{t('progressPage.buttons.monthly')}</Button>
                <Button size="sm" variant={activePeriod === 'total' ? 'default' : 'ghost'} onClick={() => setActivePeriod('total')} disabled={isLoadingData}>{t('progressPage.buttons.total')}</Button>
              </div>
            </div>
          </div>
          <div className="grid gap-2 sm:gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4">
            <StatCard title={t('progressPage.stats.bestDayPerc.title')} value={`${kpiData.bestDayPerc}%`} icon={Trophy} description={kpiData.bestDayDate} className="shadow-none border text-xs" />
            <StatCard title={t('progressPage.stats.maxQsDay.title')} value={kpiData.maxQsDay.toString()} icon={Zap} description={kpiData.maxQsDayDate} className="shadow-none border text-xs" />
            <StatCard title={t('progressPage.stats.overallAvgPerc.title')} value={`${kpiData.overallAvgPerc}%`} icon={Target} description={t('progressPage.stats.inSelectedRange')} className="shadow-none border text-xs" />
            <StatCard title={t('progressPage.stats.totalSessionsInRange.title')} value={kpiData.totalSessionsInRange.toString()} icon={ActivityIcon} description={t('progressPage.stats.inSelectedRange')} className="shadow-none border text-xs" />
          </div>
        </CardHeader>
        <CardContent className="h-[350px] w-full">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : performanceChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performanceChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="periodLabel" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tickFormatter={(value) => `${value}`} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.3)' }} />
                <Legend wrapperStyle={{ fontSize: "10px" }} />
                <Bar yAxisId="left" dataKey="correct" name={t('progressPage.chart.correct')} stackId="a" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="incorrect" name={t('progressPage.chart.incorrect')} stackId="a" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="accuracy" name={t('progressPage.chart.accuracy')} stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3, fill: 'hsl(var(--chart-3))', strokeWidth: 1, stroke: 'hsl(var(--background))' }} activeDot={{ r: 5, strokeWidth: 1 }} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">{t('progressPage.chart.noDataForPeriod')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLoadingTopicDetails && (
        <Card className="shadow-lg mb-8 border-red-100 dark:border-red-900/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowDown className="h-5 w-5 text-red-500" />
              <CardTitle>{t('progressPage.weakestTopicsTitle', { defaultValue: 'Opportunities for Improvement' })}</CardTitle>
            </div>
            <CardDescription>{t('progressPage.weakestTopicsDescription', { defaultValue: 'Top 3 categories where you can improve your accuracy.' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.entries(topicPerformanceData)
                .filter(([_, data]) => data.attempted > 0)
                .sort((a, b) => a[1].percentage - b[1].percentage)
                .slice(0, 3)
                .map(([topic, data]) => (
                  <div key={topic} className="p-4 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20">
                    <p className="text-sm font-semibold mb-1">{topic === "General" ? t('studyMode.categoryOther') : t(`topics.${topic.toLowerCase()}` as any)}</p>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">{data.percentage}%</span>
                      <span className="text-xs text-muted-foreground">{data.correct}/{data.attempted}</span>
                    </div>
                    <Progress value={data.percentage} className="h-1.5 mt-2 bg-red-100 dark:bg-red-900/20 [&>*:first-child]:bg-red-500" />
                  </div>
                ))}
              {Object.values(topicPerformanceData).filter(d => d.attempted > 0).length === 0 && (
                <p className="text-sm text-muted-foreground col-span-3 text-center py-4">{t('progressPage.noDataForWeakest', { defaultValue: 'Start practicing to see your improvement areas!' })}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>{t('progressPage.topicBreakdownTitle')}</CardTitle>
          <CardDescription>{t('progressPage.topicBreakdownDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {!isLoadingTopicDetails && !topicDetailsError ? (
            <Accordion type="multiple" className="w-full">
              {Object.entries(progressTopicStructure).map(([mainTopicKey, subtopicsArray]) => {
                const mainTopicDisplay = mainTopicKey === "General"
                  ? t('studyMode.categoryOther')
                  : t(`topics.${mainTopicKey.toLowerCase()}` as any);
                const performance = topicPerformanceData[mainTopicKey];
                const mainTopicStyles = getPerformanceStyles(performance?.percentage ?? 0, performance?.attempted ?? 0);

                const sortedSubtopics = subtopicsArray
                  .map(subtopicKey => ({
                    key: subtopicKey,
                    displayName: t(subcategoryDisplayNames[subtopicKey] || `subtopics.${subtopicKey.toLowerCase()}`, { defaultValue: subtopicKey }),
                  }))
                  .sort((a, b) => a.displayName.localeCompare(b.displayName));

                return (
                  <AccordionItem value={mainTopicKey} key={mainTopicKey}>
                    <AccordionTrigger className="text-lg font-semibold hover:no-underline py-4">
                      <div className="flex justify-between w-full items-center pr-2">
                        <span className="text-xl">{mainTopicDisplay}</span>
                        <div className="flex items-center gap-2 text-sm font-normal ml-auto mr-2">
                          <mainTopicStyles.IconComponent className={cn("h-5 w-5", mainTopicStyles.iconColor)} />
                          {performance && performance.attempted > 0 ? (
                            <span className={mainTopicStyles.textColor}>
                              {t('progressPage.overallCategoryPerformance', {
                                percentage: performance.percentage.toString(),
                                correct: performance.correct.toString(),
                                attempted: performance.attempted.toString()
                              })}
                            </span>
                          ) : (
                            <span className={mainTopicStyles.textColor}>{t('progressPage.noAttemptsCategory')}</span>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-2 pr-1">
                      <ul className="list-none space-y-3">
                        {sortedSubtopics.map(({ key: subtopicKey, displayName: subtopicDisplayName }) => {
                          const subtopicPerf = performance?.subtopics[subtopicKey];
                          const subtopicStyles = getPerformanceStyles(subtopicPerf?.percentage ?? 0, subtopicPerf?.attempted ?? 0);
                          return (
                            <li key={subtopicKey} className="p-3 hover:bg-muted/20 dark:hover:bg-muted/10 rounded-md transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <subtopicStyles.IconComponent className={cn("h-4 w-4 flex-shrink-0", subtopicStyles.iconColor)} />
                                  <span className="text-md font-medium text-foreground">{subtopicDisplayName}</span>
                                </div>
                                <span className={cn("text-xs font-medium", subtopicStyles.textColor)}>
                                  {subtopicPerf && subtopicPerf.attempted > 0 ?
                                    t('progressPage.performanceLabel', {
                                      percentage: subtopicPerf.percentage.toString(),
                                      correct: subtopicPerf.correct.toString(),
                                      attempted: subtopicPerf.attempted.toString()
                                    })
                                    : t('progressPage.noAttemptsSubtopic')
                                  }
                                </span>
                              </div>
                              <Progress
                                value={subtopicStyles.progressValue}
                                className={cn("h-2", subtopicStyles.progressRootClass)}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
