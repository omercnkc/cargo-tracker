import { ShipmentRepository } from './shipment.repository';

declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => ({
    execSync: () => {},
    getFirstSync: () => null,
    runSync: () => ({ changes: 1 }),
    getAllSync: () => [],
    closeSync: () => {},
  }),
}));

jest.mock('../../../services/supabase/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({
            data: [
              {
                id: 'shipment-1',
                user_id: 'user-123',
                tracking_number: 'TR-100',
                current_status: 'transit',
                is_archived: false,
                courier_companies: { name: 'Aras Kargo' },
              },
            ],
            error: null,
          }),
          single: () => Promise.resolve({
            data: {
              id: 'shipment-1',
              user_id: 'user-123',
              tracking_number: 'TR-100',
              current_status: 'transit',
            },
            error: null,
          }),
        }),
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({
            data: {
              id: 'ship_new',
              user_id: 'user-123',
              tracking_number: 'TR-NEW',
              title: 'Yeni Kargo',
            },
            error: null,
          }),
        }),
      }),
      update: () => ({
        eq: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({
                data: {
                  id: 'shipment-1',
                  user_id: 'user-123',
                  tracking_number: 'TR-100',
                  current_status: 'delivered',
                  base_version: 2,
                },
                error: null,
              }),
            }),
          }),
        }),
      }),
    }),
  },
}));

describe('ShipmentRepository', () => {
  let repository: ShipmentRepository;

  beforeEach(() => {
    repository = new ShipmentRepository();
  });

  it('should fetch user shipments successfully', async () => {
    const { shipments, error } = await repository.getShipments('user-123');

    expect(error).toBeNull();
    expect(shipments).toBeDefined();
    expect(shipments.length).toBeGreaterThanOrEqual(1);
    expect(shipments[0].tracking_number).toBe('TR-100');
  });

  it('should return empty list when no user id provided', async () => {
    const { shipments } = await repository.getShipments('');
    expect(shipments).toEqual([]);
  });

  it('should return single shipment by id', async () => {
    const { shipment, error } = await repository.getShipmentById('shipment-1', 'user-123');
    expect(error).toBeNull();
    expect(shipment).toBeDefined();
    expect(shipment?.id).toBe('shipment-1');
  });

  it('should return 3-way mutation result when creating a shipment', async () => {
    const result = await repository.createShipment(
      {
        clientShipmentId: 'ship_test_1',
        trackingNumber: 'TR-999',
        carrierId: 'aras',
        title: 'Test Cargo',
        createdAt: new Date().toISOString(),
      },
      'user-123'
    );

    expect(result).toBeDefined();
    expect('synced' in result).toBe(true);
  });

  it('should return 3-way mutation result when updating status', async () => {
    const result = await repository.updateShipmentStatus(
      {
        shipmentId: 'shipment-1',
        status: 'delivered',
        updatedAt: new Date().toISOString(),
        baseVersion: 1,
      },
      'user-123'
    );

    expect(result).toBeDefined();
    expect('synced' in result).toBe(true);
  });

  it('should return 3-way mutation result when updating details', async () => {
    const result = await repository.updateShipmentDetails(
      {
        shipmentId: 'shipment-1',
        title: 'Yeni Baslik',
        notes: 'Ek Not',
        updatedAt: new Date().toISOString(),
        baseVersion: 1,
      },
      'user-123'
    );

    expect(result).toBeDefined();
    expect('synced' in result).toBe(true);
  });

  it('should return 3-way mutation result when archiving shipment', async () => {
    const result = await repository.archiveShipment(
      {
        shipmentId: 'shipment-1',
        isArchived: true,
        updatedAt: new Date().toISOString(),
        baseVersion: 1,
      },
      'user-123'
    );

    expect(result).toBeDefined();
    expect('synced' in result).toBe(true);
  });
});
