export default function ContentPage() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-10 h-10 mx-auto mb-4 rounded-full border border-sl-glass-border flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <p className="font-['Bodoni_Moda'] text-base text-accent tracking-tight">Content</p>
        <p className="text-xs text-sl-silver mt-2 font-['JetBrains_Mono'] uppercase tracking-widest">Strapi Collections — Projects, Studio, Blog</p>
        <p className="text-[10px] text-sl-silver mt-4 font-['JetBrains_Mono']">Section ready — connect backend data to populate</p>
      </div>
    </main>
  );
}
