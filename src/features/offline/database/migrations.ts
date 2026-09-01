import * as SQLite from 'expo-sqlite';
import { createSchemaTables } from './schema';

export const CURRENT_DATABASE_VERSION = 1;

/**
 * SQLite veritabanı kullanıcı versiyonunu döndürür (`PRAGMA user_version`).
 */
export const getDatabaseVersion = (db: SQLite.SQLiteDatabase): number => {
  const result = db.getFirstSync<{ user_version: number }>('PRAGMA user_version;');
  return result?.user_version ?? 0;
};

/**
 * Veritabanı versiyonunu günceller.
 */
export const setDatabaseVersion = (db: SQLite.SQLiteDatabase, version: number): void => {
  db.execSync(`PRAGMA user_version = ${version};`);
};

/**
 * Veritabanı şemasını sıfırlayarak kurtarır (Corruption Recovery).
 */
export const resetDatabaseSchema = (db: SQLite.SQLiteDatabase): void => {
  db.execSync('DROP TABLE IF EXISTS mutations;');
  db.execSync('DROP TABLE IF EXISTS shipments;');
  setDatabaseVersion(db, 0);
  createSchemaTables(db);
  setDatabaseVersion(db, CURRENT_DATABASE_VERSION);
};

/**
 * Veritabanı SQL migration adımlarını çalıştırır.
 */
export const runMigrations = (db: SQLite.SQLiteDatabase): void => {
  try {
    const currentVersion = getDatabaseVersion(db);

    if (currentVersion < 1) {
      createSchemaTables(db);
      setDatabaseVersion(db, 1);
    }

    // Gelecekte V2, V3 vb. eklendiğinde buraya conditional adımlar eklenecektir.
  } catch {
    // Bozulma veya migration çökmesinde Corruption Recovery Spike mantığı çalışır:
    resetDatabaseSchema(db);
  }
};
