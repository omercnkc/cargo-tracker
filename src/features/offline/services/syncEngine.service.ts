import { supabase } from '../../../services/supabase/supabase';
import { OfflineQueueRepository } from '../repositories/offlineQueue.repository';
import { useOfflineSyncStore } from '../store/offlineSync.store';
import {
  PendingMutation,
  AddShipmentPayload,
  UpdateShipmentStatusPayload,
  UpdateShipmentDetailsPayload,
  ArchiveShipmentPayload,
  UploadPodImagePayload,
} from '../types/offline.types';
import { PodUploadService } from './podUpload.service';

export class SyncEngineService {
  private static isSyncing = false;

  /**
   * Senkronizasyonu tetikler (Single-Flight Mutex Kilidi ile korumalıdır).
   */
  static async triggerSync(): Promise<void> {
    const store = useOfflineSyncStore.getState();

    // 1. Single-Flight Lock ve Online Kontrolü
    if (!store.isOnline) {
      return;
    }

    if (this.isSyncing) {
      return;
    }

    this.isSyncing = true;
    store.setSyncStatus('syncing');

    try {
      // 2. Kullanıcı Oturumu Kontrolü
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      if (!userId) {
        this.isSyncing = false;
        store.setSyncStatus('idle');
        return;
      }

      // 3. Kuyruktaki Bekleyen Mutasyonları Çek
      const pendingMutations = OfflineQueueRepository.getPendingMutations(userId);

      if (pendingMutations.length === 0) {
        this.isSyncing = false;
        store.setSyncStatus('idle');
        return;
      }

      // 4. Mutasyonları Sırayla İşle (FIFO / Dependency Order)
      for (const item of pendingMutations) {
        const success = await this.processMutation(item, userId);
        if (!success) {
          // Bir mutasyon durduğunda veya çakışmaya düştüğünde bağımlı akışı kes
          break;
        }
      }

      const updatedPendingCount = OfflineQueueRepository.getPendingCount(userId);
      const updatedConflictCount = OfflineQueueRepository.getConflictCount(userId);
      store.setPendingCount(updatedPendingCount);
      store.setConflictCount(updatedConflictCount);

      if (updatedConflictCount > 0) {
        store.setSyncStatus('conflict');
      } else {
        store.setSyncStatus('success');
        setTimeout(() => store.setSyncStatus('idle'), 2000);
      }
    } catch {
      store.setSyncStatus('error');
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Tekil mutasyonu Supabase sunucusuna aktarır.
   */
  private static async processMutation(item: PendingMutation, userId: string): Promise<boolean> {
    try {
      // Ebeveyn kontrolü
      if (item.parentMutationId) {
        const parent = OfflineQueueRepository.getMutationById(item.parentMutationId);
        if (parent && (parent.status === 'failed' || parent.status === 'dead' || parent.status === 'conflict')) {
          OfflineQueueRepository.updateMutationStatus(
            item.id,
            'blocked',
            'Ebeveyn mutasyon çakışmaya düştü veya başarısız oldu'
          );
          return false;
        }
      }

      const timeoutMs = item.mutation.type === 'UPLOAD_POD_IMAGE' ? 180000 : 60000;
      const result = await this.executeWithTimeout(this.sendToSupabase(item, userId), timeoutMs);

      if (result.success) {
        OfflineQueueRepository.removeMutation(item.id);
        return true;
      } else if (result.conflict) {
        OfflineQueueRepository.saveConflictMutation({
          ...item,
          status: 'conflict',
          serverData: JSON.stringify(result.serverData),
          lastError: 'Versiyon çakışması (Optimistic Lock Mismatch)',
        });
        useOfflineSyncStore.getState().setConflictState(item.id, result.serverData);
        return false;
      } else {
        OfflineQueueRepository.updateMutationStatus(item.id, 'failed', result.error);
        return false;
      }
    } catch (err: any) {
      OfflineQueueRepository.updateMutationStatus(item.id, 'failed', err.message || 'Bilinmeyen hata');
      return false;
    }
  }

  /**
   * Mutasyonu Supabase istemcisine iletir.
   */
  private static async sendToSupabase(
    item: PendingMutation,
    userId: string
  ): Promise<{ success: boolean; conflict?: boolean; serverData?: any; error?: string }> {
    const { type, payload } = item.mutation;
    const client = supabase as any;

    switch (type) {
      case 'ADD_SHIPMENT': {
        const p = payload as AddShipmentPayload;
        const insertPayload: any = {
          user_id: userId,
          tracking_number: p.trackingNumber,
          title: p.title,
          current_status: 'transit',
          created_at: p.createdAt || new Date().toISOString(),
          updated_at: p.createdAt || new Date().toISOString(),
        };

        // If clientShipmentId is a valid UUID, pass it, otherwise let Supabase generate default gen_random_uuid()
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.clientShipmentId || '');
        if (isUuid) {
          insertPayload.id = p.clientShipmentId;
        }

        // Supabase company_id is a foreign key UUID. Only assign if valid UUID (e.g. not 'general' string)
        const isCarrierUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.carrierId || '');
        if (isCarrierUuid) {
          insertPayload.company_id = p.carrierId;
        }

        const { data, error } = await client
          .from('shipments')
          .insert(insertPayload)
          .select()
          .single();

        if (error) {
          if (error.code === '23505') return { success: true };
          return { success: false, error: error.message };
        }
        return { success: true, serverData: data };
      }

      case 'UPDATE_SHIPMENT_STATUS': {
        const p = payload as UpdateShipmentStatusPayload;
        const { data, error } = await client
          .from('shipments')
          .update({
            current_status: p.status,
            updated_at: p.updatedAt || new Date().toISOString(),
          })
          .eq('id', p.shipmentId)
          .select();

        if (error) return { success: false, error: error.message };
        return { success: true, serverData: data?.[0] };
      }

      case 'UPDATE_SHIPMENT_DETAILS': {
        const p = payload as UpdateShipmentDetailsPayload;
        const { data, error } = await client
          .from('shipments')
          .update({
            title: p.title,
            updated_at: p.updatedAt || new Date().toISOString(),
          })
          .eq('id', p.shipmentId)
          .select();

        if (error) return { success: false, error: error.message };
        return { success: true, serverData: data?.[0] };
      }

      case 'ARCHIVE_SHIPMENT': {
        const p = payload as ArchiveShipmentPayload;
        const { data, error } = await client
          .from('shipments')
          .update({
            is_archived: true,
            updated_at: p.updatedAt || new Date().toISOString(),
          })
          .eq('id', p.shipmentId)
          .select();

        if (error) return { success: false, error: error.message };
        return { success: true, serverData: data };
      }

      case 'UPLOAD_POD_IMAGE': {
        const p = payload as UploadPodImagePayload;
        try {
          const uploadResult = await PodUploadService.uploadPodImage(p, userId, item.idempotencyKey);
          return { success: true, serverData: uploadResult };
        } catch (uploadError: any) {
          return { success: false, error: uploadError.message || 'POD upload failed' };
        }
      }

      default:
        return { success: true };
    }
  }

  /**
   * İstekler için zamanaşımı sarmalayıcısı (Timeout wrapper).
   */
  private static async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`İstek zamanaşımına uğradı (${timeoutMs / 1000}s)`)), timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timer!);
      return result;
    } catch (error) {
      clearTimeout(timer!);
      throw error;
    }
  }
}
