'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-serif font-light text-gold/20 mb-6">404</div>
        <h1 className="text-2xl font-serif font-light text-foreground mb-3">Page Not Found</h1>
        <p className="text-secondary font-light mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/dashboard" passHref>
          <Button variant="primary" size="md" aria-label="Go to dashboard">
            <ArrowLeft size={14} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
