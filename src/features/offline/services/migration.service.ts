import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineQueueRepository } from '../repositories/offlineQueue.repository';
import { supabase } from '../../../services/supabase/supabase';

const OLD_OFFLINE_QUEUE_KEY = '@cargo_tracker_offline_queue';

export class MigrationService {
  /**
   * Reads legacy AsyncStorage JSON offline mutations and migrates them into the op-sqlite mutations table.
   */
  static async migrateLegacyQueueToSQLite(): Promise<{ migratedCount: number }> {
    try {
      const rawQueue = await AsyncStorage.getItem(OLD_OFFLINE_QUEUE_KEY);
      if (!rawQueue) {
        return { migratedCount: 0 };
      }

      const legacyQueue: any[] = JSON.parse(rawQueue);
      if (!Array.isArray(legacyQueue) || legacyQueue.length === 0) {
        await AsyncStorage.removeItem(OLD_OFFLINE_QUEUE_KEY);
        return { migratedCount: 0 };
      }

      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || 'anonymous';

      let count = 0;
      for (const item of legacyQueue) {
        if (!item || !item.type) continue;

        let mutationType = 'ADD_SHIPMENT';
        const rawPayload = item.payload || {};

        if (item.type === 'UPDATE_SHIPMENT') {
          mutationType = 'UPDATE_SHIPMENT_STATUS';
        } else if (item.type === 'DELETE_SHIPMENT') {
          mutationType = 'ARCHIVE_SHIPMENT';
        }

        let normalizedPayload: any = { ...rawPayload };

        if (mutationType === 'ADD_SHIPMENT') {
          normalizedPayload = {
            clientShipmentId: rawPayload.clientShipmentId || rawPayload.id || item.id || `mig_${Date.now()}_${count}`,
            trackingNumber: rawPayload.trackingNumber || rawPayload.tracking_number || '',
            carrierId: rawPayload.carrierId || rawPayload.carrier_id || 'general',
            title: rawPayload.title || 'Kargo',
            createdAt: rawPayload.createdAt || item.createdAt || new Date().toISOString(),
          };
        } else if (mutationType === 'UPDATE_SHIPMENT_STATUS') {
          normalizedPayload = {
            shipmentId: rawPayload.shipmentId || rawPayload.id,
            status: rawPayload.status || rawPayload.current_status || 'pending',
            baseVersion: rawPayload.baseVersion ?? 1,
            updatedAt: rawPayload.updatedAt || new Date().toISOString(),
          };
        } else if (mutationType === 'ARCHIVE_SHIPMENT') {
          normalizedPayload = {
            shipmentId: rawPayload.shipmentId || rawPayload.id,
            isArchived: rawPayload.isArchived ?? true,
            baseVersion: rawPayload.baseVersion ?? 1,
            updatedAt: rawPayload.updatedAt || new Date().toISOString(),
          };
        }

        OfflineQueueRepository.enqueueMutation({
          id: item.id || `mig_${Date.now()}_${count}`,
          userId: currentUserId,
          idempotencyKey: `idemp_mig_${item.id || Date.now()}_${count}`,
          mutation: {
            type: mutationType as any,
            payload: normalizedPayload,
          },
        });
        count++;
      }

      // Remove legacy AsyncStorage key after successful migration
      await AsyncStorage.removeItem(OLD_OFFLINE_QUEUE_KEY);
      console.log(`[MigrationService] ${count} adet legacy AsyncStorage mutasyonu SQLite veritabanına aktarıldı.`);
      return { migratedCount: count };
    } catch (err) {
      console.error('[MigrationService Hatası]:', err);
      return { migratedCount: 0 };
    }
  }
}
