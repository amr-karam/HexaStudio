export default function BlogLoading() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-24">
      <div className="px-8 md:px-16">
        <div className="mb-24 animate-pulse">
          <div className="h-4 w-32 bg-surface-light rounded mb-6" />
          <div className="h-20 w-3/4 bg-surface-light rounded mb-8" />
          <div className="h-6 w-1/2 bg-surface-light/60 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[16/10] bg-surface-light rounded-sm mb-8" />
              <div className="h-3 w-20 bg-surface-light rounded mb-4" />
              <div className="h-6 w-3/4 bg-surface-light rounded mb-3" />
              <div className="h-4 w-full bg-surface-light/60 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
