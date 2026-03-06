
"use client";

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auth } from '@/lib/firebase';
import { type User as FirebaseUser } from 'firebase/auth';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle as UIAlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Loader2, Mail, Send, ArrowLeft, Info, CheckCircle, Archive, Bell, ShieldAlert, AlertCircle as AlertCircleIcon, Search, UserSearch } from 'lucide-react';
import type { LucideIcon } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { NotificationType, UserProfile } from '@/types';
import { sendCustomNotification } from '@/actions/notification-actions';
import { fetchSimpleUserDetails, searchUsers } from '@/actions/user-data-actions';
import { UserInfoCard } from '@/components/admin/UserInfoCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface IconOption {
  value: string;
  label: string;
  IconComponent: LucideIcon;
}

const iconOptionsList: IconOption[] = [
  { value: 'Info', label: 'Info', IconComponent: Info },
  { value: 'AlertCircle', label: 'AlertCircle', IconComponent: AlertCircleIcon },
  { value: 'CheckCircle', label: 'CheckCircle', IconComponent: CheckCircle },
  { value: 'Archive', label: 'Archive', IconComponent: Archive },
  { value: 'Bell', label: 'Bell', IconComponent: Bell },
  { value: 'Mail', label: 'Mail', IconComponent: Mail },
];

const notificationTypeOptions: NotificationType[] = ['adminMessage', 'newFeature', 'systemAlert', 'issueReportUpdate'];

const getSendNotificationSchema = (t: (key: string) => string) => z.object({
  userId: z.string().min(1, t('admin.sendNotification.validation.userIdRequired')),
  title: z.string().min(1, t('admin.sendNotification.validation.titleRequired')).max(100, t('admin.sendNotification.validation.titleMaxLength')),
  message: z.string().min(1, t('admin.sendNotification.validation.messageRequired')).max(500, t('admin.sendNotification.validation.messageMaxLength')),
  type: z.custom<NotificationType>((val) => notificationTypeOptions.includes(val as NotificationType), {
    message: t('admin.sendNotification.validation.typeRequired'),
  }),
  link: z.string().url({ message: t('admin.sendNotification.validation.linkInvalid') }).optional().or(z.literal("")),
  icon: z.string().optional(),
});

type SendNotificationFormValues = z.infer<ReturnType<typeof getSendNotificationSchema>>;

export default function SendNotificationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <SendNotificationContent />
    </Suspense>
  );
}

function SendNotificationContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [isSending, setIsSending] = useState(false);

  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [fetchUserError, setFetchUserError] = useState<string | null>(null);

  // Name Search State
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [nameSearchResults, setNameSearchResults] = useState<any[]>([]);
  const [isNameSearching, setIsNameSearching] = useState(false);

  const sendNotificationSchema = getSendNotificationSchema(t);
  const form = useForm<SendNotificationFormValues>({
    resolver: zodResolver(sendNotificationSchema),
    defaultValues: {
      userId: '',
      title: '',
      message: '',
      type: 'adminMessage',
      link: '',
      icon: 'Info',
    },
  });

  const watchedUserId = form.watch('userId');

  useEffect(() => {
    if (auth.currentUser) {
      setCurrentUser(auth.currentUser);
    }
  }, []);

  useEffect(() => {
    const userIdFromQuery = searchParams.get('userId');
    if (userIdFromQuery && !form.getValues('userId')) {
      form.setValue('userId', userIdFromQuery);
    }
  }, [searchParams, form]);

  useEffect(() => {
    const fetchUser = async () => {
      if (watchedUserId && watchedUserId.length >= 20 && currentUser) {
        setIsFetchingUser(true);
        setTargetUser(null);
        setFetchUserError(null);
        try {
          const result = await fetchSimpleUserDetails(watchedUserId, currentUser.uid);
          if (result.success && result.user) {
            setTargetUser(result.user);
          } else {
            setTargetUser(null);
            setFetchUserError(result.error || t('admin.sendNotification.userNotFound'));
          }
        } catch (error: any) {
          console.error("Error fetching target user details:", error);
          setTargetUser(null);
          setFetchUserError(t('admin.sendNotification.errorFetchingEmail', { message: error.message }));
        } finally {
          setIsFetchingUser(false);
        }
      } else {
        setTargetUser(null);
        setFetchUserError(null);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUser();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [watchedUserId, t, currentUser]);

  const handleNameSearch = async () => {
    if (!currentUser || nameSearchTerm.length < 3) return;
    setIsNameSearching(true);
    const result = await searchUsers(nameSearchTerm, currentUser.uid);
    if (result.success) {
      setNameSearchResults(result.users || []);
    } else {
      toast({ variant: 'destructive', title: t('toast.errorTitle'), description: result.error });
    }
    setIsNameSearching(false);
  };

  const selectUserFromSearch = (user: any) => {
    form.setValue('userId', user.id);
    setIsSearchDialogOpen(false);
    setNameSearchTerm('');
    setNameSearchResults([]);
  };

  const onSubmit = async (data: SendNotificationFormValues) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: t('toast.errorTitle'), description: t('admin.accessDenied.description') });
      return;
    }

    setIsSending(true);
    try {
      if (!targetUser && !isFetchingUser) {
        toast({ variant: "destructive", title: t('toast.errorTitle'), description: t('admin.sendNotification.userNotFoundSendAttempt') });
        setIsSending(false);
        return;
      }

      const result = await sendCustomNotification({
        ...data,
        link: data.link || undefined,
        icon: data.icon || undefined,
      }, currentUser.uid);

      if (result.success) {
        toast({
          title: t('admin.sendNotification.toast.sendSuccessTitle'),
          description: t('admin.sendNotification.toast.sendSuccessDesc', { userId: data.userId }),
          variant: 'success'
        });
        form.reset({ userId: '', title: '', message: '', type: 'adminMessage', link: '', icon: 'Info' });
        setTargetUser(null);
        setFetchUserError(null);
      } else {
        toast({
          variant: "destructive",
          title: t('toast.errorTitle'),
          description: result.error || t('admin.sendNotification.toast.sendErrorDescGeneric')
        });
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        variant: "destructive",
        title: t('toast.errorTitle'),
        description: t('admin.sendNotification.toast.sendErrorDescGeneric') + (error.message ? `: ${error.message}` : '')
      });
    } finally {
      setIsSending(false);
    }
  };


  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button onClick={() => router.push('/admin/dashboard')} variant="outline" size="sm" className="mb-6 border-border/80">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.backToAdminDashboard')}
      </Button>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Mail className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('nav.sendNotification')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('admin.sendNotification.description')}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-8">
          <Card className="border-border/80 rounded-xl overflow-hidden shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/50">
              <CardTitle>{t('admin.sendNotification.formTitle')}</CardTitle>
              <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserSearch className="mr-2 h-4 w-4" />
                    {t('admin.sendNotification.searchByNameButton')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-xl">
                  <DialogHeader>
                    <DialogTitle>{t('admin.sendNotification.searchDialog.title')}</DialogTitle>
                    <DialogDescription>{t('admin.sendNotification.searchDialog.description')}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('admin.sendNotification.searchDialog.inputPlaceholder')}
                        value={nameSearchTerm}
                        onChange={(e) => setNameSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameSearch()}
                      />
                      <Button onClick={handleNameSearch} disabled={isNameSearching || nameSearchTerm.length < 3}>
                        {isNameSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    <ScrollArea className="h-64 border border-border/60 rounded-lg p-2 bg-muted/20">
                      {nameSearchResults.length === 0 && !isNameSearching ? (
                        <p className="text-center text-sm text-muted-foreground py-10">
                          {nameSearchTerm.length < 3 ? t('admin.searchUser.formLabel') : t('admin.sendNotification.searchDialog.noResults')}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {nameSearchResults.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 hover:bg-muted/80 rounded-lg cursor-pointer transition-colors border border-border/50 hover:border-primary/30"
                              onClick={() => selectUserFromSearch(user)}
                            >
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatarUrl} />
                                  <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
                                </Avatar>
                                <div className="text-left">
                                  <p className="text-sm font-medium">{user.displayName}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">{t('admin.sendNotification.searchDialog.selectButton')}</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="space-y-6 px-6 py-5">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="user-id-notification">{t('admin.sendNotification.userIdLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input id="user-id-notification" placeholder={t('admin.sendNotification.userIdPlaceholder')} {...field} className="font-mono text-sm pr-10" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isFetchingUser ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <Search className="h-4 w-4 text-muted-foreground" />}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {fetchUserError && !isFetchingUser && (
                <Alert variant="destructive" className="mt-2 rounded-lg">
                  <AlertCircleIcon className="h-4 w-4" />
                  <UIAlertTitle>{t('toast.errorTitle')}</UIAlertTitle>
                  <AlertDescription>{fetchUserError}</AlertDescription>
                </Alert>
              )}
              {targetUser && !isFetchingUser && !fetchUserError && (
                <div className="mt-4">
                  <UserInfoCard user={targetUser} />
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.sendNotification.titleLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('admin.sendNotification.titlePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.sendNotification.messageLabel')}</FormLabel>
                    <FormControl>
                      <Textarea rows={4} placeholder={t('admin.sendNotification.messagePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.sendNotification.typeLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.sendNotification.typePlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {notificationTypeOptions.map(type => (
                            <SelectItem key={type} value={type}>
                              {t(`admin.sendNotification.notificationTypes.${type}`, { defaultValue: type })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('admin.sendNotification.iconLabel')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.sendNotification.iconPlaceholder')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {iconOptionsList.map(({ value, label, IconComponent }) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.sendNotification.linkLabel')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('admin.sendNotification.linkPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pt-6 border-t border-border/50 bg-muted/20 dark:bg-muted/10">
              <Button type="submit" className="w-full h-11 font-semibold" disabled={isSending || isFetchingUser || !targetUser || !currentUser}>
                {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send className="mr-2 h-4 w-4" /> {t('admin.sendNotification.sendButton')}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
