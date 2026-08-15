import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { getDatabase } from '../features/offline/database/db';
import { runMigrations } from '../features/offline/database/migrations';

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CARGO_TRACKER_QUERY_OFFLINE_CACHE',
});

interface OfflinePersistProviderProps {
  children: React.ReactNode;
  client: QueryClient;
}

export const OfflinePersistProvider: React.FC<OfflinePersistProviderProps> = ({ children, client }) => {
  useEffect(() => {
    try {
      const db = getDatabase();
      runMigrations(db);
    } catch (e) {
      console.error('[Offline DB Initializer Hatası]:', e);
    }
  }, []);

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 gün önbellek kalıcılığı
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};
