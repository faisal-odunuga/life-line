"use client";

import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="w-full rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 flex items-center gap-2">
      <WifiOff className="w-4 h-4 text-warning" />
      <p className="text-xs md:text-sm text-warning font-semibold">
        Offline mode: showing cached data. AI triage will use local fallback until connection is restored.
      </p>
    </div>
  );
}
