import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineSyncStore } from '../store/offlineSync.store';
import { SyncEngineService } from '../services/syncEngine.service';

/**
 * Cihazın ağ bağlantısını dinleyen ve internet geldiğinde senkronizasyonu otomatik tetikleyen hook.
 */
export const useNetworkStatus = () => {
  const setIsOnline = useOfflineSyncStore((state) => state.setIsOnline);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);

      setIsOnline(isOnline);

      // Offline durumundan Online duruma geçiş yapıldığında otomatik senkronizasyonu başlat
      if (isOnline && wasOffline.current) {
        console.log('[useNetworkStatus] İnternet bağlantısı geri geldi. Senkronizasyon otomatik tetikleniyor...');
        SyncEngineService.triggerSync();
      }

      wasOffline.current = !isOnline;
    });

    // İlk mount anında ağ durumunu kontrol et
    NetInfo.fetch().then((state) => {
      const isOnline = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(isOnline);
      if (!isOnline) {
        wasOffline.current = true;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setIsOnline]);
};
