import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
      <FileQuestion className="h-24 w-24 text-primary mb-6 animate-pulse" />
      <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Oops! The page you are looking for doesn't exist or has been moved. 
        Maybe the neuro-pathway was blocked?
      </p>
      <Button asChild size="lg">
        <Link href="/dashboard">Back to Dashboard</Link>
      </Button>
    </div>
  );
}
