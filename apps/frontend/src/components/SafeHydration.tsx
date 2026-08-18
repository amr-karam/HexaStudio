
"use client";

import React, { useState, useEffect } from "react";

export function SafeHydration({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or null to prevent server/client mismatch
    return null; 
  }

  return <>{children}</>;
}

