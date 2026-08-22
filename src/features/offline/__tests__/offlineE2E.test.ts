import { OfflineQueueRepository } from '../repositories/offlineQueue.repository';
import { SyncEngineService } from '../services/syncEngine.service';
import { RehydrationService } from '../services/rehydration.service';
import { PodStorageRepository } from '../repositories/podStorage.repository';
import { PodUploadService } from '../services/podUpload.service';
import { useOfflineSyncStore } from '../store/offlineSync.store';
import { closeDatabase, getDatabase } from '../database/db';
import { runMigrations } from '../database/migrations';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

jest.mock('expo-sqlite', () => {
  const store = new Map<string, any>();
  let userVersion = 0;

  return {
    openDatabaseSync: () => ({
      execSync: (sql: string) => {
        if (sql.includes('PRAGMA user_version =')) {
          const match = sql.match(/PRAGMA user_version = (\d+);/);
          if (match) userVersion = parseInt(match[1], 10);
        }
        if (sql.includes('DROP TABLE')) store.clear();
      },
      getFirstSync: (sql: string, params?: any[]) => {
        if (sql.includes('PRAGMA user_version')) return { user_version: userVersion };
        if (sql.includes('COUNT(*)')) {
          const count = Array.from(store.values()).filter(
            (item) => item.status === (params?.[1] || 'pending')
          ).length;
          return { count };
        }
        if (sql.includes('SELECT * FROM mutations WHERE id =')) {
          return store.get(params?.[0]) || null;
        }
        return null;
      },
      runSync: (sql: string, params?: any[]) => {
        if (sql.includes('INSERT OR REPLACE INTO mutations')) {
          const id = params?.[0];
          store.set(id, {
            id,
            user_id: params?.[1],
            idempotency_key: params?.[2],
            parent_mutation_id: params?.[3],
            type: params?.[4],
            payload: params?.[5],
            status: params?.[6],
            retry_count: params?.[7],
            maxRetries: params?.[8],
            created_at: params?.[12],
          });
        }
        if (sql.includes('DELETE FROM mutations')) {
          store.delete(params?.[0]);
        }
        return { changes: 1, lastInsertRowId: 1 };
      },
      getAllSync: (sql: string, params?: any[]) => {
        if (sql.includes('SELECT * FROM mutations')) {
          const userId = params?.[0];
          return Array.from(store.values()).filter((item) => item.user_id === userId);
        }
        return [];
      },
      closeSync: () => {},
    }),
  };
});

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock_dir/',
  readAsStringAsync: () => Promise.resolve('SGVsbG8gV29ybGQ='),
  getInfoAsync: () => Promise.resolve({ exists: true }),
  copyAsync: () => Promise.resolve(),
  deleteAsync: () => Promise.resolve(),
  EncodingType: { Base64: 'base64' },
}));

jest.mock('../../../services/supabase/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'e2e_user' } } }),
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'e2e_ship_1', base_version: 1 }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: [{ id: 'e2e_ship_1' }], error: null }),
        }),
      }),
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { id: 'e2e_ship_1', base_version: 1 }, error: null }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        list: () => Promise.resolve({ data: [], error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://supabase.co/mock_e2e.jpg' } }),
        upload: () => Promise.resolve({ data: {}, error: null }),
      }),
    },
  },
}));

describe('Offline-First Architecture E2E Verification', () => {
  beforeEach(() => {
    closeDatabase();
    const db = getDatabase();
    runMigrations(db);
    useOfflineSyncStore.setState({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 0,
      conflictCount: 0,
      activeConflict: null,
    });
  });

  it('Full E2E Flow: Offline Mutation Creation -> SQLite Storage -> Rehydration -> SyncEngine Execution', async () => {
    const mutation = OfflineQueueRepository.enqueueMutation({
      userId: 'e2e_user',
      idempotencyKey: 'idemp_e2e_001',
      mutation: {
        type: 'ADD_SHIPMENT',
        payload: {
          clientShipmentId: 'e2e_ship_001',
          trackingNumber: 'TR-E2E-100',
          carrierId: 'yurtici',
          title: 'E2E Test Kargo',
          createdAt: new Date().toISOString(),
        },
      },
    });

    expect(mutation.id).toBeDefined();
    expect(mutation.status).toBe('pending');

    const rawShipments: any[] = [];
    const rehydrated = RehydrationService.rehydrateUserShipments(rawShipments, 'e2e_user');
    expect(rehydrated).toHaveLength(1);
    expect(rehydrated[0].tracking_number).toBe('TR-E2E-100');
    expect(rehydrated[0].is_pending_sync).toBe(true);

    await SyncEngineService.triggerSync();
    expect(useOfflineSyncStore.getState().syncStatus).toBe('success');
  });

  it('POD Media Storage E2E: Local Save -> Pre-flight Check -> Storage Upload', async () => {
    const localResult = await PodStorageRepository.saveLocalPodImage('e2e_pod_1', 'file:///temp/camera.jpg');
    expect(localResult.localUri).toBeDefined();

    const uploadResult = await PodUploadService.uploadPodImage(
      {
        shipmentId: 'e2e_pod_1',
        localFileUri: localResult.localUri,
        mimeType: 'image/jpeg',
        capturedAt: new Date().toISOString(),
      },
      'e2e_user'
    );

    expect(uploadResult.publicUrl).toBeDefined();
  });

  afterAll(() => {
    closeDatabase();
  });
});
