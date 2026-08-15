import { RehydrationService } from '../rehydration.service';
import { PendingMutation } from '../../types/offline.types';

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    getFirstSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    closeSync: jest.fn(),
  })),
}));

describe('RehydrationService', () => {
  const sampleShipments = [
    {
      id: 'ship_1',
      tracking_number: 'TR100',
      title: 'Amazon Paket',
      current_status: 'pending',
      base_version: 1,
      is_archived: false,
    },
    {
      id: 'ship_2',
      tracking_number: 'TR200',
      title: 'Hepsiburada',
      current_status: 'in_transit',
      base_version: 2,
      is_archived: false,
    },
  ];

  it('should return raw shipments intact when no pending mutations exist', () => {
    const result = RehydrationService.applyPendingMutations(sampleShipments, []);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('ship_1');
  });

  it('should overlay ADD_SHIPMENT optimistic item', () => {
    const addMutation: PendingMutation = {
      id: 'mut_add_1',
      userId: 'user_123',
      idempotencyKey: 'idemp_add_ship_3',
      mutation: {
        type: 'ADD_SHIPMENT',
        payload: {
          clientShipmentId: 'ship_3',
          trackingNumber: 'TR300',
          carrierId: 'aras',
          title: 'Trendyol Paket',
          createdAt: new Date().toISOString(),
        },
      },
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 5,
      status: 'pending',
    };

    const result = RehydrationService.applyPendingMutations(sampleShipments, [addMutation]);
    expect(result).toHaveLength(3);
    const added = result.find((s) => s.id === 'ship_3');
    expect(added).toBeDefined();
    expect(added.tracking_number).toBe('TR300');
    expect(added.is_pending_sync).toBe(true);
  });

  it('should overlay UPDATE_SHIPMENT_STATUS on target shipment', () => {
    const statusMutation: PendingMutation = {
      id: 'mut_status_1',
      userId: 'user_123',
      idempotencyKey: 'idemp_status_1',
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
      status: 'pending',
    };

    const result = RehydrationService.applyPendingMutations(sampleShipments, [statusMutation]);
    const updated = result.find((s) => s.id === 'ship_1');
    expect(updated.current_status).toBe('delivered');
    expect(updated.is_pending_sync).toBe(true);
  });

  it('should overlay ARCHIVE_SHIPMENT on target shipment', () => {
    const archiveMutation: PendingMutation = {
      id: 'mut_archive_1',
      userId: 'user_123',
      idempotencyKey: 'idemp_archive_2',
      mutation: {
        type: 'ARCHIVE_SHIPMENT',
        payload: {
          shipmentId: 'ship_2',
          isArchived: true,
          updatedAt: new Date().toISOString(),
          baseVersion: 2,
        },
      },
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 5,
      status: 'pending',
    };

    const result = RehydrationService.applyPendingMutations(sampleShipments, [archiveMutation]);
    const archived = result.find((s) => s.id === 'ship_2');
    expect(archived.is_archived).toBe(true);
    expect(archived.is_pending_sync).toBe(true);
  });
});
