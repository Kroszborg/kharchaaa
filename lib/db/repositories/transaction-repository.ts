import { getDb } from '../database';
import type { Category, Transaction, TransactionType } from '@/lib/mock-data';

export type DBTransaction = {
  id: string;
  amount: number;
  type: TransactionType;
  merchant_name: string;
  category_id: Category | null;
  account: string | null;
  source: string;
  date: string;
  note: string | null;
  created_at: string;
};

export type NewTransaction = {
  amount: number;
  type: TransactionType;
  merchant: string;
  category: Category;
  account?: string;
  source?: string;
  date?: string;
  note?: string;
};

// Map from DB row → app Transaction shape
function toTransaction(row: DBTransaction): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    type: row.type,
    merchant: row.merchant_name,
    category: (row.category_id as Category) ?? 'other',
    account: row.account ?? '',
    source: (row.source as Transaction['source']) ?? 'manual',
    date: row.date,
    note: row.note ?? undefined,
  };
}

export const transactionRepository = {
  async findAll(): Promise<Transaction[]> {
    const db = getDb();
    const rows = await db.getAllAsync<DBTransaction>(
      'SELECT * FROM transactions ORDER BY date DESC'
    );
    return rows.map(toTransaction);
  },

  async findByDateRange(from: string, to: string): Promise<Transaction[]> {
    const db = getDb();
    const rows = await db.getAllAsync<DBTransaction>(
      'SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC',
      [from, to]
    );
    return rows.map(toTransaction);
  },

  async findByCategory(categoryId: Category): Promise<Transaction[]> {
    const db = getDb();
    const rows = await db.getAllAsync<DBTransaction>(
      'SELECT * FROM transactions WHERE category_id = ? ORDER BY date DESC',
      [categoryId]
    );
    return rows.map(toTransaction);
  },

  async findById(id: string): Promise<Transaction | null> {
    const db = getDb();
    const row = await db.getFirstAsync<DBTransaction>(
      'SELECT * FROM transactions WHERE id = ?',
      [id]
    );
    return row ? toTransaction(row) : null;
  },

  async insert(data: NewTransaction): Promise<Transaction> {
    const db = getDb();
    const id = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const date = data.date ?? new Date().toISOString();

    await db.runAsync(
      `INSERT INTO transactions (id, amount, type, merchant_name, category_id, account, source, date, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.amount, data.type, data.merchant, data.category, data.account ?? null, data.source ?? 'manual', date, data.note ?? null]
    );

    return {
      id,
      amount: data.amount,
      type: data.type,
      merchant: data.merchant,
      category: data.category,
      account: data.account ?? '',
      source: (data.source as Transaction['source']) ?? 'manual',
      date,
      note: data.note,
    };
  },

  async update(id: string, data: Partial<NewTransaction>): Promise<void> {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.amount !== undefined) { fields.push('amount = ?'); values.push(data.amount); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }
    if (data.merchant !== undefined) { fields.push('merchant_name = ?'); values.push(data.merchant); }
    if (data.category !== undefined) { fields.push('category_id = ?'); values.push(data.category); }
    if (data.note !== undefined) { fields.push('note = ?'); values.push(data.note); }

    if (fields.length === 0) return;
    values.push(id);

    await db.runAsync(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
  },

  async bulkInsert(items: NewTransaction[]): Promise<void> {
    const db = getDb();
    await db.withTransactionAsync(async () => {
      for (const data of items) {
        const id = `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const date = data.date ?? new Date().toISOString();
        await db.runAsync(
          `INSERT OR IGNORE INTO transactions (id, amount, type, merchant_name, category_id, account, source, date, note)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, data.amount, data.type, data.merchant, data.category, data.account ?? null, data.source ?? 'manual', date, data.note ?? null]
        );
      }
    });
  },

  async getMonthlyTotal(year: number, month: number): Promise<{ spend: number; income: number }> {
    const db = getDb();
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-31`;

    const rows = await db.getAllAsync<{ type: string; total: number }>(
      `SELECT type, SUM(amount) as total FROM transactions WHERE date >= ? AND date <= ? GROUP BY type`,
      [from, to]
    );

    let spend = 0;
    let income = 0;
    for (const row of rows) {
      if (row.type === 'debit') spend = row.total;
      else income = row.total;
    }
    return { spend, income };
  },

  async count(): Promise<number> {
    const db = getDb();
    const row = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM transactions');
    return row?.count ?? 0;
  },
};
