import {
  handleResolveConflictUserChoice,
  handleDiscardConflictUserChoice,
} from '../../components/ConflictResolutionModal';
import { useOfflineSyncStore } from '../../store/offlineSync.store';
import { PendingMutation } from '../../types/offline.types';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

const mockUpdateConflictResolution = jest.fn();
const mockRemoveMutation = jest.fn();
const mockTriggerSync = jest.fn();

jest.mock('react-native', () => ({
  View: (props: any) => props,
  Text: (props: any) => props,
  Modal: (props: any) => props,
  TouchableOpacity: (props: any) => props,
  ScrollView: (props: any) => props,
  StyleSheet: { create: (styles: any) => styles },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => ({
    execSync: () => {},
    getFirstSync: () => null,
    runSync: () => ({ changes: 1 }),
    getAllSync: () => [],
    closeSync: () => {},
  }),
}));

jest.mock('../../repositories/offlineQueue.repository', () => ({
  OfflineQueueRepository: {
    updateConflictResolution: (...args: any[]) => mockUpdateConflictResolution(...args),
    removeMutation: (...args: any[]) => mockRemoveMutation(...args),
    getMutationById: () => null,
  },
}));

jest.mock('../syncEngine.service', () => ({
  SyncEngineService: {
    triggerSync: (...args: any[]) => mockTriggerSync(...args),
  },
}));

describe('Re-basing Protocol Unit Tests', () => {
  const mockConflictMutation: PendingMutation = {
    id: 'mut_conf_001',
    userId: 'user_123',
    idempotencyKey: 'idemp_orig',
    mutation: {
      type: 'UPDATE_SHIPMENT_STATUS',
      payload: {
        shipmentId: 'ship_1',
        status: 'delivered',
        updatedAt: new Date().toISOString(),
        baseVersion: 1,
      },
    },
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 5,
    status: 'conflict',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handleResolveConflictUserChoice should update baseVersion, set fresh idempotency key and trigger sync', async () => {
    await handleResolveConflictUserChoice(mockConflictMutation, 5);

    expect(mockUpdateConflictResolution).toHaveBeenCalledWith(
      expect.objectContaining({
        mutationId: 'mut_conf_001',
        status: 'pending',
        newIdempotencyKey: expect.stringContaining('idemp_resolve_mut_conf_001'),
        updatedMutation: expect.objectContaining({
          payload: expect.objectContaining({
            baseVersion: 5,
          }),
        }),
      })
    );

    expect(mockTriggerSync).toHaveBeenCalled();
  });

  it('handleDiscardConflictUserChoice should remove mutation from queue and clear active conflict state', async () => {
    await handleDiscardConflictUserChoice('mut_conf_001');

    expect(mockRemoveMutation).toHaveBeenCalledWith('mut_conf_001');
    expect(useOfflineSyncStore.getState().activeConflict).toBeNull();
  });
});
