import { MigrationService } from '../migration.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineQueueRepository } from '../../repositories/offlineQueue.repository';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

const mockGetItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockEnqueueMutation = jest.fn();

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (...args: any[]) => mockGetItem(...args),
  removeItem: (...args: any[]) => mockRemoveItem(...args),
}));

jest.mock('../../repositories/offlineQueue.repository', () => ({
  OfflineQueueRepository: {
    enqueueMutation: (...args: any[]) => mockEnqueueMutation(...args),
  },
}));

jest.mock('../../../../services/supabase/supabase', () => ({
  supabase: {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'user_mig' } } }),
    },
  },
}));

describe('MigrationService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 0 when no legacy AsyncStorage queue exists', async () => {
    mockGetItem.mockResolvedValue(null);
    const result = await MigrationService.migrateLegacyQueueToSQLite();
    expect(result.migratedCount).toBe(0);
  });

  it('should migrate legacy queue items to SQLite mutations table and clear AsyncStorage key', async () => {
    const legacyItems = [
      { id: 'm1', type: 'ADD_SHIPMENT', payload: { title: 'Legacy Shipment 1' } },
      { id: 'm2', type: 'UPDATE_SHIPMENT', payload: { status: 'delivered' } },
    ];
    mockGetItem.mockResolvedValue(JSON.stringify(legacyItems));

    const result = await MigrationService.migrateLegacyQueueToSQLite();
    expect(result.migratedCount).toBe(2);
    expect(mockEnqueueMutation).toHaveBeenCalledTimes(2);
    expect(mockRemoveItem).toHaveBeenCalledWith('@cargo_tracker_offline_queue');
  });
});
