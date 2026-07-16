import { XRSessionMode, XRSessionStatus } from './xr-constants';

export async function checkXRSupport(): Promise<{
  ar: boolean;
  vr: boolean;
}> {
  if (typeof navigator === 'undefined' || !navigator.xr) {
    return { ar: false, vr: false };
  }

  const [ar, vr] = await Promise.all([
    navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
    navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
  ]);

  return { ar, vr };
}

export function getXRStatus(
  mode: XRSessionMode | null,
  status: XRSessionStatus,
  support: { ar: boolean; vr: boolean },
): { canEnter: boolean; reason?: string } {
  if (!mode) return { canEnter: false, reason: 'No mode selected' };
  if (status === 'active') return { canEnter: false, reason: 'Already in session' };
  if (!navigator.xr) return { canEnter: false, reason: 'WebXR not supported' };

  const supported = mode === 'ar' ? support.ar : support.vr;
  if (!supported) {
    return {
      canEnter: false,
      reason: `${mode.toUpperCase()} not supported on this device`,
    };
  }

  return { canEnter: true };
}
