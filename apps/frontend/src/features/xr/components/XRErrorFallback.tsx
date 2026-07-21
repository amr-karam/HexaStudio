'use client';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface XRErrorFallbackProps {
  error: Error;
  /** Optional project cover image for visual fallback. */
  coverImage?: string;
  /** Project name for context. */
  projectName?: string;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function XRErrorFallback({
  error,
  coverImage,
  projectName,
}: XRErrorFallbackProps) {
  const handleReload = () => window.location.reload();

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0A0A0A]">
      {/* Background image (if provided). */}
      {coverImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${coverImage})` }}
        />
      )}

      <div className="relative z-10 max-w-md text-center px-6">
        {/* Icon */}
        <div className="w-14 h-14 mx-auto mb-5 border border-white/10 flex items-center justify-center rounded-lg bg-white/5">
          <svg
            className="w-7 h-7 text-[#D4AF37]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-lg font-medium text-white/80">
          AR/VR Not Available
        </h2>

        {/* Project name */}
        {projectName && (
          <p className="mb-3 text-xs uppercase tracking-widest text-[#D4AF37]">
            {projectName}
          </p>
        )}

        {/* Message */}
        <p className="mb-6 text-sm text-white/50 leading-relaxed">
          AR/VR is not available in this browser or on this device.
          {error.message && (
            <span className="block mt-2 text-xs text-white/30">
              {error.message}
            </span>
          )}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleReload}
            className="rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-[#C49A2F] active:scale-95"
          >
            Try Again
          </button>
          <p className="text-xs text-white/30">
            You can still view the 3D model in the standard viewer.
          </p>
        </div>
      </div>
    </div>
  );
}
