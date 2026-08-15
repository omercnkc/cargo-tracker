import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'cargo_tracker_offline.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * SQLite veritabanı bağlantı örneğini döndürür (Singleton).
 */
export const getDatabase = (): SQLite.SQLiteDatabase => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
    // Yabancı anahtar (Foreign Key) kısıtlamalarını etkinleştir
    dbInstance.execSync('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
};

/**
 * Test ve sıfırlama senaryoları için veritabanı bağlantısını kapatır.
 */
export const closeDatabase = (): void => {
  if (dbInstance) {
    dbInstance.closeSync();
    dbInstance = null;
  }
};
