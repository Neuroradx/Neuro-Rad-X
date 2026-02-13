

"use client";

import type { UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { KeySquare, User, CalendarDays, Clock, DatabaseZap, Bell, CreditCard, FileWarning, Award, Target } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

interface UserInfoCardProps {
  user: UserProfile;
  children?: React.ReactNode; // To allow passing custom buttons or content to the footer
}

const formatTimestamp = (timestamp: string | undefined | null): string => {
  if (!timestamp) return 'N/A';
  try {
    return format(new Date(timestamp), "dd/MM/yyyy, HH:mm:ss");
  } catch {
    return 'Invalid Date';
  }
};

const getAccuracy = (user: UserProfile) => {
  if (!user.totalQuestionsAnsweredAllTime || user.totalQuestionsAnsweredAllTime === 0) return 0;
  return Math.round(((user.totalCorrectAnswersAllTime || 0) / user.totalQuestionsAnsweredAllTime) * 100);
};

export function UserInfoCard({ user, children }: UserInfoCardProps) {
  const { t } = useTranslation();

  let avatarFallback = 'U';
  if (user && user.displayName && user.displayName.trim()) {
    const nameParts = user.displayName.trim().split(/\s+/);
    const firstInitial = nameParts[0]?.[0] || '';
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '';
    const initials = (firstInitial + lastInitial).toUpperCase();
    if (initials) {
      avatarFallback = initials;
    }
  } else if (user && user.email) {
    avatarFallback = user.email[0].toUpperCase();
  }

  const subscriptionExpiresAt = user.subscriptionExpiresAt ? format(new Date(user.subscriptionExpiresAt), "dd/MM/yyyy") : t('common.notAvailable');


  return (
    <Card className="shadow-md flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4">
        {user.id && (
             <Link href={`/admin/sent-notifications/${user.id}`} passHref>
                <Avatar className="h-16 w-16 border cursor-pointer">
                    <AvatarImage src={user.avatarUrl} alt={user.displayName || 'User Avatar'} data-ai-hint="profile large" />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
            </Link>
        )}
        {!user.id && (
             <Avatar className="h-16 w-16 border">
                <AvatarImage src={user.avatarUrl} alt={user.displayName || 'User Avatar'} data-ai-hint="profile large" />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
        )}
        <div className="flex-1">
          {user.id && (
             <Link href={`/admin/sent-notifications/${user.id}`} passHref>
                <CardTitle className="text-2xl hover:underline">{user.displayName || "User"}</CardTitle>
             </Link>
          )}
          {!user.id && (
            <CardTitle className="text-2xl">{user.displayName || "User"}</CardTitle>
          )}
          <a href={`mailto:${user.email}`} className="text-sm text-primary hover:underline">{user.email}</a>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {user.id && (
                <div className="flex items-center gap-2"><KeySquare className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.userId')}</span><span className="font-mono text-xs bg-muted p-1 rounded break-all">{user.id}</span></div>
            )}
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.role')}</span><Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>{t(`settingsPage.roles.${user.role}`)}</Badge>{user.status && <Badge variant={user.status === 'approved' ? 'default' : 'outline'}>{t(`admin.userInfoCard.statusValues.${user.status}`)}</Badge>}</div>
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.joined')}</span><span>{formatTimestamp(user.createdAt)}</span></div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.lastLogin')}</span><span>{formatTimestamp(user.lastSignInTime)}</span></div>
            <div className="flex items-center gap-2"><DatabaseZap className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.statsAnswered')}</span><span>{user.totalQuestionsAnsweredAllTime ?? 0}</span></div>
            <div className="flex items-center gap-2"><Target className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.statsAccuracy')}</span><span>{getAccuracy(user)}%</span></div>
            <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.subscription')}</span><Badge variant="secondary" className="capitalize">{t(`settingsPage.plans.${(user.subscriptionLevel || 'free').toLowerCase()}`)}</Badge></div>
            <div className="flex items-center gap-2"><Award className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.expires')}</span><span>{subscriptionExpiresAt}</span></div>
            {user.notificationCount !== undefined && (
                <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.notificationsSent')}</span><span>{user.notificationCount ?? 0}</span></div>
            )}
            {user.totalReports !== undefined && (
                <div className="flex items-center gap-2"><FileWarning className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{t('admin.userInfoCard.issuesReported')}</span><span>{user.totalReports ?? 0}</span></div>
            )}
        </div>
      </CardContent>
      {children && (
        <CardFooter className="flex justify-end flex-wrap gap-2 pt-4 bg-muted/20">
          {children}
        </CardFooter>
      )}
    </Card>
  );
}
