"use client";

import dynamic from "next/dynamic";

const AnimationDebug = dynamic(
  () => import("@/components/dev/AnimationDebug").then((mod) => mod.AnimationDebug),
  { ssr: false },
);

export function AnimationDebugLoader() {
  return <AnimationDebug />;
}
