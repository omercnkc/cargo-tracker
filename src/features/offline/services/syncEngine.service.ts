import { supabase } from '../../../services/supabase/supabase';
import { OfflineQueueRepository } from '../repositories/offlineQueue.repository';
import { useOfflineSyncStore } from '../store/offlineSync.store';
import { PendingMutation, AddShipmentPayload, UpdateShipmentStatusPayload, UpdateShipmentDetailsPayload, ArchiveShipmentPayload } from '../types/offline.types';

export class SyncEngineService {
  private static isSyncing = false;

  /**
   * Senkronizasyonu tetikler (Single-Flight Mutex Kilidi ile korumalıdır).
   */
  static async triggerSync(): Promise<void> {
    const store = useOfflineSyncStore.getState();

    // 1. Single-Flight Lock ve Online Kontrolü
    if (!store.isOnline) {
      console.log('[SyncEngine] Bağlantı yok, senkronizasyon ertelendi.');
      return;
    }

    if (this.isSyncing) {
      console.log('[SyncEngine] Senkronizasyon halihazırda devam ediyor (Single-Flight Lock aktif).');
      return;
    }

    this.isSyncing = true;
    store.setSyncStatus('syncing');

    try {
      // 2. Kullanıcı Oturumu Kontrolü
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;

      if (!userId) {
        console.log('[SyncEngine] Oturum açmış kullanıcı bulunamadı.');
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

      console.log(`[SyncEngine] ${pendingMutations.length} adet bekleyen mutasyon işleniyor...`);

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
    } catch (error) {
      console.error('[SyncEngine Hatası]:', error);
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
        console.log(`[SyncEngine] Mutasyon ${item.id} başarıyla senkronize edildi.`);
        OfflineQueueRepository.removeMutation(item.id);
        return true;
      } else if (result.conflict) {
        console.warn(`[SyncEngine] Mutasyon ${item.id} versiyon çakışmasına düştü!`);
        OfflineQueueRepository.saveConflictMutation({
          ...item,
          status: 'conflict',
          serverData: JSON.stringify(result.serverData),
          lastError: 'Versiyon çakışması (Optimistic Lock Mismatch)',
        });
        useOfflineSyncStore.getState().setConflictState(item.id, result.serverData);
        return false;
      } else {
        console.error(`[SyncEngine] Mutasyon ${item.id} başarısız oldu:`, result.error);
        OfflineQueueRepository.updateMutationStatus(item.id, 'failed', result.error);
        return false;
      }
    } catch (err: any) {
      console.error(`[SyncEngine Istisna] Mutasyon ${item.id}:`, err);
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
        const { data, error } = await client
          .from('shipments')
          .insert({
            id: p.clientShipmentId,
            idempotency_key: item.idempotencyKey,
            user_id: userId,
            tracking_number: p.trackingNumber,
            carrier_id: p.carrierId,
            title: p.title,
            status: 'pending',
            base_version: 1,
            created_at: p.createdAt,
            updated_at: p.createdAt,
          })
          .select()
          .single();

        if (error) {
          // Idempotency key zaten varsa başarı kabul et
          if (error.code === '23505') return { success: true };
          return { success: false, error: error.message };
        }
        return { success: true, serverData: data };
      }

      case 'UPDATE_SHIPMENT_STATUS': {
        const p = payload as UpdateShipmentStatusPayload;
        
        // Önce güncel sunucu verisini oku (Versiyon Kontrolü)
        const { data: currentServerData } = await client
          .from('shipments')
          .select('*')
          .eq('id', p.shipmentId)
          .single();

        if (currentServerData && currentServerData.base_version !== p.baseVersion) {
          // Versiyon Çakışması!
          return { success: false, conflict: true, serverData: currentServerData };
        }

        const { data, error } = await client
          .from('shipments')
          .update({
            status: p.status,
            base_version: (p.baseVersion || 1) + 1,
            updated_at: p.updatedAt,
            last_idempotency_key: item.idempotencyKey,
          })
          .eq('id', p.shipmentId)
          .eq('base_version', p.baseVersion)
          .select();

        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) {
          return { success: false, conflict: true, serverData: currentServerData };
        }

        return { success: true, serverData: data[0] };
      }

      case 'UPDATE_SHIPMENT_DETAILS': {
        const p = payload as UpdateShipmentDetailsPayload;
        const { data: currentServerData } = await client
          .from('shipments')
          .select('*')
          .eq('id', p.shipmentId)
          .single();

        if (currentServerData && currentServerData.base_version !== p.baseVersion) {
          return { success: false, conflict: true, serverData: currentServerData };
        }

        const { data, error } = await client
          .from('shipments')
          .update({
            title: p.title,
            base_version: (p.baseVersion || 1) + 1,
            updated_at: p.updatedAt,
            last_idempotency_key: item.idempotencyKey,
          })
          .eq('id', p.shipmentId)
          .eq('base_version', p.baseVersion)
          .select();

        if (error) return { success: false, error: error.message };
        if (!data || data.length === 0) {
          return { success: false, conflict: true, serverData: currentServerData };
        }

        return { success: true, serverData: data[0] };
      }

      case 'ARCHIVE_SHIPMENT': {
        const p = payload as ArchiveShipmentPayload;
        const { data, error } = await client
          .from('shipments')
          .update({
            updated_at: p.updatedAt,
            last_idempotency_key: item.idempotencyKey,
          })
          .eq('id', p.shipmentId)
          .select();

        if (error) return { success: false, error: error.message };
        return { success: true, serverData: data };
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
