"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, UserCheck, AlertCircle, ShieldAlert, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, CreditCard, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { approveUser, fetchPendingUsers, updateUserSubscription } from '@/actions/user-data-actions';
import type { UserProfile } from '@/types';
import { UserInfoCard } from '@/components/admin/UserInfoCard';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const USERS_PER_PAGE = 10;

export default function PendingUsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [dialogAction, setDialogAction] = useState<'approve' | 'subscription' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [newSubscriptionLevel, setNewSubscriptionLevel] = useState<UserProfile['subscriptionLevel']>('free');


  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  const fetchUsers = useCallback(async (page: number, callerUid: string) => {
    setIsLoadingUsers(true);
    setFetchError(null);
    try {
      const result = await fetchPendingUsers(page, USERS_PER_PAGE, callerUid);
      if (result.success && result.users) {
        setPendingUsers(result.users as UserProfile[]);
        setTotalCount(result.totalCount || 0);
      } else {
        throw new Error(result.error || t('admin.pendingUsers.errorFetchingList'));
      }
    } catch (error: any) {
      console.error("Error fetching pending users:", error);
      setFetchError(error.message);
    } finally {
      setIsLoadingUsers(false);
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
            fetchUsers(currentPage, user.uid);
          }
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
  }, [router, currentPage, fetchUsers]);

  const handleApprove = async () => {
    if (!selectedUser || !selectedUser.email || !selectedUser.id || !currentUser) return;
    setIsActionLoading(true);
    try {
      const result = await approveUser({
        userId: selectedUser.id,
        email: selectedUser.email,
        displayName: selectedUser.displayName,
        firstName: selectedUser.firstName
      }, currentUser.uid);

      if (result.success) {
        toast({
          title: t('admin.pendingUsers.approveSuccessTitle'),
          description: t('admin.pendingUsers.approveSuccessDesc', { email: selectedUser.email || selectedUser.id }),
          variant: 'success',
        });
        
        fetchUsers(currentPage, currentUser.uid); // Refresh data
      } else {
        throw new Error(result.message || t('admin.pendingUsers.approveErrorDesc'));
      }
    } catch (error: any) {
      console.error("Error approving user:", error);
      toast({
        title: t('toast.errorTitle'),
        description: error.message || t('admin.pendingUsers.approveErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsActionLoading(false);
      setDialogAction(null);
      setSelectedUser(null);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser || !newSubscriptionLevel || !currentUser) return;
    setIsActionLoading(true);
    const result = await updateUserSubscription(selectedUser.id!, newSubscriptionLevel, currentUser.uid);
    if (result.success) {
      toast({ title: "Success", description: `Subscription for ${selectedUser.displayName} has been updated to ${newSubscriptionLevel}.`, variant: 'success' });
      fetchUsers(currentPage, currentUser.uid); // Refresh data
    } else {
      toast({ title: "Error", description: result.message || "Failed to update subscription.", variant: 'destructive' });
    }
    setIsActionLoading(false);
    setDialogAction(null);
    setSelectedUser(null);
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
          {t('admin.accessDenied.backToDashboard')}
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <UserCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('nav.pendingUsers')}</h1>
        </div>
        <Button variant="outline" onClick={() => currentUser && fetchUsers(currentPage, currentUser.uid)} disabled={isLoadingUsers}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
          {t('admin.pendingUsers.refreshButton')}
        </Button>
      </div>
      <p className="text-muted-foreground mb-8">{t('admin.pendingUsers.description')}</p>

      {isLoadingUsers && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">{t('admin.pendingUsers.loadingUsers')}</p>
        </div>
      )}

      {!isLoadingUsers && fetchError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('toast.errorTitle')}</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {!isLoadingUsers && !fetchError && pendingUsers.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>{t('admin.pendingUsers.noPendingTitle')}</AlertTitle>
          <AlertDescription>{t('admin.pendingUsers.noPendingDesc')}</AlertDescription>
        </Alert>
      )}

      {!isLoadingUsers && !fetchError && pendingUsers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pendingUsers.map((user) => (
              <UserInfoCard key={user.id} user={user}>
                <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setNewSubscriptionLevel(user.subscriptionLevel || 'free'); setDialogAction('subscription'); }}><CreditCard className="mr-2 h-4 w-4"/>{t('admin.activeUsers.actions.subscription')}</Button>
                <Button variant="default" size="sm" onClick={() => { setSelectedUser(user); setDialogAction('approve'); }} className="bg-green-600 hover:bg-green-700">
                    <UserCheck className="mr-2 h-4 w-4" />
                    {t('admin.pendingUsers.approveButton')}
                </Button>
              </UserInfoCard>
          ))}
        </div>
      )}
      
      {!isLoadingUsers && totalPages > 1 && (
         <div className="mt-8 flex justify-center items-center gap-4">
          <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoadingUsers} variant="outline"><ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous')}</Button>
          <span className="text-sm text-muted-foreground">{t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}</span>
          <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoadingUsers} variant="outline">{t('pagination.next')} <ChevronRight className="ml-2 h-4 w-4" /></Button>
        </div>
      )}

      </div>
      <AlertDialog open={dialogAction === 'approve'} onOpenChange={(open) => !open && setDialogAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('admin.pendingUsers.dialogs.approveTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('admin.pendingUsers.dialogs.approveDescription', { email: selectedUser?.email || selectedUser?.id || 'user' })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isActionLoading}>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={handleApprove} disabled={isActionLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('admin.pendingUsers.dialogs.approveConfirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={dialogAction === 'subscription'} onOpenChange={(open) => !open && setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.activeUsers.dialogs.subscriptionTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.activeUsers.dialogs.subscriptionDescription', { name: selectedUser?.displayName || 'User' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="subscription-level">{t('admin.activeUsers.dialogs.subscriptionLabel')}</Label>
            <Select value={newSubscriptionLevel} onValueChange={(value) => setNewSubscriptionLevel(value as UserProfile['subscriptionLevel'])}>
              <SelectTrigger id="subscription-level">
                <SelectValue placeholder={t('admin.activeUsers.dialogs.subscriptionPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Trial">{t('settingsPage.plans.trial')}</SelectItem>
                <SelectItem value="Evaluator">{t('settingsPage.plans.evaluator')}</SelectItem>
                <SelectItem value="ECMINT">{t('settingsPage.plans.ecmint')}</SelectItem>
                <SelectItem value="free">{t('settingsPage.plans.free')}</SelectItem>
                <SelectItem value="basic">{t('settingsPage.plans.basic')}</SelectItem>
                <SelectItem value="premium">{t('settingsPage.plans.premium')}</SelectItem>
                <SelectItem value="Owner">{t('settingsPage.plans.owner')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUpdateSubscription}
              disabled={isActionLoading}
            >
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('admin.activeUsers.dialogs.subscriptionConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </>
  );
}