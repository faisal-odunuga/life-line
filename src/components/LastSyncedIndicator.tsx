"use client";

import React, { useEffect, useState } from 'react';
import { getPageLastSynced, markPageSynced } from '@/lib/syncStatus';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

interface LastSyncedIndicatorProps {
  pageKey: string;
  shouldMarkSynced: boolean;
}

export function LastSyncedIndicator({ pageKey, shouldMarkSynced }: LastSyncedIndicatorProps) {
  const isOnline = useOnlineStatus();
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  useEffect(() => {
    setLastSyncedAt(getPageLastSynced(pageKey));
  }, [pageKey]);

  useEffect(() => {
    if (!isOnline || !shouldMarkSynced) return;
    markPageSynced(pageKey);
    setLastSyncedAt(getPageLastSynced(pageKey));
  }, [isOnline, shouldMarkSynced, pageKey]);

  return (
    <p className="text-[11px] text-on-surface-variant">
      {lastSyncedAt ? `Last synced: ${new Date(lastSyncedAt).toLocaleString()}` : 'Last synced: not yet'}
    </p>
  );
}
