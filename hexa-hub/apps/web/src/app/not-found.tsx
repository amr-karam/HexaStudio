'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void-deep flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-serif font-light text-gold/20 mb-6">404</div>
        <h1 className="text-2xl font-serif font-light text-foreground mb-3">Page Not Found</h1>
        <p className="text-tertiary font-light mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild variant="gold">
          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <ArrowLeft size={14} />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
