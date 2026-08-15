import { useOfflineSyncStore } from '../features/offline/store/offlineSync.store';
import { SyncEngineService } from '../features/offline/services/syncEngine.service';

export function useNetworkStatus(onReconnectSync?: () => Promise<void>) {
  const isOnline = useOfflineSyncStore((state) => state.isOnline);
  const pendingCount = useOfflineSyncStore((state) => state.pendingCount);

  const refreshPendingCount = async () => {
    // State is dynamically synchronized via Zustand offlineSyncStore
  };

  const triggerSync = async () => {
    if (onReconnectSync) {
      await onReconnectSync();
    }
    SyncEngineService.triggerSync();
  };

  return {
    isOnline,
    pendingCount,
    refreshPendingCount,
    triggerSync,
  };
}
