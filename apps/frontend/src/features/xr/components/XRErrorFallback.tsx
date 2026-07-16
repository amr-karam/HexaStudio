'use client';

export function XRErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0A0A0A]">
      <div className="max-w-md text-center">
        <h2 className="mb-2 text-xl font-semibold text-red-400">
          XR Viewer Error
        </h2>
        <p className="mb-4 text-sm text-white/60">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[#D4AF37] px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-[#C49A2F]"
        >
          Reload
        </button>
      </div>
    </div>
  );
}
