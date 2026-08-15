import { OfflineQueueRepository } from '../offlineQueue.repository';
import { closeDatabase, getDatabase } from '../../database/db';
import { runMigrations } from '../../database/migrations';

// expo-sqlite mock
jest.mock('expo-sqlite', () => {
  const store = new Map<string, any>();
  let userVersion = 0;

  return {
    openDatabaseSync: jest.fn(() => ({
      execSync: jest.fn((sql: string) => {
        if (sql.includes('PRAGMA user_version =')) {
          const match = sql.match(/PRAGMA user_version = (\d+);/);
          if (match) userVersion = parseInt(match[1], 10);
        }
        if (sql.includes('DROP TABLE')) {
          store.clear();
        }
      }),
      getFirstSync: jest.fn((sql: string, params?: any[]) => {
        if (sql.includes('PRAGMA user_version')) {
          return { user_version: userVersion };
        }
        if (sql.includes('COUNT(*)')) {
          const count = Array.from(store.values()).filter(
            (item) => item.status === (params?.[1] || 'pending')
          ).length;
          return { count };
        }
        if (sql.includes('SELECT * FROM mutations WHERE id =')) {
          const id = params?.[0];
          return store.get(id) || null;
        }
        return null;
      }),
      runSync: jest.fn((sql: string, params?: any[]) => {
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
            max_retries: params?.[8],
            processing_started_at: params?.[9],
            last_error: params?.[10],
            server_data: params?.[11],
            created_at: params?.[12],
          });
        }
        if (sql.includes("SET status = 'blocked'")) {
          const parentId = params?.[0];
          for (const item of store.values()) {
            if (item.parent_mutation_id === parentId && item.status === 'pending') {
              item.status = 'blocked';
              item.last_error = 'Ebeveyn mutasyon çakışmaya düştü veya başarısız oldu';
            }
          }
        }
        if (sql.includes("SET status = 'pending'")) {
          const parentId = params?.[0];
          for (const item of store.values()) {
            if (item.parent_mutation_id === parentId && item.status === 'blocked') {
              item.status = 'pending';
              item.last_error = null;
            }
          }
        }
        if (sql.includes('DELETE FROM mutations')) {
          const id = params?.[0];
          store.delete(id);
        }
        return { changes: 1, lastInsertRowId: 1 };
      }),
      getAllSync: jest.fn((sql: string, params?: any[]) => {
        if (sql.includes('SELECT * FROM mutations')) {
          const userId = params?.[0];
          return Array.from(store.values()).filter(
            (item) => item.user_id === userId && item.status === 'pending'
          );
        }
        return [];
      }),
      closeSync: jest.fn(),
    })),
  };
});

describe('OfflineQueueRepository Unit Tests', () => {
  beforeEach(() => {
    closeDatabase();
    const db = getDatabase();
    runMigrations(db);
  });

  it('enqueueMutation yeni bir mutasyonu kuyruğa eklemelidir', () => {
    const mutation = OfflineQueueRepository.enqueueMutation({
      userId: 'user_123',
      idempotencyKey: 'idemp_001',
      mutation: {
        type: 'ADD_SHIPMENT',
        payload: {
          clientShipmentId: 'ship_001',
          trackingNumber: 'TR123456',
          carrierId: 'yurtici',
          title: 'Test Kargo',
          createdAt: new Date().toISOString(),
        },
      },
    });

    expect(mutation.id).toBeDefined();
    expect(mutation.status).toBe('pending');

    const pendingList = OfflineQueueRepository.getPendingMutations('user_123');
    expect(pendingList.length).toBe(1);
    expect(pendingList[0].idempotencyKey).toBe('idemp_001');
  });

  it('markParentFailedCascading ve unblockDependentMutations bağımlı mutasyon durumlarını doğru yönetmelidir', () => {
    const parent = OfflineQueueRepository.enqueueMutation({
      id: 'parent_1',
      userId: 'user_123',
      idempotencyKey: 'idemp_p1',
      mutation: {
        type: 'ADD_SHIPMENT',
        payload: {
          clientShipmentId: 'ship_001',
          trackingNumber: 'TR123',
          carrierId: 'yurtici',
          title: 'Ebeveyn Kargo',
          createdAt: new Date().toISOString(),
        },
      },
    });

    const child = OfflineQueueRepository.enqueueMutation({
      id: 'child_1',
      userId: 'user_123',
      idempotencyKey: 'idemp_c1',
      parentMutationId: parent.id,
      mutation: {
        type: 'UPDATE_SHIPMENT_STATUS',
        payload: {
          shipmentId: 'ship_001',
          status: 'in_transit',
          updatedAt: new Date().toISOString(),
          baseVersion: 1,
        },
      },
    });

    // Ebeveyn çakışmaya düştüğünde alt mutasyonu engelle (blocked)
    OfflineQueueRepository.markParentFailedCascading(parent.id);
    const childMutationBlocked = OfflineQueueRepository.getMutationById(child.id);
    expect(childMutationBlocked?.status).toBe('blocked');

    // Ebeveyn çözüldüğünde alt mutasyonun engelini kaldır (pending)
    OfflineQueueRepository.unblockDependentMutations(parent.id);
    const childMutationPending = OfflineQueueRepository.getMutationById(child.id);
    expect(childMutationPending?.status).toBe('pending');
  });
});
