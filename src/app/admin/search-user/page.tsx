"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from '@/hooks/use-translation';
import { useToast } from '@/hooks/use-toast';
import { searchUsers, resetUserStatistics, deleteUserAndTheirData, updateUserSubscription } from '@/actions/user-data-actions';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types';
import { UserInfoCard } from '@/components/admin/UserInfoCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { Loader2, Search, AlertCircle, UserSearch, Mail, DatabaseZap, Trash2, Bell, ShieldAlert, ArrowLeft, CreditCard } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const searchSchema = z.object({
  searchTerm: z.string().min(3, "Search term must be at least 3 characters long."),
});

type SearchFormValues = z.infer<typeof searchSchema>;
type UserSearchResult = NonNullable<Awaited<ReturnType<typeof searchUsers>>['users']>[0];

export default function SearchUserPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogAction, setDialogAction] = useState<'reset' | 'delete' | 'subscription' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [newSubscriptionLevel, setNewSubscriptionLevel] = useState<UserProfile['subscriptionLevel']>('free');


  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { searchTerm: "" },
  });

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
          setError("Could not verify admin permissions.");
        }
      } else {
        setIsAdmin(false);
        router.push('/auth/login');
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSearch = async (data: SearchFormValues) => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    const result = await searchUsers(data.searchTerm, currentUser.uid);
    if (result.success && result.users) {
      setSearchResults(result.users);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  };
  
  const handleReset = async () => {
    if (!selectedUser || dialogAction !== 'reset' || !currentUser) return;
    setIsActionLoading(true);
    const result = await resetUserStatistics(selectedUser.id, currentUser.uid);
    if (result.success) {
      toast({ title: t('toast.statsResetSuccessTitle'), description: `Statistics for ${selectedUser.displayName} have been reset.`, variant: 'success' });
      form.handleSubmit(handleSearch)();
    } else {
      toast({ title: t('toast.errorTitle'), description: result.message || t('toast.statsResetErrorDesc'), variant: 'destructive' });
    }
    setIsActionLoading(false);
    setDialogAction(null);
    setSelectedUser(null);
  };
  
  const handleDelete = async () => {
    if (!selectedUser || dialogAction !== 'delete' || !currentUser) return;
    setIsActionLoading(true);
    const result = await deleteUserAndTheirData(selectedUser.id, currentUser.uid);
    if (result.success) {
      toast({ title: t('toast.accountDeletedSuccessTitle'), description: `Firestore data for ${selectedUser.displayName} has been deleted. Remember to delete them from Firebase Auth manually.`, variant: 'success', duration: 10000 });
      setSearchResults(prev => prev.filter(u => u.id !== selectedUser.id));
    } else {
      toast({ title: t('toast.errorTitle'), description: result.message || t('toast.accountDeleteErrorTitle'), variant: 'destructive' });
    }
    setIsActionLoading(false);
    setDialogAction(null);
    setSelectedUser(null);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser || !newSubscriptionLevel || !currentUser) return;
    setIsActionLoading(true);
    const result = await updateUserSubscription(selectedUser.id!, newSubscriptionLevel, currentUser.uid);
    if (result.success) {
      toast({ title: "Success", description: `Subscription for ${selectedUser.displayName} has been updated to ${newSubscriptionLevel}.`, variant: 'success' });
      form.handleSubmit(handleSearch)();
    } else {
      toast({ title: "Error", description: result.message || "Failed to update subscription.", variant: 'destructive' });
    }
    setIsActionLoading(false);
    setDialogAction(null);
    setSelectedUser(null);
  };

  if (isAuthLoading) {
    return <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>{t('admin.accessDenied.title')}</AlertTitle>
          <AlertDescription>{error || t('admin.accessDenied.description')}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
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
        <div className="flex items-center gap-3 mb-4">
          <UserSearch className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">{t('admin.searchUser.title')}</h1>
        </div>
        <p className="text-muted-foreground mb-8">{t('admin.searchUser.description')}</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('admin.searchUser.cardTitle')}</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSearch)}>
              <CardContent>
                <FormField
                  control={form.control}
                  name="searchTerm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="search-term">{t('admin.searchUser.formLabel')}</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input id="search-term" placeholder={t('admin.searchUser.placeholder')} {...field} />
                        </FormControl>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                          <span className="sr-only sm:not-sr-only sm:ml-2">{t('admin.searchUser.searchButton')}</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </form>
          </Form>
        </Card>

        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {!isLoading && searchResults.length === 0 && form.formState.isSubmitted && (
            <p className="text-center text-muted-foreground py-6 lg:col-span-2">{t('admin.searchUser.noResults')}</p>
          )}

          {searchResults.map(user => (
            <UserInfoCard key={user.id} user={user}>
              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/sent-notifications/${user.id}`)}>
                  <Bell className="mr-2 h-4 w-4"/>
                  {t('admin.activeUsers.actions.notifications', {count: user.notificationCount ?? 0})}
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push(`/admin/send-notification?userId=${user.id}`)}><Mail className="mr-2 h-4 w-4"/>{t('admin.activeUsers.actions.notify')}</Button>
              <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setNewSubscriptionLevel(user.subscriptionLevel || 'free'); setDialogAction('subscription'); }}><CreditCard className="mr-2 h-4 w-4"/>{t('admin.activeUsers.actions.subscription')}</Button>
              <Button variant="outline" size="sm" onClick={() => { setSelectedUser(user); setDialogAction('reset'); }}><DatabaseZap className="mr-2 h-4 w-4"/>{t('admin.activeUsers.actions.resetStats')}</Button>
              <Button variant="destructive" size="sm" onClick={() => { setSelectedUser(user); setDialogAction('delete'); }}><Trash2 className="mr-2 h-4 w-4"/>{t('admin.activeUsers.actions.deleteData')}</Button>
            </UserInfoCard>
          ))}
        </div>
      </div>
      
      <AlertDialog open={dialogAction === 'reset' || dialogAction === 'delete'} onOpenChange={(open) => !open && setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dialogAction === 'reset' ? t('admin.activeUsers.dialogs.resetTitle') : t('admin.activeUsers.dialogs.deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogAction === 'reset' 
                ? t('admin.activeUsers.dialogs.resetDescription', { name: selectedUser?.displayName })
                : t('admin.activeUsers.dialogs.deleteDescription', { name: selectedUser?.displayName })
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionLoading}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={dialogAction === 'reset' ? handleReset : handleDelete} 
              disabled={isActionLoading}
              className={dialogAction === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {isActionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogAction === 'reset' ? t('admin.activeUsers.dialogs.resetConfirm') : t('admin.activeUsers.dialogs.deleteConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={dialogAction === 'subscription'} onOpenChange={(open) => !open && setDialogAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.activeUsers.dialogs.subscriptionTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.activeUsers.dialogs.subscriptionDescription', { name: selectedUser?.displayName })}
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
            <AlertDialogCancel disabled={isActionLoading} onClick={() => {setDialogAction(null); setSelectedUser(null);}}>{t('common.cancel')}</AlertDialogCancel>
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