"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ErrorAlert } from '@/components/ui/error-alert';
import { Loader2, UserCheck, AlertCircle, ShieldAlert, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, CreditCard, ArrowLeft, Trash2 } from 'lucide-react';
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
import { approveUser, fetchPendingUsers, updateUserSubscription, deleteUserAndTheirData, blockUser } from '@/actions/user-data-actions';
import type { UserProfile } from '@/types';
import { UserInfoCard } from '@/components/admin/UserInfoCard';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const USERS_PER_PAGE = 10;

export default function PendingUsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [dialogAction, setDialogAction] = useState<'approve' | 'subscription' | 'delete' | 'block' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [newSubscriptionLevel, setNewSubscriptionLevel] = useState<UserProfile['subscriptionLevel']>('free');


  const totalPages = Math.ceil(totalCount / USERS_PER_PAGE);

  const fetchUsers = useCallback(async (page: number, callerUid: string) => {
    console.log('[PendingUsers] fetchUsers called for page:', page, 'by UID:', callerUid);
    setIsLoadingUsers(true);
    setFetchError(null);
    try {
      const result = await fetchPendingUsers(page, USERS_PER_PAGE, callerUid);
      console.log('[PendingUsers] API result:', result);
      if (result.success && result.users) {
        setPendingUsers(result.users as UserProfile[]);
        setTotalCount(result.totalCount || 0);
      } else {
        const errorMsg = result.error || t('admin.pendingUsers.errorFetchingList');
        console.error('[PendingUsers] API Failure:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error("[PendingUsers] Error fetching pending users:", error);
      setFetchError(error.message);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [t]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser(user);
      fetchUsers(currentPage, user.uid);
    }
  }, [currentPage, fetchUsers]);

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

  const handleDelete = async () => {
    if (!selectedUser || dialogAction !== 'delete' || !currentUser) return;
    setIsActionLoading(true);
    try {
      const result = await deleteUserAndTheirData(selectedUser.id!, currentUser.uid);
      if (result.success) {
        toast({
          title: t('toast.accountDeletedSuccessTitle'),
          description: t('toast.accountDeletedSuccessDescription'),
          variant: 'success',
          duration: 8000,
        });
        fetchUsers(currentPage, currentUser.uid);
      } else {
        toast({
          title: t('toast.errorTitle'),
          description: result.message || t('toast.accountDeleteErrorTitle'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsActionLoading(false);
      setDialogAction(null);
      setSelectedUser(null);
    }
  };

  const handleBlock = async () => {
    if (!selectedUser || dialogAction !== 'block' || !currentUser) return;
    setIsActionLoading(true);
    try {
      const result = await blockUser(selectedUser.id!, currentUser.uid);
      if (result.success) {
        toast({
          title: t('admin.pendingUsers.blockSuccessTitle'),
          description: t('admin.pendingUsers.blockSuccessDesc', { email: selectedUser.email || selectedUser.id }),
          variant: 'success',
        });
        fetchUsers(currentPage, currentUser.uid);
      } else {
        toast({
          title: t('toast.errorTitle'),
          description: result.message || t('admin.pendingUsers.blockErrorDesc'),
          variant: 'destructive',
        });
      }
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



  return (
    <>
      <div className="container mx-auto py-8 max-w-6xl">
        <Button variant="outline" size="sm" className="mb-6 border-border/80 rounded-lg" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
        </Button>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('nav.pendingUsers')}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{t('admin.pendingUsers.description')}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-lg shrink-0" onClick={() => currentUser && fetchUsers(currentPage, currentUser.uid)} disabled={isLoadingUsers}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            {t('admin.pendingUsers.refreshButton')}
          </Button>
        </div>

        {isLoadingUsers && (
          <div className="flex flex-col justify-center items-center py-16 rounded-xl border border-border/60 bg-muted/20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">{t('admin.pendingUsers.loadingUsers')}</p>
          </div>
        )}

        {!isLoadingUsers && fetchError && (
          <ErrorAlert description={fetchError} className="rounded-xl" />
        )}

        {!isLoadingUsers && !fetchError && pendingUsers.length === 0 && (
          <Alert className="rounded-xl border-border/60">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>{t('admin.pendingUsers.noPendingTitle')}</AlertTitle>
            <AlertDescription>{t('admin.pendingUsers.noPendingDesc')}</AlertDescription>
          </Alert>
        )}

        {!isLoadingUsers && !fetchError && pendingUsers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingUsers.map((user) => (
              <UserInfoCard key={user.id} user={user}>
                <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setNewSubscriptionLevel(user.subscriptionLevel || 'free'); setDialogAction('subscription'); }}><CreditCard className="mr-2 h-4 w-4" />{t('admin.activeUsers.actions.subscription')}</Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setDialogAction('block'); }}>
                  <ShieldAlert className="mr-2 h-4 w-4 text-red-600" />
                  {t('admin.pendingUsers.blockButton')}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => { setSelectedUser(user); setDialogAction('delete'); }}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('admin.pendingUsers.deleteButton')}
                </Button>
                <Button variant="default" size="sm" onClick={() => { setSelectedUser(user); setDialogAction('approve'); }} className="bg-green-600 hover:bg-green-700">
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t('admin.pendingUsers.approveButton')}
                </Button>
              </UserInfoCard>
            ))}
          </div>
        )}

        {!isLoadingUsers && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-4 py-4 px-4 rounded-xl bg-muted/20 border border-border/50">
            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || isLoadingUsers} variant="outline" size="sm" className="rounded-lg"><ChevronLeft className="mr-2 h-4 w-4" /> {t('pagination.previous')}</Button>
            <span className="text-sm text-muted-foreground font-medium">{t('pagination.page')} {currentPage} {t('pagination.of')} {totalPages}</span>
            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || isLoadingUsers} variant="outline" size="sm" className="rounded-lg">{t('pagination.next')} <ChevronRight className="ml-2 h-4 w-4" /></Button>
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

      <AlertDialog open={dialogAction === 'delete' || dialogAction === 'block'} onOpenChange={(open) => !open && setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogAction === 'delete'
                ? t('admin.pendingUsers.dialogs.deleteTitle')
                : t('admin.pendingUsers.dialogs.blockTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'delete'
                ? t('admin.pendingUsers.dialogs.deleteDescription', { email: selectedUser?.email || selectedUser?.id || 'user' })
                : t('admin.pendingUsers.dialogs.blockDescription', { email: selectedUser?.email || selectedUser?.id || 'user' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={dialogAction === 'delete' ? handleDelete : handleBlock}
              disabled={isActionLoading}
              className={dialogAction === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogAction === 'delete'
                ? t('admin.pendingUsers.dialogs.deleteConfirm')
                : t('admin.pendingUsers.dialogs.blockConfirm')}
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