export type RepositoryMutationResult<T> =
  | { synced: true; data: T }
  | { synced: false; queued: true; mutationId: string }
  | { synced: false; conflict: true; mutationId: string; serverData: T; serverVersion?: number };

export type MutationType =
  | 'ADD_SHIPMENT'
  | 'UPDATE_SHIPMENT_STATUS'
  | 'UPDATE_SHIPMENT_DETAILS'
  | 'ARCHIVE_SHIPMENT'
  | 'UPLOAD_POD_IMAGE';

export interface AddShipmentPayload {
  clientShipmentId: string;
  trackingNumber: string;
  carrierId: string;
  title: string;
  senderAddress?: string;
  receiverAddress?: string;
  createdAt: string;
}

export interface UpdateShipmentStatusPayload {
  shipmentId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  location?: string;
  note?: string;
  updatedAt: string;
  baseVersion: number;
}

export interface UpdateShipmentDetailsPayload {
  shipmentId: string;
  title?: string;
  notes?: string;
  updatedAt: string;
  baseVersion: number;
}

export interface ArchiveShipmentPayload {
  shipmentId: string;
  isArchived: boolean;
  updatedAt: string;
  baseVersion: number;
}

export interface UploadPodImagePayload {
  shipmentId: string;
  localFileUri: string;
  mimeType: string;
  capturedAt: string;
}

export type MutationPayload =
  | { type: 'ADD_SHIPMENT'; payload: AddShipmentPayload }
  | { type: 'UPDATE_SHIPMENT_STATUS'; payload: UpdateShipmentStatusPayload }
  | { type: 'UPDATE_SHIPMENT_DETAILS'; payload: UpdateShipmentDetailsPayload }
  | { type: 'ARCHIVE_SHIPMENT'; payload: ArchiveShipmentPayload }
  | { type: 'UPLOAD_POD_IMAGE'; payload: UploadPodImagePayload };

export type MutationStatus = 'pending' | 'processing' | 'failed' | 'dead' | 'conflict' | 'blocked';

export interface PendingMutation {
  id: string; // Mutasyon benzersiz işlem UUID'si
  userId: string; // Supabase user.id
  idempotencyKey: string; // Sabit idempotency anahtarı
  parentMutationId?: string | null;
  mutation: MutationPayload;
  createdAt: string;
  processingStartedAt?: string | null;
  retryCount: number;
  maxRetries: number;
  status: MutationStatus;
  lastError?: string;
  serverData?: string | null; // Nullable JSON metni
}

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'conflict' | 'error' | 'success';

export interface ShipmentCacheItem {
  id: string;
  tracking_number: string;
  status: string;
  base_version: number;
  is_pending_sync?: boolean;
  is_tombstone?: boolean;
  tombstoned_at?: string;
  [key: string]: unknown;
}
