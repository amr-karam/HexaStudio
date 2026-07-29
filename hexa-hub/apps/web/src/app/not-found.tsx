'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-serif font-light text-[#D4A843]/20 mb-6">404</div>
        <h1 className="text-2xl font-serif font-light text-white mb-3">Page Not Found</h1>
        <p className="text-[#888] font-light mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/dashboard">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0A0A] rounded-lg text-sm font-medium hover:bg-[#D4A843]/90 transition-all cursor-pointer">
            <ArrowLeft size={14} />
            Back to Dashboard
          </span>
        </Link>
      </div>
    </div>
  );
}
