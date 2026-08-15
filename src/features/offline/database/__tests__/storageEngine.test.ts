import { getDatabase, closeDatabase } from '../db';
import { createSchemaTables } from '../schema';
import { runMigrations, getDatabaseVersion, resetDatabaseSchema } from '../migrations';

// expo-sqlite mock
jest.mock('expo-sqlite', () => {
  const store = new Map<string, any[]>();
  let userVersion = 0;

  return {
    openDatabaseSync: jest.fn(() => ({
      execSync: jest.fn((sql: string) => {
        if (sql.includes('PRAGMA user_version =')) {
          const match = sql.match(/PRAGMA user_version = (\d+);/);
          if (match) userVersion = parseInt(match[1], 10);
        }
        if (sql.includes('DROP TABLE')) {
          store.clear();
        }
      }),
      getFirstSync: jest.fn((sql: string) => {
        if (sql.includes('PRAGMA user_version')) {
          return { user_version: userVersion };
        }
        return null;
      }),
      runSync: jest.fn((sql: string, params?: any[]) => {
        return { changes: 1, lastInsertRowId: 1 };
      }),
      getAllSync: jest.fn((sql: string, params?: any[]) => {
        return [];
      }),
      closeSync: jest.fn(),
    })),
  };
});

describe('SQLite Storage Engine & Migration Spike Tests', () => {
  beforeEach(() => {
    closeDatabase();
  });

  it('Veritabanı migration çalıştırıldığında user_version 1 olmalıdır', () => {
    const db = getDatabase();
    runMigrations(db);
    expect(getDatabaseVersion(db)).toBe(1);
  });

  it('Veritabanı bozulmasında resetDatabaseSchema şemayı sıfırlayıp yeniden kurmalıdır', () => {
    const db = getDatabase();
    runMigrations(db);

    expect(() => resetDatabaseSchema(db)).not.toThrow();
    expect(getDatabaseVersion(db)).toBe(1);
  });

  it('createSchemaTables tüm DDL ve index komutlarını hatasız çalıştırmalıdır', () => {
    const db = getDatabase();
    expect(() => createSchemaTables(db)).not.toThrow();
  });
});
