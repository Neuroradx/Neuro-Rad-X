"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  } catch(e) {
    return 'Invalid Date';
  }
};

export default function SentNotificationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userIsAdmin = userDoc.exists() && userDoc.data()?.role === 'admin';
          setIsAdmin(userIsAdmin);
          if (userIsAdmin) {
            fetchData(currentPage, user.uid);
          }
        } catch (error) {
          setIsAdmin(false);
          setFetchError("Error verifying admin status.");
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router, currentPage, fetchData]);

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

  if (isAuthLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && !isAuthLoading) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t('admin.accessDenied.title')}</AlertTitle>
          <AlertDescription>{fetchError || t('admin.accessDenied.description')}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />{t('admin.accessDenied.backToDashboard')}
        </Button>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto py-8">
      <Button variant="outline" className="mb-6" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
      </Button>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('admin.sentNotifications.title')}</h1>
        </div>
        <Button variant="outline" onClick={() => currentUser && fetchData(currentPage, currentUser.uid)} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {t('admin.sentNotifications.refreshButton')}
        </Button>
      </div>
      <p className="text-muted-foreground mb-10">{t('admin.sentNotifications.description')}</p>

      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">{t('admin.sentNotifications.loading')}</p>
        </div>
      )}

      {!isLoading && fetchError && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t('toast.errorTitle')}</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !fetchError && notifications.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>{t('admin.sentNotifications.noNotificationsTitle')}</AlertTitle>
          <AlertDescription>{t('admin.sentNotifications.noNotificationsDesc')}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !fetchError && notifications.length > 0 && (
        <>
          <Accordion type="multiple" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {notifications.map((notification) => {
              const user = notification.userProfile;
              let avatarFallback = '?';
                if (user && user.displayName && user.displayName.trim()) {
                    const nameParts = user.displayName.trim().split(/\s+/);
                    avatarFallback = (nameParts[0]?.[0] || '' + (nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0] || '' : '')).toUpperCase();
                } else if (user && user.email) {
                    avatarFallback = user.email[0].toUpperCase();
                }

              const params = { ...notification.messageParams };
              if (notification.type === 'issueReportUpdate') {
                  const statusKey = notification.messageParams?.statusKey;
                  if (statusKey) {
                      params.statusValue = t(`admin.reportedQuestionsPage.statusValues.${statusKey}`);
                  }
              }

              const translatedTitle = t(notification.titleKey, params);
              const translatedMessage = t(notification.messageKey, params);


              return (
                <Card key={notification.id} className="shadow-sm">
                  <AccordionItem value={notification.id} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline rounded-t-lg">
                      <div className="flex items-center gap-4 text-left w-full">
                        <Avatar className="h-12 w-12 border">
                          <AvatarImage src={user?.avatarUrl} alt={user?.displayName || 'User Avatar'} />
                          <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{user?.displayName || `User ID: ${notification.userId}`}</p>
                          <p className="text-sm text-muted-foreground truncate">{translatedTitle}</p>
                        </div>
                         <Badge variant={notification.status === 'read' ? 'secondary' : 'default'} className="ml-auto shrink-0">{notification.status}</Badge>
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
                      <div className="px-4 pb-4 border-t pt-4 space-y-2">
                        <h3 className="font-semibold text-primary break-all">{translatedTitle}</h3>
                        <p className="text-sm text-muted-foreground break-words">{translatedMessage}</p>
                        {notification.link && <p className="text-xs text-muted-foreground break-all">Link: <a href={notification.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{notification.link}</a></p>}
                      </div>
                      <CardFooter className="flex justify-between items-center p-3 border-t bg-muted/30 rounded-b-lg mt-auto">
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
            <div className="mt-8 flex justify-center items-center gap-4">
              <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoading} variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous')}
              </Button>
              <span className="text-sm text-muted-foreground">
                {t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}
              </span>
              <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoading} variant="outline">
                {t('pagination.next')} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
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
