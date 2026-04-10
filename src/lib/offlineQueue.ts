export type OfflineMutationType = 'create-triage' | 'create-record';

export interface OfflineMutation {
  id: string;
  type: OfflineMutationType;
  payload: Record<string, unknown>;
  createdAt: string;
  retries: number;
}

const QUEUE_KEY = 'life-line-offline-mutations';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getOfflineQueue(): OfflineMutation[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OfflineMutation[];
  } catch {
    return [];
  }
}

export function setOfflineQueue(queue: OfflineMutation[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineMutation(type: OfflineMutationType, payload: Record<string, unknown>) {
  const queue = getOfflineQueue();
  const item: OfflineMutation = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    payload,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  queue.push(item);
  setOfflineQueue(queue);
  return item;
}

export function removeOfflineMutation(id: string) {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  setOfflineQueue(queue);
}

export function incrementOfflineRetry(id: string) {
  const queue = getOfflineQueue().map((item) => {
    if (item.id !== id) return item;
    return { ...item, retries: item.retries + 1 };
  });
  setOfflineQueue(queue);
}
