import { SyncEngineService } from '../syncEngine.service';
import { useOfflineSyncStore } from '../../store/offlineSync.store';

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock_dir/',
  readAsStringAsync: () => Promise.resolve('SGVsbG8gV29ybGQ='),
  getInfoAsync: () => Promise.resolve({ exists: true }),
  deleteAsync: () => Promise.resolve(),
  EncodingType: { Base64: 'base64' },
}));

// Mock Supabase
jest.mock('../../../../services/supabase/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({
        data: { user: { id: 'user_123' } },
      }),
    },
    from: () => ({
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: 'ship_1', base_version: 1 }, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: [{ id: 'ship_1' }], error: null }),
        }),
      }),
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { id: 'ship_1', base_version: 1 }, error: null }),
        }),
      }),
    }),
    storage: {
      from: () => ({
        list: () => Promise.resolve({ data: [], error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://supabase.co/mock.jpg' } }),
        upload: () => Promise.resolve({ data: {}, error: null }),
      }),
    },
  },
}));

// Mock OfflineQueueRepository
jest.mock('../../repositories/offlineQueue.repository', () => ({
  OfflineQueueRepository: {
    getPendingMutations: () => [],
    getPendingCount: () => 0,
    getConflictCount: () => 0,
    removeMutation: () => {},
    updateMutationStatus: () => {},
    saveConflictMutation: () => {},
  },
}));

describe('SyncEngineService Unit Tests', () => {
  beforeEach(() => {
    useOfflineSyncStore.setState({
      isOnline: true,
      syncStatus: 'idle',
      pendingCount: 0,
      conflictCount: 0,
      activeConflict: null,
    });
  });

  it('isOnline false ise triggerSync senkronizasyon başlatmamalıdır', async () => {
    useOfflineSyncStore.getState().setIsOnline(false);

    await SyncEngineService.triggerSync();

    expect(useOfflineSyncStore.getState().syncStatus).toBe('offline');
  });

  it('Bekleyen mutasyon yoksa triggerSync status u idle yapıp sonlanmalıdır', async () => {
    useOfflineSyncStore.getState().setIsOnline(true);

    await SyncEngineService.triggerSync();

    expect(useOfflineSyncStore.getState().syncStatus).toBe('idle');
  });
});
