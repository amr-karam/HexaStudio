'use client';

import { useEffect } from 'react';
import { useXRStore } from '../store/xr-store';
import { checkXRSupport } from '../utils/xr-guard';

export function useXRStoreInit() {
  const setSupported = useXRStore((s) => s.setSupported);

  useEffect(() => {
    checkXRSupport().then((support) => {
      setSupported(support.ar || support.vr);
    });
  }, [setSupported]);
}
