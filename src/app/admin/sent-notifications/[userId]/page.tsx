import UserNotificationsHistoryClientPage from './client-page';

// This is a Server Component
export default async function UserNotificationsHistoryPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <UserNotificationsHistoryClientPage userId={userId} />;
}
