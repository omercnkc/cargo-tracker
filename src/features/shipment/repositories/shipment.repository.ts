import { supabase } from '../../../services/supabase/supabase';
import { Database } from '../../../types/database.types';

export type Shipment = Database['public']['Tables']['shipments']['Row'];
export type ShipmentInsert = Database['public']['Tables']['shipments']['Insert'];
export type CourierCompany = Database['public']['Tables']['courier_companies']['Row'];
export type ShipmentEvent = Database['public']['Tables']['shipment_events']['Row'];

export interface ShipmentWithDetails extends Shipment {
  courier_companies?: CourierCompany | null;
  shipment_events?: ShipmentEvent[];
}

export class ShipmentRepository {
  async getShipments(userId: string): Promise<{ shipments: ShipmentWithDetails[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          courier_companies (*)
        `)
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (error) return { shipments: [], error };
      return { shipments: (data as any) || [], error: null };
    } catch (err) {
      return { shipments: [], error: err instanceof Error ? err : new Error('Failed to fetch shipments') };
    }
  }

  async getShipmentById(id: string): Promise<{ shipment: ShipmentWithDetails | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          courier_companies (*),
          shipment_events (*)
        `)
        .eq('id', id)
        .single();

      if (error) return { shipment: null, error };
      return { shipment: (data as any) || null, error: null };
    } catch (err) {
      return { shipment: null, error: err instanceof Error ? err : new Error('Failed to fetch shipment detail') };
    }
  }

  async createShipment(shipment: ShipmentInsert): Promise<{ shipment: Shipment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert(shipment as any)
        .select()
        .single();

      if (error) return { shipment: null, error };
      return { shipment: data, error: null };
    } catch (err) {
      return { shipment: null, error: err instanceof Error ? err : new Error('Failed to create shipment') };
    }
  }

  async getCourierCompanies(): Promise<{ companies: CourierCompany[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('courier_companies')
        .select('*')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) return { companies: [], error };
      return { companies: data || [], error: null };
    } catch (err) {
      return { companies: [], error: err instanceof Error ? err : new Error('Failed to fetch courier companies') };
    }
  }
}

export const shipmentRepository = new ShipmentRepository();
