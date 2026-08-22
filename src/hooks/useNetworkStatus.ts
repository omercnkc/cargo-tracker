import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineSyncStore } from '../features/offline/store/offlineSync.store';
import { SyncEngineService } from '../features/offline/services/syncEngine.service';

export function useNetworkStatus(onReconnectSync?: () => Promise<void>) {
  const isOnline = useOfflineSyncStore((state) => state.isOnline);
  const setIsOnline = useOfflineSyncStore((state) => state.setIsOnline);
  const pendingCount = useOfflineSyncStore((state) => state.pendingCount);
  const syncStatus = useOfflineSyncStore((state) => state.syncStatus);
  const wasOffline = useRef(false);

  const checkAndSetOnline = useCallback((online: boolean) => {
    setIsOnline(online);
    if (online && wasOffline.current) {
      if (onReconnectSync) {
        onReconnectSync().catch(console.error);
      }
      SyncEngineService.triggerSync();
    }
    wasOffline.current = !online;
  }, [setIsOnline, onReconnectSync]);

  useEffect(() => {
    // 1. Web-specific event listeners for instant responsiveness in browser
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => checkAndSetOnline(true);
      const handleOffline = () => checkAndSetOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
        checkAndSetOnline(navigator.onLine);
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // 2. NetInfo for Native (iOS / Android) and standard NetInfo subscriber
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      checkAndSetOnline(online);
    });

    NetInfo.fetch().then((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      checkAndSetOnline(online);
    });

    return () => {
      unsubscribe();
    };
  }, [checkAndSetOnline]);

  const triggerSync = async () => {
    if (onReconnectSync) {
      await onReconnectSync();
    }
    SyncEngineService.triggerSync();
  };

  return {
    isOnline,
    pendingCount,
    syncStatus,
    triggerSync,
  };
}
