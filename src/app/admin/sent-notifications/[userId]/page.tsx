import UserNotificationsHistoryClientPage from './client-page';

// This is a Server Component
export default function UserNotificationsHistoryPage({ params }: { params: { userId: string } }) {
  return <UserNotificationsHistoryClientPage userId={params.userId} />;
}
