export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'salary'
  | 'other';

export type TransactionType = 'debit' | 'credit';
export type TransactionSource = 'upi' | 'bank' | 'manual';

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  merchant: string;
  category: Category;
  date: string; // ISO date string
  note?: string;
  source: TransactionSource;
  account: string;
};

export type CategorySummary = {
  category: Category;
  total: number;
  count: number;
  percentage: number;
  color: string;
};

export const CATEGORY_COLORS: Record<Category, string> = {
  food: '#FF6135',
  transport: '#00C2CB',
  shopping: '#A855F7',
  utilities: '#3B82F6',
  entertainment: '#EC4899',
  health: '#10B981',
  salary: '#00D97E',
  other: '#6B7280',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  utilities: 'Utilities',
  entertainment: 'Entertainment',
  health: 'Health',
  salary: 'Salary',
  other: 'Other',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  // April 5
  {
    id: 'txn_001',
    amount: 342,
    type: 'debit',
    merchant: 'Swiggy',
    category: 'food',
    date: '2026-04-05T19:30:00',
    note: 'Dinner',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_002',
    amount: 149,
    type: 'debit',
    merchant: 'Uber',
    category: 'transport',
    date: '2026-04-05T09:15:00',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  // April 4
  {
    id: 'txn_003',
    amount: 2499,
    type: 'debit',
    merchant: 'Amazon',
    category: 'shopping',
    date: '2026-04-04T14:22:00',
    note: 'Noise Buds',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_004',
    amount: 649,
    type: 'debit',
    merchant: 'Zomato',
    category: 'food',
    date: '2026-04-04T20:45:00',
    note: 'Biryani for two',
    source: 'upi',
    account: 'ICICI ••8823',
  },
  {
    id: 'txn_005',
    amount: 199,
    type: 'debit',
    merchant: 'Spotify',
    category: 'entertainment',
    date: '2026-04-04T00:00:00',
    note: 'Monthly subscription',
    source: 'bank',
    account: 'ICICI ••8823',
  },
  // April 3
  {
    id: 'txn_006',
    amount: 85000,
    type: 'credit',
    merchant: 'Infosys Ltd.',
    category: 'salary',
    date: '2026-04-03T10:00:00',
    note: 'March 2026 salary',
    source: 'bank',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_007',
    amount: 320,
    type: 'debit',
    merchant: 'Ola',
    category: 'transport',
    date: '2026-04-03T18:10:00',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_008',
    amount: 1299,
    type: 'debit',
    merchant: 'PharmEasy',
    category: 'health',
    date: '2026-04-03T12:30:00',
    note: 'Monthly medicines',
    source: 'upi',
    account: 'ICICI ••8823',
  },
  // April 2
  {
    id: 'txn_009',
    amount: 799,
    type: 'debit',
    merchant: 'Netflix',
    category: 'entertainment',
    date: '2026-04-02T00:00:00',
    note: 'Monthly plan',
    source: 'bank',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_010',
    amount: 3499,
    type: 'debit',
    merchant: 'Myntra',
    category: 'shopping',
    date: '2026-04-02T16:45:00',
    note: 'Summer collection',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_011',
    amount: 128,
    type: 'debit',
    merchant: 'McDonald\'s',
    category: 'food',
    date: '2026-04-02T13:20:00',
    source: 'upi',
    account: 'ICICI ••8823',
  },
  {
    id: 'txn_012',
    amount: 2499,
    type: 'debit',
    merchant: 'Airtel',
    category: 'utilities',
    date: '2026-04-02T09:00:00',
    note: 'Broadband April',
    source: 'bank',
    account: 'HDFC ••4521',
  },
  // April 1
  {
    id: 'txn_013',
    amount: 259,
    type: 'debit',
    merchant: 'Rapido',
    category: 'transport',
    date: '2026-04-01T08:30:00',
    source: 'upi',
    account: 'ICICI ••8823',
  },
  {
    id: 'txn_014',
    amount: 520,
    type: 'debit',
    merchant: 'Starbucks',
    category: 'food',
    date: '2026-04-01T10:00:00',
    note: 'Coffee + snack',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_015',
    amount: 1800,
    type: 'debit',
    merchant: 'BookMyShow',
    category: 'entertainment',
    date: '2026-04-01T20:00:00',
    note: 'Movie tickets ×2',
    source: 'upi',
    account: 'ICICI ••8823',
  },
  {
    id: 'txn_016',
    amount: 899,
    type: 'debit',
    merchant: 'Apollo Pharmacy',
    category: 'health',
    date: '2026-04-01T15:00:00',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_017',
    amount: 1999,
    type: 'debit',
    merchant: 'IRCTC',
    category: 'transport',
    date: '2026-04-01T11:00:00',
    note: 'Bangalore–Mumbai ticket',
    source: 'upi',
    account: 'HDFC ••4521',
  },
  {
    id: 'txn_018',
    amount: 399,
    type: 'debit',
    merchant: 'Jio',
    category: 'utilities',
    date: '2026-04-01T09:00:00',
    note: 'Prepaid recharge',
    source: 'upi',
    account: 'ICICI ••8823',
  },
];

// Compute spend summary excluding credits
export function getMonthlySpend(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCategoryBreakdown(transactions: Transaction[]): CategorySummary[] {
  const debits = transactions.filter(t => t.type === 'debit');
  const total = debits.reduce((sum, t) => sum + t.amount, 0);

  const grouped: Partial<Record<Category, { total: number; count: number }>> = {};
  for (const t of debits) {
    if (!grouped[t.category]) grouped[t.category] = { total: 0, count: 0 };
    grouped[t.category]!.total += t.amount;
    grouped[t.category]!.count += 1;
  }

  return Object.entries(grouped)
    .map(([cat, data]) => ({
      category: cat as Category,
      total: data!.total,
      count: data!.count,
      percentage: Math.round((data!.total / total) * 100),
      color: CATEGORY_COLORS[cat as Category],
    }))
    .sort((a, b) => b.total - a.total);
}

export function getRecentTransactions(transactions: Transaction[], limit = 5): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
