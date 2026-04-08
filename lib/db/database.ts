import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync('kharchaaa.db');
  // Enable WAL mode for better concurrent read performance
  await _db.execAsync('PRAGMA journal_mode = WAL;');
  await _db.execAsync('PRAGMA foreign_keys = ON;');
  return _db;
}

export function getDb(): SQLite.SQLiteDatabase {
  if (!_db) throw new Error('Database not initialized. Call initDatabase() first.');
  return _db;
}
