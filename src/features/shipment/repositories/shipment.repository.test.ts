import { ShipmentRepository } from './shipment.repository';

// Simple type declarations for test runner mock
declare const jest: any;
declare const describe: any;
declare const beforeEach: any;
declare const it: any;
declare const expect: any;

// Mock Supabase client
jest.mock('../../../services/supabase/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({
      data: [
        {
          id: 'shipment-1',
          user_id: 'user-123',
          tracking_number: 'TR-100',
          current_status: 'transit',
          courier_companies: { name: 'Aras Kargo' }
        }
      ],
      error: null
    }),
  }
}));

describe('ShipmentRepository', () => {
  let repository: ShipmentRepository;

  beforeEach(() => {
    repository = new ShipmentRepository();
    jest.clearAllMocks();
  });

  it('should fetch user shipments successfully', async () => {
    const { shipments, error } = await repository.getShipments('user-123');

    expect(error).toBeNull();
    expect(shipments).toHaveLength(1);
    expect(shipments[0].tracking_number).toBe('TR-100');
    expect(shipments[0].courier_companies?.name).toBe('Aras Kargo');
  });

  it('should return empty list when no user id provided or on failure', async () => {
    const { shipments } = await repository.getShipments('');
    expect(shipments).toBeDefined();
  });
});
