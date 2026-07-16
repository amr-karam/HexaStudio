import { Suspense } from 'react';
import { XRViewerClient } from './XRViewerClient';

export default function XRViewerPage() {
  return (
    <Suspense fallback={null}>
      <XRViewerClient />
    </Suspense>
  );
}
