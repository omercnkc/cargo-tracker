import { PendingMutation } from '../types/offline.types';
import { OfflineQueueRepository } from '../repositories/offlineQueue.repository';

export class RehydrationService {
  /**
   * Applies pending/queued local mutations onto a list of shipments fetched from server/cache.
   */
  static applyPendingMutations(
    shipments: any[],
    pendingMutations: PendingMutation[]
  ): any[] {
    if (!pendingMutations || pendingMutations.length === 0) {
      return shipments || [];
    }

    const resultMap = new Map<string, any>();
    (shipments || []).forEach((item) => {
      if (item && item.id) {
        resultMap.set(item.id, { ...item });
      }
    });

    for (const mutation of pendingMutations) {
      const type = mutation.mutation.type;
      const payload = mutation.mutation.payload;

      switch (type) {
        case 'ADD_SHIPMENT': {
          const addPayload = payload as any;
          const id = addPayload.clientShipmentId || addPayload.id;
          if (!id) break;

          const existing = resultMap.get(id) || {};
          resultMap.set(id, {
            id,
            tracking_number: addPayload.trackingNumber,
            title: addPayload.title,
            current_status: 'pending',
            status: 'pending',
            carrier_id: addPayload.carrierId,
            sender: addPayload.senderAddress,
            receiver: addPayload.receiverAddress,
            created_at: addPayload.createdAt || new Date().toISOString(),
            base_version: 1,
            is_archived: false,
            ...existing,
            is_pending_sync: true,
          });
          break;
        }

        case 'UPDATE_SHIPMENT_STATUS': {
          const statusPayload = payload as any;
          const target = resultMap.get(statusPayload.shipmentId);
          if (target) {
            resultMap.set(statusPayload.shipmentId, {
              ...target,
              current_status: statusPayload.status,
              status: statusPayload.status,
              updated_at: statusPayload.updatedAt || new Date().toISOString(),
              is_pending_sync: true,
            });
          }
          break;
        }

        case 'UPDATE_SHIPMENT_DETAILS': {
          const detailsPayload = payload as any;
          const target = resultMap.get(detailsPayload.shipmentId);
          if (target) {
            resultMap.set(detailsPayload.shipmentId, {
              ...target,
              ...(detailsPayload.title ? { title: detailsPayload.title } : {}),
              ...(detailsPayload.notes ? { notes: detailsPayload.notes } : {}),
              updated_at: detailsPayload.updatedAt || new Date().toISOString(),
              is_pending_sync: true,
            });
          }
          break;
        }

        case 'ARCHIVE_SHIPMENT': {
          const archivePayload = payload as any;
          const target = resultMap.get(archivePayload.shipmentId);
          if (target) {
            resultMap.set(archivePayload.shipmentId, {
              ...target,
              is_archived: archivePayload.isArchived,
              updated_at: archivePayload.updatedAt || new Date().toISOString(),
              is_pending_sync: true,
            });
          }
          break;
        }

        default:
          break;
      }
    }

    return Array.from(resultMap.values());
  }

  /**
   * Helper that fetches pending mutations for a user from SQLite and overlays them on the provided list.
   */
  static rehydrateUserShipments(shipments: any[], userId?: string | null): any[] {
    if (!userId) return shipments || [];
    try {
      const activeMutations = OfflineQueueRepository.getActiveMutations(userId);
      return this.applyPendingMutations(shipments, activeMutations);
    } catch {
      return shipments || [];
    }
  }
}
