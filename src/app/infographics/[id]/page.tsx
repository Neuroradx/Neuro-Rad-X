import InfographicClientPage from './client-page';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function InfographicDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <InfographicClientPage infographicId={params.id} />
    </Suspense>
  );
}
