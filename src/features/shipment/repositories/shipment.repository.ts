import { supabase } from '../../../services/supabase/supabase';
import { Database } from '../../../types/database.types';
import {
  RepositoryMutationResult,
  AddShipmentPayload,
  UpdateShipmentStatusPayload,
  UpdateShipmentDetailsPayload,
  ArchiveShipmentPayload,
} from '../../offline/types/offline.types';
import { OfflineQueueRepository } from '../../offline/repositories/offlineQueue.repository';
import { RehydrationService } from '../../offline/services/rehydration.service';
import { useOfflineSyncStore } from '../../offline/store/offlineSync.store';

export type Shipment = Database['public']['Tables']['shipments']['Row'];
export type ShipmentInsert = Database['public']['Tables']['shipments']['Insert'];
export type CourierCompany = Database['public']['Tables']['courier_companies']['Row'];
export type ShipmentEvent = Database['public']['Tables']['shipment_events']['Row'];

export interface ShipmentWithDetails extends Shipment {
  courier_companies?: CourierCompany | null;
  shipment_events?: ShipmentEvent[];
}

export class ShipmentRepository {
  /**
   * Fetches user shipments from Supabase (or cache) and overlays pending offline SQLite mutations.
   */
  async getShipments(userId: string): Promise<{ shipments: ShipmentWithDetails[]; error: Error | null }> {
    if (!userId) return { shipments: [], error: null };

    let rawShipments: ShipmentWithDetails[] = [];
    let fetchError: Error | null = null;

    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          courier_companies (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        fetchError = error;
      } else if (data) {
        rawShipments = data as any[];
      }
    } catch (err) {
      fetchError = err instanceof Error ? err : new Error('Failed to fetch shipments');
    }

    // Apply Rehydration Bridge: Overlay local pending/processing/conflict SQLite mutations
    const rehydrated = RehydrationService.rehydrateUserShipments(rawShipments, userId);

    // Filter out archived items
    const activeShipments = rehydrated.filter((s) => !s.is_archived);

