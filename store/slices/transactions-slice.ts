import { getCategoryBreakdown, getMonthlySpend, type CategorySummary, type Transaction } from '@/lib/mock-data';
import { transactionService, type AddTransactionInput } from '@/lib/services/transaction-service';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type TransactionFilter = {
  category: string;
  search: string;
};

interface TransactionsState {
  transactions: Transaction[];
  isLoading: boolean;
  isInitialized: boolean;
  filters: TransactionFilter;

  monthlySpend: number;
  monthlyIncome: number;
  categoryBreakdown: CategorySummary[];

  initialize: () => Promise<void>;
  addTransaction: (input: AddTransactionInput) => Promise<Transaction>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilter: (patch: Partial<TransactionFilter>) => void;
  clearFilters: () => void;
}

const DEFAULT_FILTERS: TransactionFilter = { category: 'all', search: '' };

function isCurrentMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export const useTransactionStore = create<TransactionsState>()(
  immer((set, get) => ({
    transactions: [],
    isLoading: false,
    isInitialized: false,
    filters: DEFAULT_FILTERS,
    monthlySpend: 0,
    monthlyIncome: 0,
    categoryBreakdown: [],

    initialize: async () => {
      if (get().isInitialized) return;
      set(s => { s.isLoading = true; });

      const transactions = await transactionService.getAll();
      const monthTxns = transactions.filter(t => isCurrentMonth(t.date));

      set(s => {
        s.transactions = transactions;
        s.monthlySpend = getMonthlySpend(monthTxns);
        s.monthlyIncome = monthTxns
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0);
        s.categoryBreakdown = getCategoryBreakdown(monthTxns);
        s.isLoading = false;
        s.isInitialized = true;
      });
    },

    addTransaction: async (input) => {
      const txn = await transactionService.add(input);

      set(s => {
        s.transactions.unshift(txn);
        const monthTxns = s.transactions.filter(t => isCurrentMonth(t.date));
        s.monthlySpend = getMonthlySpend(monthTxns);
        s.monthlyIncome = monthTxns
          .filter(t => t.type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0);
        s.categoryBreakdown = getCategoryBreakdown(monthTxns);
      });

      return txn;
    },

    deleteTransaction: async (id) => {
      await transactionService.delete(id);
      set(s => { s.transactions = s.transactions.filter(t => t.id !== id); });
    },

    setFilter: (patch) => {
      set(s => { Object.assign(s.filters, patch); });
    },

    clearFilters: () => {
      set(s => { s.filters = { ...DEFAULT_FILTERS }; });
    },
  }))
);

// ─── Stable individual selectors (no inline objects — avoids getSnapshot loop) ─
export const selectTransactions = (s: TransactionsState) => s.transactions;
export const selectFilters = (s: TransactionsState) => s.filters;
export const selectIsLoading = (s: TransactionsState) => s.isLoading;
export const selectMonthlySpend = (s: TransactionsState) => s.monthlySpend;
export const selectMonthlyIncome = (s: TransactionsState) => s.monthlyIncome;
export const selectCategoryBreakdown = (s: TransactionsState) => s.categoryBreakdown;
