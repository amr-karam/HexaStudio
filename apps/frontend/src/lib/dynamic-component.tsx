import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";
interface DynamicComponentOptions {
  loading?: ReactNode;
  ssr?: boolean;
}
/** * Creates a lazily loaded component for heavy modules (e.g. 3D scenes). * Uses next/dynamic with SSR disabled by default for WebGL compatibility. */ export function createDynamicComponent<
  P extends object,
>(
  loader: () => Promise<{ default: ComponentType<P> }>,
  options: DynamicComponentOptions = {},
) {
  return dynamic(loader, {
    loading: () => options.loading ?? <div>Loading...</div>,
    ssr: options.ssr ?? false,
  });
}
