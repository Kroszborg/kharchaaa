import { getDb } from '../database';

export type DBAccount = {
  id: string;
  name: string;
  type: string;
  bank: string | null;
  balance: number;
  last_four: string;
  color: string;
  is_default: number;
  is_active: number;
  created_at: string;
};

export type NewAccount = {
  name: string;
  type: 'savings' | 'current' | 'credit' | 'wallet' | 'cash';
  bank?: string;
  balance?: number;
  lastFour?: string;
  color?: string;
  isDefault?: boolean;
};

export type BankAccount = {
  id: string;
  name: string;
  type: 'savings' | 'current' | 'credit' | 'wallet' | 'cash';
  bank: string;
  balance: number;
  lastFour: string;
  color: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
};

function toAccount(row: DBAccount): BankAccount {
  return {
    id: row.id,
    name: row.name,
    type: row.type as BankAccount['type'],
    bank: row.bank ?? '',
    balance: row.balance,
    lastFour: row.last_four ?? '',
    color: row.color ?? '#6366F1',
    isDefault: row.is_default === 1,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
  };
}

export const accountRepository = {
  async findAll(): Promise<BankAccount[]> {
    const db = getDb();
    const rows = await db.getAllAsync<DBAccount>(
      'SELECT * FROM accounts WHERE is_active = 1 ORDER BY is_default DESC, created_at ASC'
    );
    return rows.map(toAccount);
  },

  async insert(data: NewAccount): Promise<BankAccount> {
    const db = getDb();
    const id = `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    // If this is the first account, make it default
    const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM accounts WHERE is_active = 1');
    const shouldBeDefault = data.isDefault || (count?.count === 0);

    if (shouldBeDefault) {
      await db.runAsync('UPDATE accounts SET is_default = 0 WHERE is_default = 1');
    }

    await db.runAsync(
      `INSERT INTO accounts (id, name, type, bank, balance, last_four, color, is_default, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [id, data.name, data.type, data.bank ?? '', data.balance ?? 0,
       data.lastFour ?? '', data.color ?? '#6366F1', shouldBeDefault ? 1 : 0, now]
    );

    const row = await db.getFirstAsync<DBAccount>('SELECT * FROM accounts WHERE id = ?', [id]);
    return toAccount(row!);
  },

  async update(id: string, data: Partial<NewAccount>): Promise<void> {
    const db = getDb();
    const fields: string[] = [];
    const values: (string | number)[] = [];

    if (data.name !== undefined)     { fields.push('name = ?');      values.push(data.name); }
    if (data.type !== undefined)     { fields.push('type = ?');      values.push(data.type); }
    if (data.bank !== undefined)     { fields.push('bank = ?');      values.push(data.bank); }
    if (data.balance !== undefined)  { fields.push('balance = ?');   values.push(data.balance); }
    if (data.lastFour !== undefined) { fields.push('last_four = ?'); values.push(data.lastFour); }
    if (data.color !== undefined)    { fields.push('color = ?');     values.push(data.color); }

    if (fields.length === 0) return;
    values.push(id);
    await db.runAsync(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values);
  },

  async updateBalance(id: string, balance: number): Promise<void> {
    const db = getDb();
    await db.runAsync('UPDATE accounts SET balance = ? WHERE id = ?', [balance, id]);
  },

  async setDefault(id: string): Promise<void> {
    const db = getDb();
    await db.runAsync('UPDATE accounts SET is_default = 0');
    await db.runAsync('UPDATE accounts SET is_default = 1 WHERE id = ?', [id]);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.runAsync('UPDATE accounts SET is_active = 0 WHERE id = ?', [id]);
  },

  async count(): Promise<number> {
    const db = getDb();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM accounts WHERE is_active = 1'
    );
    return result?.count ?? 0;
  },
};
