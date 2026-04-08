import { getDb } from '../database';

export type DBCategory = {
  id: string;
  name: string;
  color: string;
  icon: string;
  is_system: number;
};

export const categoryRepository = {
  async findAll(): Promise<DBCategory[]> {
    const db = getDb();
    return db.getAllAsync<DBCategory>('SELECT * FROM categories ORDER BY name ASC');
  },

  async findById(id: string): Promise<DBCategory | null> {
    const db = getDb();
    return db.getFirstAsync<DBCategory>('SELECT * FROM categories WHERE id = ?', [id]);
  },

  async upsert(cat: DBCategory): Promise<void> {
    const db = getDb();
    await db.runAsync(
      `INSERT OR REPLACE INTO categories (id, name, color, icon, is_system) VALUES (?, ?, ?, ?, ?)`,
      [cat.id, cat.name, cat.color, cat.icon, cat.is_system]
    );
  },
};
