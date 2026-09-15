import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Centre — Hexa Command Centre',
  robots: { index: false, follow: false },
};

export default function UploadPage() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full border border-sl-glass-border flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Upload Centre</p>
        <p className="text-xs text-sl-silver mt-2 font-['JetBrains_Mono'] uppercase tracking-widest">MinIO presigned uploads — per-project deliverables</p>
        <p className="text-[10px] text-sl-silver mt-4 font-['JetBrains_Mono']">Section ready — connect backend data to populate</p>
      </div>
    </main>
  );
}
