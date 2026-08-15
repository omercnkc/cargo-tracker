import * as SQLite from 'expo-sqlite';

/**
 * Offline Mutasyon Kuyruğu DDL SQL Şeması
 */
export const CREATE_MUTATIONS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS mutations (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  parent_mutation_id TEXT,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'failed', 'dead', 'conflict', 'blocked')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  processing_started_at TEXT,
  last_error TEXT,
  server_data TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (parent_mutation_id) REFERENCES mutations(id) ON DELETE SET NULL
);
`;

/**
 * Yerel Kargo Önbellek DDL SQL Şeması (Read-layer SSOT)
 */
export const CREATE_SHIPMENTS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY NOT NULL,
  tracking_number TEXT NOT NULL,
  carrier_id TEXT,
  title TEXT,
  status TEXT NOT NULL,
  base_version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);
`;

/**
 * Performans ve Hızlı Sorgulama İndeksleri
 */
export const CREATE_INDEXES_SQL = `
CREATE INDEX IF NOT EXISTS idx_mutations_status ON mutations(status);
CREATE INDEX IF NOT EXISTS idx_mutations_user_id ON mutations(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
`;

/**
 * Veritabanında tabloları ve indeksleri oluşturur.
 */
export const createSchemaTables = (db: SQLite.SQLiteDatabase): void => {
  db.execSync(CREATE_MUTATIONS_TABLE_SQL);
  db.execSync(CREATE_SHIPMENTS_TABLE_SQL);
  db.execSync(CREATE_INDEXES_SQL);
};
