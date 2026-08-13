import type { CloudSyncStatus } from '../types';

let currentSyncStatus: CloudSyncStatus = {
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  lastSyncedAt: Date.now() - 300000,
  isSyncing: false,
};

type SyncListener = (status: CloudSyncStatus) => void;
const syncListeners: Set<SyncListener> = new Set();

export function subscribeSyncStatus(listener: SyncListener) {
  syncListeners.add(listener);
  listener(currentSyncStatus);
  return () => syncListeners.delete(listener);
}

function notifyListeners() {
  syncListeners.forEach((l) => l({ ...currentSyncStatus }));
}

window.addEventListener('online', () => {
  currentSyncStatus.isOnline = true;
  notifyListeners();
  triggerAutoSync();
});

window.addEventListener('offline', () => {
  currentSyncStatus.isOnline = false;
  notifyListeners();
});

export function queueOfflineChange() {
  currentSyncStatus.pendingSyncCount += 1;
  notifyListeners();

  if (currentSyncStatus.isOnline) {
    triggerAutoSync();
  }
}

export function triggerAutoSync() {
  if (currentSyncStatus.isSyncing || !currentSyncStatus.isOnline) return;

  currentSyncStatus.isSyncing = true;
  notifyListeners();

  setTimeout(() => {
    currentSyncStatus.isSyncing = false;
    currentSyncStatus.pendingSyncCount = 0;
    currentSyncStatus.lastSyncedAt = Date.now();
    notifyListeners();
  }, 1200);
}
