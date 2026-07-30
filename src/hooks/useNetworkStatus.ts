import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { OfflineQueueService } from '../services/offline/offlineQueue';

export function useNetworkStatus(onReconnectSync?: () => Promise<void>) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refreshPendingCount = async () => {
    const queue = await OfflineQueueService.getQueue();
    setPendingCount(queue.length);
  };

  useEffect(() => {
    refreshPendingCount();

    const unsubscribe = NetInfo.addEventListener(async (state: NetInfoState) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);

      // İnternet bağlantısı sağlandığında kuyruğu işle
      if (online) {
        if (onReconnectSync) {
          await onReconnectSync();
        }
        await refreshPendingCount();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [onReconnectSync]);

  return {
    isOnline,
    pendingCount,
    refreshPendingCount,
  };
}
