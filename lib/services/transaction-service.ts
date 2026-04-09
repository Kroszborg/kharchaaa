import type { Category, Transaction } from '@/lib/mock-data';
import { transactionRepository, type NewTransaction } from '@/lib/db/repositories/transaction-repository';
import { detectCategory } from './category-service';
import { syncService } from './sync-service';

export type AddTransactionInput = {
  amount: number;
  type: 'debit' | 'credit';
  merchant: string;
  category?: Category;
  account?: string;
  note?: string;
  date?: string;
  source?: 'manual' | 'sms' | 'email' | 'import';
};

export const transactionService = {
  /**
   * Add a new transaction (offline-first).
   * Saves locally immediately, syncs to backend in background.
   * Auto-detects category from merchant name if not provided.
   */
  async add(input: AddTransactionInput): Promise<Transaction> {
    const category = input.category ?? detectCategory(input.merchant);

    const data: NewTransaction = {
      amount: input.amount,
      type: input.type,
      merchant: input.merchant.trim(),
      category,
      account: input.account,
      source: input.source ?? 'manual',
      date: input.date ?? new Date().toISOString(),
      note: input.note?.trim(),
    };

    // Queue for sync (saves locally + syncs in background)
    return syncService.queueTransaction(data);
  },

  async getAll(): Promise<Transaction[]> {
    return transactionRepository.findAll();
  },

  async getForCurrentMonth(): Promise<Transaction[]> {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    return transactionRepository.findByDateRange(from, to);
  },

  async delete(id: string): Promise<void> {
    return transactionRepository.delete(id);
  },

  async update(id: string, data: Partial<AddTransactionInput>): Promise<void> {
    return transactionRepository.update(id, {
      amount: data.amount,
      type: data.type,
      merchant: data.merchant,
      category: data.category,
      note: data.note,
    });
  },

  /**
   * Seed demo transactions on first launch.
   * Only runs if the DB is empty.
   */
  async seedDemoData(mockTransactions: Transaction[]): Promise<void> {
    const count = await transactionRepository.count();
    if (count > 0) return;

    const items: NewTransaction[] = mockTransactions.map(t => ({
      amount: t.amount,
      type: t.type,
      merchant: t.merchant,
      category: t.category,
      account: t.account,
      source: t.source,
      date: t.date,
      note: t.note,
    }));

    await transactionRepository.bulkInsert(items);
  },
};
