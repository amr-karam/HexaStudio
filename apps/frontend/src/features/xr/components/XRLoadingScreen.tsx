'use client';

import { Html } from '@react-three/drei';
import { useXRStore } from '../store/xr-store';

export function XRLoadingScreen({ modelName }: { modelName?: string }) {
  const progress = useXRStore((s) => s.modelProgress);

  return (
    <Html center>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />
          <div className="absolute inset-0 animate-ping rounded-full border border-[#D4AF37]/30" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-white/60">
            {modelName ? `Loading ${modelName}...` : 'Loading 3D model...'}
          </p>
          {progress > 0 && progress < 1 && (
            <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#D4AF37] transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Html>
  );
}
