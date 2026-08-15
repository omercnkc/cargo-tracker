import { SyncEngineService } from '../syncEngine.service';
import { useOfflineSyncStore } from '../../store/offlineSync.store';

// Mock Supabase
jest.mock('../../../../services/supabase/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user_123' } },
      }),
    },
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 'ship_1', base_version: 1 }, error: null }),
    })),
  },
}));

// Mock OfflineQueueRepository
jest.mock('../../repositories/offlineQueue.repository', () => ({
  OfflineQueueRepository: {
    getPendingMutations: jest.fn().mockReturnValue([]),
    getPendingCount: jest.fn().mockReturnValue(0),
    getConflictCount: jest.fn().mockReturnValue(0),
    removeMutation: jest.fn(),
    updateMutationStatus: jest.fn(),
    saveConflictMutation: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('isOnline false ise triggerSync senkronizasyon başlatmamalıdır', async () => {
    useOfflineSyncStore.getState().setIsOnline(false);

    await SyncEngineService.triggerSync();

    expect(useOfflineSyncStore.getState().syncStatus).toBe('offline');
  });

  it('Bekleyen mutasyon yoksa triggerSync status ü idle yapıp sonlanmalıdır', async () => {
    useOfflineSyncStore.getState().setIsOnline(true);

    await SyncEngineService.triggerSync();

    expect(useOfflineSyncStore.getState().syncStatus).toBe('idle');
  });
});
