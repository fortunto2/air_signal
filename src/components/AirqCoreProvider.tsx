'use client';

import { useEffect } from 'react';
import { initAirqCore } from '@/lib/airq-core';

export function AirqCoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAirqCore();
  }, []);

  return <>{children}</>;
}
