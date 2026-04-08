/**
 * Insights Engine
 * Generates human-readable insight strings from transaction data.
 * Runs locally — no network call needed.
 */

import type { Transaction } from '@/lib/mock-data';

export interface Insight {
  id: string;
  title: string;
  subtitle: string;
  type: 'positive' | 'warning' | 'neutral';
}

function currentMonthTxns(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
}

function prevMonthTxns(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
  });
}

function totalSpend(txns: Transaction[]): number {
  return txns.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
}

function totalIncome(txns: Transaction[]): number {
  return txns.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function generateInsights(transactions: Transaction[]): Insight[] {
  const insights: Insight[] = [];
  const curr = currentMonthTxns(transactions);
  const prev = prevMonthTxns(transactions);

  const currSpend = totalSpend(curr);
  const prevSpend = totalSpend(prev);
  const currIncome = totalIncome(curr);

  // 1. Spend vs previous month
  if (prevSpend > 0 && currSpend > 0) {
    const delta = ((currSpend - prevSpend) / prevSpend) * 100;
    if (delta < -10) {
      insights.push({
        id: 'spend_down',
        title: `${Math.abs(Math.round(delta))}% less than last month`,
        subtitle: `Spent ${fmt(currSpend)} vs ${fmt(prevSpend)}`,
        type: 'positive',
      });
    } else if (delta > 20) {
      insights.push({
        id: 'spend_up',
        title: `Spending up ${Math.round(delta)}% this month`,
        subtitle: `${fmt(currSpend)} vs ${fmt(prevSpend)} last month`,
        type: 'warning',
      });
    }
  }

  // 2. Savings rate
  if (currIncome > 0) {
    const rate = Math.round(((currIncome - currSpend) / currIncome) * 100);
    if (rate >= 20) {
      insights.push({
        id: 'savings_rate',
        title: `Saving ${rate}% of income`,
        subtitle: fmt(currIncome - currSpend) + ' saved this month',
        type: 'positive',
      });
    } else if (rate < 0) {
      insights.push({
        id: 'overspend',
        title: 'Spending exceeds income',
        subtitle: `Deficit of ${fmt(Math.abs(currIncome - currSpend))} this month`,
        type: 'warning',
      });
    }
  }

  // 3. Top merchant this month
  const merchantTotals: Record<string, number> = {};
  curr.filter(t => t.type === 'debit').forEach(t => {
    merchantTotals[t.merchant] = (merchantTotals[t.merchant] ?? 0) + t.amount;
  });
  const topMerchant = Object.entries(merchantTotals).sort((a, b) => b[1] - a[1])[0];
  if (topMerchant && topMerchant[1] > 0) {
    insights.push({
      id: 'top_merchant',
      title: `${topMerchant[0]} is your top spend`,
      subtitle: fmt(topMerchant[1]) + ' this month',
      type: 'neutral',
    });
  }

  // 4. Spending-free streaks
  if (curr.length > 0) {
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const hasSpend = curr.some(t => {
        const td = new Date(t.date);
        return t.type === 'debit' &&
          td.getDate() === d.getDate() &&
          td.getMonth() === d.getMonth();
      });
      if (!hasSpend) streak++;
      else break;
    }
    if (streak >= 2) {
      insights.push({
        id: 'streak',
        title: `${streak} day${streak > 1 ? 's' : ''} without spending`,
        subtitle: 'Keep the streak going!',
        type: 'positive',
      });
    }
  }

  // 5. Average transaction size
  const debits = curr.filter(t => t.type === 'debit');
  if (debits.length >= 5) {
    const avg = Math.round(currSpend / debits.length);
    insights.push({
      id: 'avg_tx',
      title: `Avg transaction: ${fmt(avg)}`,
      subtitle: `Across ${debits.length} expenses this month`,
      type: 'neutral',
    });
  }

  // Fallback
  if (insights.length === 0) {
    insights.push({
      id: 'start',
      title: 'Track more to unlock insights',
      subtitle: 'Add at least a week of transactions',
      type: 'neutral',
    });
  }

  return insights;
}
