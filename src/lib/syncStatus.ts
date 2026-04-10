const KEY_PREFIX = 'life-line-last-synced:';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function markPageSynced(pageKey: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(`${KEY_PREFIX}${pageKey}`, new Date().toISOString());
}

export function getPageLastSynced(pageKey: string): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(`${KEY_PREFIX}${pageKey}`);
}
