import * as FileSystem from 'expo-file-system';
import { supabase } from '../../../services/supabase/supabase';
import { UploadPodImagePayload } from '../types/offline.types';
import { PodStorageRepository } from '../repositories/podStorage.repository';

const FS = FileSystem as any;

export interface PodUploadResult {
  publicUrl: string;
  storagePath: string;
  isExisting: boolean;
}

/**
 * Base64 string'i Uint8Array ArrayBuffer'a çevirir.
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '');
  if (typeof globalThis.atob === 'function') {
    const binaryString = globalThis.atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
  return Uint8Array.from(Buffer.from(cleanBase64, 'base64')).buffer;
}

export class PodUploadService {
  private static BUCKET_NAME = 'pod-images';

  /**
   * Uploads a local POD image to Supabase Storage with pre-flight idempotency check.
   */
  static async uploadPodImage(
    payload: UploadPodImagePayload,
    userId: string,
    idempotencyKey?: string
  ): Promise<PodUploadResult> {
    const rawFilename = decodeURIComponent(payload.localFileUri).split('?')[0].split('/').pop() || `${payload.shipmentId}_${Date.now()}.jpg`;
    const filename = rawFilename.includes('.') ? rawFilename : `${rawFilename}.jpg`;
    const storagePath = `${userId}/${filename}`;

    // 1. Pre-flight Check: Check if file already exists in Supabase Storage (Idempotency)
    try {
      const { data: existingList } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(userId, { search: filename });

      if (existingList && existingList.some((item) => item.name === filename)) {
        const { data: urlData } = supabase.storage
          .from(this.BUCKET_NAME)
          .getPublicUrl(storagePath);

        return {
          publicUrl: urlData.publicUrl,
          storagePath,
          isExisting: true,
        };
      }
    } catch {
      // If list check fails, proceed with upload attempt
    }

    // 2. Read local file as base64
    let base64Data = '';
    try {
      base64Data = await FS.readAsStringAsync(payload.localFileUri, {
        encoding: FS.EncodingType?.Base64 || 'base64',
      });
    } catch (err) {
      throw new Error(`Local POD image file could not be read: ${err instanceof Error ? err.message : String(err)}`);
    }

    // 3. Upload to Supabase Storage Bucket
    const arrayBuffer = base64ToArrayBuffer(base64Data);
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(storagePath, arrayBuffer, {
        contentType: payload.mimeType || 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Supabase Storage upload failed: ${uploadError.message}`);
    }

    // 4. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // 5. Create shipment event & update shipment delivered status with correct database schema columns
    try {
      await supabase.from('shipment_events').insert({
        shipment_id: payload.shipmentId,
        status: 'delivered',
        description: 'Teslimat kanıtı (POD) fotoğrafı yüklendi',
        location: 'Teslim Adresi',
        event_time: payload.capturedAt || new Date().toISOString(),
      } as any);

      await (supabase.from('shipments') as any)
        .update({
          current_status: 'delivered',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.shipmentId);
    } catch {
      // Event logging error ignored as media upload succeeded
    }

    // 6. Cleanup local storage file after successful upload
    await PodStorageRepository.deleteLocalPodImage(payload.localFileUri);

    return {
      publicUrl,
      storagePath,
      isExisting: false,
    };
  }
}
