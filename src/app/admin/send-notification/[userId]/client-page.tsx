"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { fetchUserWithNotifications } from "@/actions/notification-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Bell, Mail } from "lucide-react";
import type { Notification, UserProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { UserInfoCard } from "@/components/admin/UserInfoCard";

const formatTimestamp = (isoString: string | null | undefined): string => {
  if (!isoString) return 'N/A';
  try {
    return format(new Date(isoString), "dd/MM/yyyy, HH:mm:ss");
  } catch (e) {
    return 'Invalid Date';
  }
};

export default function UserNotificationsHistoryClientPage({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!userId) {
      setError("User ID is missing from the URL.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchUserWithNotifications(userId);
      if (result.success) {
        setUser(result.user);
        setNotifications(result.notifications || []);
      } else {
        throw new Error(result.error || "Failed to fetch user history.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.push('/admin/sent-notifications')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.userNotificationsHistory.backToSentNotifications')}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t('toast.errorTitle')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {user && (
        <div className="mb-8">
          <UserInfoCard user={user} />
        </div>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Bell className="h-7 w-7 text-primary" />
              {t('admin.userNotificationsHistory.title')}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/send-notification?userId=${userId}`)}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t('admin.userNotificationsHistory.sendNewButton')}
            </Button>
          </div>
          <CardDescription>{t('admin.userNotificationsHistory.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <Card key={notification.id} className="shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold break-all">
                          {t(notification.titleKey, notification.messageParams)}
                      </CardTitle>
                      <Badge variant={notification.status === 'read' ? 'secondary' : 'default'}>
                          {notification.status}
                      </Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                      {t('admin.userNotificationsHistory.sentLabel')}{formatTimestamp(notification.createdAt as string)}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t(notification.messageKey, notification.messageParams)}</p>
                </CardContent>
              </Card>
            ))
          ) : (
            !error && <p className="text-center text-muted-foreground py-8">{t('admin.userNotificationsHistory.noNotifications')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
