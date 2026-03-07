"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { type User as FirebaseUser } from 'firebase/auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Loader2, ShieldAlert, CheckCircle, RefreshCw, Bell, ChevronLeft, ChevronRight, Archive, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchAllSentNotifications, archiveNotification } from '@/actions/notification-actions';
import type { Notification, UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle as AlertDialogTitleComponent } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserInfoCard } from '@/components/admin/UserInfoCard';
import { format } from 'date-fns';

const NOTIFICATIONS_PER_PAGE = 10;

const formatTimestamp = (isoString: string | undefined | null): string => {
  if (!isoString) return 'N/A';
  try {
    return format(new Date(isoString), "dd/MM/yyyy, HH:mm:ss");
  } catch (e) {
    return 'Invalid Date';
  }
};

export default function SentNotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [notificationToArchive, setNotificationToArchive] = useState<Notification | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const totalPages = useMemo(() => Math.ceil(totalCount / NOTIFICATIONS_PER_PAGE), [totalCount]);

  const fetchData = useCallback(async (page: number, callerUid: string) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const result = await fetchAllSentNotifications(page, NOTIFICATIONS_PER_PAGE, callerUid);
      if (result.success && result.notifications) {
        setNotifications(result.notifications as Notification[]);
        setTotalCount(result.totalCount || 0);
      } else {
        throw new Error(result.error || t('admin.sentNotifications.errorFetchingListGeneric'));
      }
    } catch (error: any) {
      setFetchError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      fetchData(currentPage, user.uid);
    }
  }, [currentPage, fetchData]);

  const handleArchive = async () => {
    if (!notificationToArchive || !currentUser) return;
    setIsArchiving(true);
    const result = await archiveNotification(notificationToArchive.id, currentUser.uid);
    if (result.success) {
      toast({ title: "Notification Archived", description: "The notification has been moved to the archive.", variant: 'success' });
      setNotifications(prev => prev.filter(n => n.id !== notificationToArchive.id));
      setTotalCount(prev => prev - 1);
    } else {
      toast({ title: "Error", description: result.error || "Failed to archive notification.", variant: 'destructive' });
    }
    setIsArchiving(false);
    setNotificationToArchive(null);
    setIsArchiveDialogOpen(false);
  };

  const openArchiveDialog = (notification: Notification) => {
    setNotificationToArchive(notification);
    setIsArchiveDialogOpen(true);
  };


  return (
    <>
      <div className="container mx-auto py-8 max-w-6xl px-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => router.push('/admin/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
        </Button>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20">
              <Bell className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('admin.sentNotifications.title')}</h1>
              <p className="text-sm text-muted-foreground mt-1">{t('admin.sentNotifications.description')}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg shrink-0 border-border/80 hover:bg-muted/50 transition-colors"
            onClick={() => currentUser && fetchData(currentPage, currentUser.uid)}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {t('admin.sentNotifications.refreshButton')}
          </Button>
        </div>

        {isLoading && (
          <div className="flex flex-col justify-center items-center py-20 rounded-2xl border border-border/50 bg-muted/30">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground font-medium">{t('admin.sentNotifications.loading')}</p>
          </div>
        )}

        {!isLoading && fetchError && (
          <ErrorAlert description={fetchError} className="rounded-xl border-destructive/50" />
        )}

        {!isLoading && !fetchError && notifications.length === 0 && (
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="font-semibold text-lg">{t('admin.sentNotifications.noNotificationsTitle')}</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">{t('admin.sentNotifications.noNotificationsDesc')}</p>
          </div>
        )}

        {!isLoading && !fetchError && notifications.length > 0 && (
          <>
            <Accordion type="multiple" className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              {notifications.map((notification) => {
                const user = notification.userProfile;
                let avatarFallback = '?';
                if (user && user.displayName && user.displayName.trim()) {
                  const nameParts = user.displayName.trim().split(/\s+/);
                  avatarFallback = (nameParts[0]?.[0] || '' + (nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '')).toUpperCase();
                } else if (user && user.email) {
                  avatarFallback = user.email[0].toUpperCase();
                } else if (notification.userId && notification.userId.length >= 2) {
                  avatarFallback = notification.userId.slice(0, 2).toUpperCase();
                }

                const params = { ...notification.messageParams };
                if (notification.type === 'issueReportUpdate') {
                  const statusKey = notification.messageParams?.statusKey;
                  if (statusKey) {
                    params.statusValue = t(`admin.reportedQuestionsPage.statusValues.${statusKey}`);
                  }
                }

                let translatedTitle = t(notification.titleKey, params);
                let translatedMessage = t(notification.messageKey, params);
                if (translatedTitle.includes('.') && translatedTitle === notification.titleKey) {
                  translatedTitle = t('admin.sentNotifications.fallbackTitle');
                }
                if (translatedMessage.includes('.') && translatedMessage === notification.messageKey) {
                  translatedMessage = t('admin.sentNotifications.fallbackMessage');
                }


                return (
                  <Card key={notification.id} className="overflow-hidden rounded-xl border border-border/60 shadow-md hover:shadow-lg transition-shadow duration-200">
                    <AccordionItem value={notification.id} className="border-b-0">
                      <AccordionTrigger className="relative px-4 py-4 sm:px-5 sm:py-5 pr-12 hover:no-underline hover:bg-muted/30 rounded-t-xl transition-colors [&[data-state=open]]:bg-muted/20 [&>svg]:absolute [&>svg]:right-4 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2">
                        <div className="flex items-start gap-3 sm:gap-4 text-left w-full min-w-0 pr-2">
                          <Avatar className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 border-2 border-border/50 ring-2 ring-primary/10">
                            <AvatarImage src={user?.avatarUrl} alt={user?.displayName || 'User Avatar'} />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-base sm:text-lg truncate" title={user?.displayName || notification.userId}>
                                {user?.displayName || (notification.userId ? `${notification.userId.slice(0, 8)}…${notification.userId.slice(-4)}` : 'Unknown')}
                              </p>
                              <Badge variant={notification.status === 'read' ? 'secondary' : 'default'} className="shrink-0 capitalize flex-shrink-0">{notification.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5 break-words" title={translatedTitle}>{translatedTitle}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-0">
                        <div className="px-4 pb-4 pt-4 border-t">
                          {user ? (
                            <UserInfoCard user={user as UserProfile} />
                          ) : (
                            <p className="text-sm text-muted-foreground">User information not available for ID: {notification.userId}</p>
                          )}
                        </div>
                        <div className="px-5 pb-5 border-t pt-5 space-y-3 bg-muted/10">
                          <h3 className="font-semibold text-base text-primary break-all">{translatedTitle}</h3>
                          <p className="text-sm text-muted-foreground break-words">{translatedMessage}</p>
                          {notification.link && <p className="text-xs text-muted-foreground break-all">Link: <a href={notification.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{notification.link}</a></p>}
                        </div>
                        <CardFooter className="flex justify-between items-center p-4 border-t bg-muted/30 rounded-b-xl mt-auto">
                          <span className="text-xs text-muted-foreground">{formatTimestamp(notification.createdAt as string)}</span>
                          <Button variant="outline" size="sm" onClick={() => openArchiveDialog(notification)}>
                            <Archive className="mr-2 h-4 w-4" />
                            {t('admin.sentNotifications.archiveButton')}
                          </Button>
                        </CardFooter>
                      </AccordionContent>
                    </AccordionItem>
                  </Card>
                );
              })}
            </Accordion>

            {totalPages > 1 && (
              <nav className="mt-10 flex justify-center items-center gap-3" aria-label="Pagination">
                <Button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  <ChevronLeft className="mr-1.5 h-4 w-4" /> {t('pagination.previous')}
                </Button>
                <span className="min-w-[120px] text-center text-sm font-medium text-muted-foreground px-3 py-2 rounded-lg bg-muted/40">
                  {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                >
                  {t('pagination.next')} <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </nav>
            )}
          </>
        )}
      </div>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitleComponent>{t('admin.sentNotifications.archiveDialog.title')}</AlertDialogTitleComponent>
            <AlertDialogDescription>
              {t('admin.sentNotifications.archiveDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsArchiveDialogOpen(false)} disabled={isArchiving}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isArchiving} className={cn("bg-orange-500 hover:bg-orange-600")}>
              {isArchiving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('admin.sentNotifications.archiveDialog.confirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
