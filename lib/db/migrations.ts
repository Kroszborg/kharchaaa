import type { SQLiteDatabase } from 'expo-sqlite';
import {
  SQL_ACCOUNTS,
  SQL_CATEGORIES,
  SQL_INDEXES,
  SQL_MERCHANTS,
  SQL_SCHEMA_MIGRATIONS,
  SQL_SYNC_QUEUE,
  SQL_TRANSACTIONS,
} from './schema';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/lib/mock-data';

// Each entry is a migration version → SQL to run
const MIGRATIONS: { version: number; up: (db: SQLiteDatabase) => Promise<void> }[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(SQL_CATEGORIES);
      await db.execAsync(SQL_MERCHANTS);
      await db.execAsync(SQL_ACCOUNTS);
      await db.execAsync(SQL_TRANSACTIONS);
      await db.execAsync(SQL_SYNC_QUEUE);
      await db.execAsync(SQL_INDEXES);
      await seedDefaultCategories(db);
    },
  },
  {
    version: 2,
    // Extend accounts table with fields needed for bank account cards
    up: async (db) => {
      const cols = await db.getAllAsync<{ name: string }>("PRAGMA table_info(accounts)");
      const existing = new Set(cols.map(c => c.name));
      if (!existing.has('last_four'))  await db.runAsync("ALTER TABLE accounts ADD COLUMN last_four TEXT NOT NULL DEFAULT ''");
      if (!existing.has('color'))      await db.runAsync("ALTER TABLE accounts ADD COLUMN color TEXT NOT NULL DEFAULT '#6366F1'");
      if (!existing.has('is_default')) await db.runAsync("ALTER TABLE accounts ADD COLUMN is_default INTEGER NOT NULL DEFAULT 0");
      if (!existing.has('created_at')) await db.runAsync("ALTER TABLE accounts ADD COLUMN created_at TEXT NOT NULL DEFAULT (datetime('now'))");
    },
  },
];

async function seedDefaultCategories(db: SQLiteDatabase) {
  const categories = Object.entries(CATEGORY_LABELS).map(([id, name]) => ({
    id,
    name,
    color: CATEGORY_COLORS[id as keyof typeof CATEGORY_COLORS],
    icon: id,
    is_system: 1,
  }));

  for (const cat of categories) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name, color, icon, is_system) VALUES (?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.color, cat.icon, cat.is_system]
    );
  }
}

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Ensure migrations table exists
  await db.execAsync(SQL_SCHEMA_MIGRATIONS);

  const appliedResult = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC'
  );
  const appliedVersions = new Set(appliedResult.map(r => r.version));

  for (const migration of MIGRATIONS) {
    if (appliedVersions.has(migration.version)) continue;

    await migration.up(db);

    await db.runAsync(
      'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
      [migration.version, new Date().toISOString()]
    );
  }
}
