import { getDatabase } from '../database/db';
import { PendingMutation, MutationStatus, MutationPayload } from '../types/offline.types';
import { useOfflineSyncStore } from '../store/offlineSync.store';

export class OfflineQueueRepository {
  /**
   * Kuyruğa yeni mutasyon ekler (SQLite `mutations` tablosu).
   */
  static enqueueMutation(
    data: Omit<PendingMutation, 'id' | 'createdAt' | 'retryCount' | 'status' | 'maxRetries'> & {
      id?: string;
      status?: MutationStatus;
      maxRetries?: number;
    }
  ): PendingMutation {
    const db = getDatabase();
    const id = data.id || `mut_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const createdAt = new Date().toISOString();
    const status = data.status || 'pending';
    const retryCount = 0;
    const maxRetries = data.maxRetries || 5;

    const newMutation: PendingMutation = {
      id,
      userId: data.userId,
      idempotencyKey: data.idempotencyKey,
      parentMutationId: data.parentMutationId || null,
      mutation: data.mutation,
      createdAt,
      processingStartedAt: null,
      retryCount,
      maxRetries,
      status,
      lastError: data.lastError || undefined,
      serverData: data.serverData || null,
    };

    const sql = `
      INSERT OR REPLACE INTO mutations (
        id, user_id, idempotency_key, parent_mutation_id, type, payload,
        status, retry_count, max_retries, processing_started_at, last_error,
        server_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    db.runSync(sql, [
      id,
      data.userId,
      data.idempotencyKey,
      data.parentMutationId || null,
      data.mutation.type,
      JSON.stringify(data.mutation),
      status,
      retryCount,
      maxRetries,
      null,
      data.lastError || null,
      data.serverData || null,
      createdAt,
    ]);

    // Zustand store güncellemesi
    const pendingCount = this.getPendingCount(data.userId);
    useOfflineSyncStore.getState().setPendingCount(pendingCount);

    return newMutation;
  }

  /**
   * Kullanıcının bekleyen (status = 'pending') mutasyonlarını tarih sırasına göre getirir.
   */
  static getPendingMutations(userId: string): PendingMutation[] {
    const db = getDatabase();
    const sql = `
      SELECT * FROM mutations
      WHERE user_id = ? AND status = 'pending'
      ORDER BY created_at ASC;
    `;

    const rows = db.getAllSync<any>(sql, [userId]);
    return rows.map(this.mapRowToMutation);
  }

  /**
   * Belirli bir mutasyonu ID ile getirir.
   */
  static getMutationById(id: string): PendingMutation | null {
    const db = getDatabase();
    const sql = `SELECT * FROM mutations WHERE id = ?;`;
    const row = db.getFirstSync<any>(sql, [id]);
    return row ? this.mapRowToMutation(row) : null;
  }

  /**
   * Mutasyon durumunu günceller.
   */
  static updateMutationStatus(
    id: string,
    status: MutationStatus,
    lastError?: string,
    serverData?: string | null
  ): void {
    const db = getDatabase();
    const mutation = this.getMutationById(id);
    if (!mutation) return;

    let retryCount = mutation.retryCount;
    if (status === 'failed') {
      retryCount += 1;
      if (retryCount >= mutation.maxRetries) {
        status = 'dead';
      }
    }

    const sql = `
      UPDATE mutations
      SET status = ?, retry_count = ?, last_error = ?, server_data = ?
      WHERE id = ?;
    `;

    db.runSync(sql, [status, retryCount, lastError || null, serverData || null, id]);

    // Eğer mutasyon engellendiyse (dead veya conflict), alt mutasyonları 'blocked' yap
    if (status === 'dead' || status === 'conflict') {
      this.markParentFailedCascading(id);
    }

    const pendingCount = this.getPendingCount(mutation.userId);
    const conflictCount = this.getConflictCount(mutation.userId);
    useOfflineSyncStore.getState().setPendingCount(pendingCount);
    useOfflineSyncStore.getState().setConflictCount(conflictCount);
  }

  /**
   * Ebeveyn mutasyon düştüğünde bağlı tüm alt mutasyonları 'blocked' durumuna getirir.
   */
  static markParentFailedCascading(parentMutationId: string): void {
    const db = getDatabase();
    const sql = `
      UPDATE mutations
      SET status = 'blocked', last_error = 'Ebeveyn mutasyon çakışmaya düştü veya başarısız oldu'
      WHERE parent_mutation_id = ? AND status = 'pending';
    `;
    db.runSync(sql, [parentMutationId]);
  }

  /**
   * Ebeveyn mutasyon çözüldüğünde bağlı engellenmiş alt mutasyonları tekrar 'pending' konumuna alır.
   */
  static unblockDependentMutations(parentMutationId: string): void {
    const db = getDatabase();
    const sql = `
      UPDATE mutations
      SET status = 'pending', last_error = NULL
      WHERE parent_mutation_id = ? AND status = 'blocked';
    `;
    db.runSync(sql, [parentMutationId]);
  }

  /**
   * Çakışan mutasyonu SQLite'a kaydeder (status = 'conflict').
   */
  static saveConflictMutation(conflictData: PendingMutation): void {
    const db = getDatabase();
    const sql = `
      INSERT OR REPLACE INTO mutations (
        id, user_id, idempotency_key, parent_mutation_id, type, payload,
        status, retry_count, max_retries, processing_started_at, last_error,
        server_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'conflict', ?, ?, ?, ?, ?, ?);
    `;

    db.runSync(sql, [
      conflictData.id,
      conflictData.userId,
      conflictData.idempotencyKey,
      conflictData.parentMutationId || null,
      conflictData.mutation.type,
      JSON.stringify(conflictData.mutation),
      conflictData.retryCount || 0,
      conflictData.maxRetries || 5,
      conflictData.processingStartedAt || null,
      conflictData.lastError || null,
      conflictData.serverData || null,
      conflictData.createdAt || new Date().toISOString(),
    ]);

    this.markParentFailedCascading(conflictData.id);

    const pendingCount = this.getPendingCount(conflictData.userId);
    const conflictCount = this.getConflictCount(conflictData.userId);
    useOfflineSyncStore.getState().setPendingCount(pendingCount);
    useOfflineSyncStore.getState().setConflictCount(conflictCount);
  }

  /**
   * Kullanıcı çakışmayı çözdüğünde (Re-basing) mutasyonu taze idempotency key ile 'pending' yapar.
   */
  static updateConflictResolution(params: {
    mutationId: string;
    updatedMutation: MutationPayload;
    newIdempotencyKey: string;
    status?: MutationStatus;
  }): void {
    const db = getDatabase();
    const mutation = this.getMutationById(params.mutationId);
    if (!mutation) return;

    const newStatus = params.status || 'pending';
    const sql = `
      UPDATE mutations
      SET payload = ?, idempotency_key = ?, status = ?, server_data = NULL, last_error = NULL
      WHERE id = ?;
    `;

    db.runSync(sql, [
      JSON.stringify(params.updatedMutation),
      params.newIdempotencyKey,
      newStatus,
      params.mutationId,
    ]);

    if (newStatus === 'pending') {
      this.unblockDependentMutations(params.mutationId);
    }

    const pendingCount = this.getPendingCount(mutation.userId);
    const conflictCount = this.getConflictCount(mutation.userId);
    useOfflineSyncStore.getState().setPendingCount(pendingCount);
    useOfflineSyncStore.getState().setConflictCount(conflictCount);
  }

  /**
   * Başarıyla senkronize edilen mutasyonu veritabanından siler.
   */
  static removeMutation(id: string): void {
    const db = getDatabase();
    const mutation = this.getMutationById(id);
    if (!mutation) return;

    const sql = `DELETE FROM mutations WHERE id = ?;`;
    db.runSync(sql, [id]);

    // Bağımlı mutasyonların engelini kaldır
    this.unblockDependentMutations(id);

    const pendingCount = this.getPendingCount(mutation.userId);
    const conflictCount = this.getConflictCount(mutation.userId);
    useOfflineSyncStore.getState().setPendingCount(pendingCount);
    useOfflineSyncStore.getState().setConflictCount(conflictCount);
  }

  /**
   * Kullanıcının bekleyen mutasyon sayısını döndürür.
   */
  static getPendingCount(userId: string): number {
    const db = getDatabase();
    const sql = `SELECT COUNT(*) as count FROM mutations WHERE user_id = ? AND status = 'pending';`;
    const result = db.getFirstSync<{ count: number }>(sql, [userId]);
    return result?.count ?? 0;
  }

  /**
   * Kullanıcının çakışmadaki mutasyon sayısını döndürür.
   */
  static getConflictCount(userId: string): number {
    const db = getDatabase();
    const sql = `SELECT COUNT(*) as count FROM mutations WHERE user_id = ? AND status = 'conflict';`;
    const result = db.getFirstSync<{ count: number }>(sql, [userId]);
    return result?.count ?? 0;
  }

  /**
   * Veritabanı satirini PendingMutation nesnesine dönüştürür.
   */
  private static mapRowToMutation(row: any): PendingMutation {
    return {
      id: row.id,
      userId: row.user_id,
      idempotencyKey: row.idempotency_key,
      parentMutationId: row.parent_mutation_id,
      mutation: JSON.parse(row.payload),
      createdAt: row.created_at,
      processingStartedAt: row.processing_started_at,
      retryCount: row.retry_count,
      maxRetries: row.max_retries,
      status: row.status as MutationStatus,
      lastError: row.last_error,
      serverData: row.server_data,
    };
  }
}
