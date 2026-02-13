"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, CreditCard, Users, Mail, Bell, KeySquare, User, CalendarDays, Clock, DatabaseZap, Target, Award, FileWarning, ArrowLeft } from 'lucide-react';
import type { UserProfile } from '@/types';
import { fetchUsersBySubscription } from '@/actions/user-data-actions';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


const USERS_PER_PAGE = 10;
const SUBSCRIPTION_LEVELS: (UserProfile['subscriptionLevel'])[] = ['free', 'basic', 'premium', 'Trial', 'Evaluator', 'Owner', 'ECMINT'];

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


export default function UsersBySubscriptionPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSubscription, setSelectedSubscription] = useState<UserProfile['subscriptionLevel']>('Trial');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
        } catch (error) {
          console.error("Error verifying admin status:", error);
          setIsAdmin(false);
          setFetchError("Could not verify admin permissions.");
        }
      } else {
        setIsAdmin(false);
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchUsers = useCallback(async (subscription: UserProfile['subscriptionLevel'], page: number) => {
    if (!isAdmin || !subscription || !auth.currentUser) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      // Pass auth.currentUser.uid as the 4th argument to fix "Unauthorized access"
      const result = await fetchUsersBySubscription(subscription, page, USERS_PER_PAGE, auth.currentUser.uid);
      if (result.success && result.users) {
        setUsers(result.users as UserProfile[]);
        setTotalCount(result.totalCount || 0);
      } else {
        throw new Error(result.error || t('admin.usersBySubscription.errorFetching'));
      }
    } catch (error: any) {
      console.error("Error fetching users by subscription:", error);
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, t]);
  
  useEffect(() => {
      setCurrentPage(1); // Reset to first page whenever subscription changes
  }, [selectedSubscription]);

  useEffect(() => {
    if (!isAuthLoading && isAdmin) {
      fetchUsers(selectedSubscription, currentPage);
    }
  }, [isAdmin, isAuthLoading, currentPage, selectedSubscription, fetchUsers]);

  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  if (isAuthLoading) {
    return <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isAdmin && !isAuthLoading) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>{t('admin.accessDenied.title')}</AlertTitle><AlertDescription>{t('admin.accessDenied.description')}</AlertDescription></Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">{t('admin.accessDenied.backToDashboard')}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
      </Button>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3"><CreditCard className="h-8 w-8 text-primary" /><h1 className="text-3xl font-bold">{t('admin.usersBySubscription.title')}</h1></div>
        <Button variant="outline" onClick={() => fetchUsers(selectedSubscription, currentPage)} disabled={isLoading}><RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />{t('admin.activeUsers.refreshButton')}</Button>
      </div>
      <p className="text-muted-foreground mb-6">{t('admin.usersBySubscription.description')}</p>

      <div className="mb-8 max-w-sm">
        <Label htmlFor="subscription-select">{t('admin.usersBySubscription.selectLabel')}</Label>
        <Select value={selectedSubscription} onValueChange={(value) => setSelectedSubscription(value as UserProfile['subscriptionLevel'])}>
          <SelectTrigger id="subscription-select">
            <SelectValue placeholder={t('admin.usersBySubscription.selectPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {SUBSCRIPTION_LEVELS.map(level => (
              level && <SelectItem key={level} value={level}>{t(`settingsPage.plans.${level.toLowerCase()}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <div className="flex justify-center items-center py-10"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="ml-3 text-muted-foreground">{t('admin.pendingUsers.loadingUsers')}</p></div>}
      {!isLoading && fetchError && <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>{t('toast.errorTitle')}</AlertTitle><AlertDescription>{fetchError}</AlertDescription></Alert>}
      {!isLoading && !fetchError && users.length === 0 && selectedSubscription && (
    <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>{t('admin.usersBySubscription.noUsersTitle')}</AlertTitle>
        <AlertDescription>
            {t('admin.usersBySubscription.noUsersDesc', { 
                level: t(`settingsPage.plans.${selectedSubscription.toLowerCase()}`) 
            })}
        </AlertDescription>
    </Alert>
)}
      {!isLoading && !fetchError && users.length > 0 && (
         <Accordion type="multiple" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {users.map(user => {
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
                  <Card key={user.id} className="shadow-sm">
                      <AccordionItem value={user.id!} className="border-b-0">
                          <AccordionTrigger className="p-4 hover:no-underline rounded-t-lg">
                              <div className="flex items-center gap-4 text-left w-full">
                                  <Avatar className="h-12 w-12 border">
                                      <AvatarImage src={user.avatarUrl} alt={user.displayName || 'User Avatar'} />
                                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                      <p className="font-semibold text-lg">{user.displayName || "User"}</p>
                                      <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="p-0">
                            <div className="px-4 pb-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm pt-4 border-t">
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
                            </div>
                            <div className="flex justify-end flex-wrap gap-2 p-4 pt-4 border-t bg-muted/20 rounded-b-lg">
                               <Button variant="outline" size="sm" onClick={() => router.push(`/admin/sent-notifications/${user.id}`)}>
                                <Bell className="mr-2 h-4 w-4"/>
                                {t('admin.activeUsers.actions.notifications', { count: (user.notificationCount ?? 0).toString() })}                              </Button>
                              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/send-notification?userId=${user.id}`)}>
                                <Mail className="mr-2 h-4 w-4"/>
                                {t('admin.usersBySubscription.actions.notify')}
                              </Button>
                            </div>
                          </AccordionContent>
                      </AccordionItem>
                  </Card>
                )
            })}
        </Accordion>
      )}
      
      {!isLoading && totalPages > 1 && (
         <div className="mt-8 flex justify-center items-center gap-4">
          <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading} variant="outline"><ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous')}</Button>
          <span className="text-sm text-muted-foreground">{t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}</span>
          <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading} variant="outline">{t('pagination.next')} <ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
