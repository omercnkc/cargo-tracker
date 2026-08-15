import { useOfflineSyncStore } from '../store/offlineSync.store';
import { SyncEngineService } from '../services/syncEngine.service';

export const useOfflineSync = () => {
  const isOnline = useOfflineSyncStore((state) => state.isOnline);
  const pendingCount = useOfflineSyncStore((state) => state.pendingCount);
  const conflictCount = useOfflineSyncStore((state) => state.conflictCount);
  const syncStatus = useOfflineSyncStore((state) => state.syncStatus);
  const activeConflict = useOfflineSyncStore((state) => state.activeConflict);

  const triggerSync = () => {
    SyncEngineService.triggerSync();
  };

  return {
    isOnline,
    pendingCount,
    conflictCount,
    syncStatus,
    activeConflict,
    triggerSync,
  };
};
