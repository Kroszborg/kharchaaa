// SQL DDL — single source of truth for the local SQLite schema

export const SQL_SCHEMA_MIGRATIONS = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version  INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  );
`;

export const SQL_CATEGORIES = `
  CREATE TABLE IF NOT EXISTS categories (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    color      TEXT NOT NULL,
    icon       TEXT NOT NULL,
    is_system  INTEGER NOT NULL DEFAULT 1
  );
`;

export const SQL_MERCHANTS = `
  CREATE TABLE IF NOT EXISTS merchants (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    category_id TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`;

export const SQL_ACCOUNTS = `
  CREATE TABLE IF NOT EXISTS accounts (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'bank',
    bank       TEXT,
    balance    REAL NOT NULL DEFAULT 0,
    is_active  INTEGER NOT NULL DEFAULT 1
  );
`;

export const SQL_TRANSACTIONS = `
  CREATE TABLE IF NOT EXISTS transactions (
    id            TEXT PRIMARY KEY,
    amount        REAL NOT NULL,
    type          TEXT NOT NULL CHECK(type IN ('debit', 'credit')),
    merchant_name TEXT NOT NULL,
    category_id   TEXT,
    account       TEXT,
    source        TEXT NOT NULL DEFAULT 'manual',
    date          TEXT NOT NULL,
    note          TEXT,
    metadata      TEXT,
    synced_at     TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`;

export const SQL_SYNC_QUEUE = `
  CREATE TABLE IF NOT EXISTS sync_queue (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    entity_id   TEXT NOT NULL,
    operation   TEXT NOT NULL,
    payload     TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    attempts    INTEGER NOT NULL DEFAULT 0
  );
`;

// Create index for faster date range queries
export const SQL_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
`;