    return { shipments: activeShipments, error: fetchError };
  }

  /**
   * Fetches single shipment by ID with rehydration support.
   */
  async getShipmentById(
    id: string,
    userId?: string
  ): Promise<{ shipment: ShipmentWithDetails | null; error: Error | null }> {
    if (!id) return { shipment: null, error: null };

    let rawShipment: ShipmentWithDetails | null = null;
    let fetchError: Error | null = null;

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

      if (error) {
        fetchError = error;
      } else {
        rawShipment = (data as any) || null;
      }
    } catch (err) {
      fetchError = err instanceof Error ? err : new Error('Failed to fetch shipment detail');
    }

    if (userId) {
      const inputList = rawShipment ? [rawShipment] : [];
      const rehydrated = RehydrationService.rehydrateUserShipments(inputList, userId);
      const target = rehydrated.find((s) => s.id === id);
      if (target) {
        return { shipment: target as ShipmentWithDetails, error: null };
      }
    }

    return { shipment: rawShipment, error: fetchError };
  }

  /**
   * Creates a shipment using offline-first 3-way mutation result protocol.
   */
  async createShipment(
    input: AddShipmentPayload | ShipmentInsert,
    explicitUserId?: string
  ): Promise<RepositoryMutationResult<Shipment>> {
    const isOnline = useOfflineSyncStore.getState().isOnline;

    const payload: AddShipmentPayload = 'clientShipmentId' in input
      ? input
      : {
          clientShipmentId: (input as any).id || `ship_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          trackingNumber: (input as any).tracking_number || '',
          carrierId: (input as any).carrier_id || 'general',
          title: (input as any).title || 'Yeni Kargo',
          senderAddress: (input as any).sender || undefined,
          receiverAddress: (input as any).receiver || undefined,
          createdAt: (input as any).created_at || new Date().toISOString(),
        };

    const userId = explicitUserId || ('user_id' in input ? (input as any).user_id : undefined);

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .insert({
            id: payload.clientShipmentId,
            idempotency_key: `idemp_add_${payload.clientShipmentId}`,
            user_id: userId,
            tracking_number: payload.trackingNumber,
            carrier_id: payload.carrierId,
            title: payload.title,
            current_status: 'pending',
            base_version: 1,
            created_at: payload.createdAt || new Date().toISOString(),
          } as any)
          .select()
          .single();

        if (!error && data) {
          return { synced: true, data: data as Shipment };
        }
      } catch (err) {
        // Fall back to queue
      }
    }

    // Offline or failed online: Enqueue to SQLite
    const mutation = OfflineQueueRepository.enqueueMutation({
      userId: userId || 'anonymous',
      idempotencyKey: `idemp_add_${payload.clientShipmentId}`,
      mutation: {
        type: 'ADD_SHIPMENT',
        payload,
      },
    });

    return { synced: false, queued: true, mutationId: mutation.id };
  }

  /**
   * Updates shipment status with offline conflict detection and re-basing support.
   */
  async updateShipmentStatus(
    payload: UpdateShipmentStatusPayload,
    userId: string
  ): Promise<RepositoryMutationResult<Shipment>> {
    const isOnline = useOfflineSyncStore.getState().isOnline;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .update({
            current_status: payload.status,
            base_version: payload.baseVersion + 1,
            updated_at: payload.updatedAt || new Date().toISOString(),
          } as any)
          .eq('id', payload.shipmentId)
          .eq('base_version', payload.baseVersion)
          .select()
          .single();

        if (!error && data) {
          return { synced: true, data: data as Shipment };
        }

        // Conflict detection (Version mismatch or conflict)
        if (error && (error.code === 'PGRST116' || error.status === 409)) {
          const mutationId = `mut_conf_${Date.now()}`;
          const { data: serverData } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', payload.shipmentId)
            .single();

          OfflineQueueRepository.saveConflictMutation({
            id: mutationId,
            userId,
            idempotencyKey: `idemp_conf_${mutationId}`,
            mutation: { type: 'UPDATE_SHIPMENT_STATUS', payload },
            createdAt: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 5,
            status: 'conflict',
            serverData: serverData ? JSON.stringify(serverData) : null,
          });

          return {
            synced: false,
            conflict: true,
            mutationId,
            serverData: (serverData as Shipment) || ({} as Shipment),
            serverVersion: (serverData as any)?.base_version || payload.baseVersion + 1,
          };
        }
      } catch (err) {
        // Fallback to queue
      }
    }

    // Queue offline in SQLite
    const mutation = OfflineQueueRepository.enqueueMutation({
      userId,
      idempotencyKey: `idemp_status_${payload.shipmentId}_${Date.now()}`,
      mutation: {
        type: 'UPDATE_SHIPMENT_STATUS',
        payload,
      },
    });

    return { synced: false, queued: true, mutationId: mutation.id };
  }

  /**
   * Updates shipment details (title, notes) with 3-way mutation result.
   */
  async updateShipmentDetails(
    payload: UpdateShipmentDetailsPayload,
    userId: string
  ): Promise<RepositoryMutationResult<Shipment>> {
    const isOnline = useOfflineSyncStore.getState().isOnline;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .update({
            ...(payload.title ? { title: payload.title } : {}),
            ...(payload.notes ? { notes: payload.notes } : {}),
            base_version: payload.baseVersion + 1,
            updated_at: payload.updatedAt || new Date().toISOString(),
          } as any)
          .eq('id', payload.shipmentId)
          .eq('base_version', payload.baseVersion)
          .select()
          .single();

        if (!error && data) {
          return { synced: true, data: data as Shipment };
        }

        if (error && (error.code === 'PGRST116' || error.status === 409)) {
          const mutationId = `mut_conf_${Date.now()}`;
          const { data: serverData } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', payload.shipmentId)
            .single();

          OfflineQueueRepository.saveConflictMutation({
            id: mutationId,
            userId,
            idempotencyKey: `idemp_conf_${mutationId}`,
            mutation: { type: 'UPDATE_SHIPMENT_DETAILS', payload },
            createdAt: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 5,
            status: 'conflict',
            serverData: serverData ? JSON.stringify(serverData) : null,
          });

          return {
            synced: false,
            conflict: true,
            mutationId,
            serverData: (serverData as Shipment) || ({} as Shipment),
            serverVersion: (serverData as any)?.base_version || payload.baseVersion + 1,
          };
        }
      } catch (err) {
        // Fallback to offline queue
      }
    }

    const mutation = OfflineQueueRepository.enqueueMutation({
      userId,
      idempotencyKey: `idemp_details_${payload.shipmentId}_${Date.now()}`,
      mutation: {
        type: 'UPDATE_SHIPMENT_DETAILS',
        payload,
      },
    });

    return { synced: false, queued: true, mutationId: mutation.id };
  }

  /**
   * Archives or un-archives a shipment with 3-way mutation result.
   */
  async archiveShipment(
    payload: ArchiveShipmentPayload,
    userId: string
  ): Promise<RepositoryMutationResult<Shipment>> {
    const isOnline = useOfflineSyncStore.getState().isOnline;

    if (isOnline) {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .update({
            is_archived: payload.isArchived,
            base_version: payload.baseVersion + 1,
            updated_at: payload.updatedAt || new Date().toISOString(),
          } as any)
          .eq('id', payload.shipmentId)
          .eq('base_version', payload.baseVersion)
          .select()
          .single();

        if (!error && data) {
          return { synced: true, data: data as Shipment };
        }

        if (error && (error.code === 'PGRST116' || error.status === 409)) {
          const mutationId = `mut_conf_${Date.now()}`;
          const { data: serverData } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', payload.shipmentId)
            .single();

          OfflineQueueRepository.saveConflictMutation({
            id: mutationId,
            userId,
            idempotencyKey: `idemp_conf_${mutationId}`,
            mutation: { type: 'ARCHIVE_SHIPMENT', payload },
            createdAt: new Date().toISOString(),
            retryCount: 0,
            maxRetries: 5,
            status: 'conflict',
            serverData: serverData ? JSON.stringify(serverData) : null,
          });

          return {
            synced: false,
            conflict: true,
            mutationId,
            serverData: (serverData as Shipment) || ({} as Shipment),
            serverVersion: (serverData as any)?.base_version || payload.baseVersion + 1,
          };
        }
      } catch (err) {
        // Fallback to queue
      }
    }

    const mutation = OfflineQueueRepository.enqueueMutation({
      userId,
      idempotencyKey: `idemp_archive_${payload.shipmentId}_${Date.now()}`,
      mutation: {
        type: 'ARCHIVE_SHIPMENT',
        payload,
      },
    });

    return { synced: false, queued: true, mutationId: mutation.id };
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

  /**
   * Supabase Edge Function üzerinden kargo şirketinden canlı takip verisini çeker.
   */
  async fetchLiveTrackingFromCarrier(
    trackingNumber: string,
    carrierCode: string
  ): Promise<{ data: any | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: { trackingNumber, carrierCode },
      });

      if (error) return { data: null, error };
      return { data, error: null };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Canlı kargo takibi sorgulanamadı'),
      };
    }
  }
}

export const shipmentRepository = new ShipmentRepository();


