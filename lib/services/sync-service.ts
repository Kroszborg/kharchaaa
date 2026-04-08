/**
 * Sync Service
 * Pushes local transactions to the backend and pulls remote changes.
 * Requires the user to be authenticated (access token stored in SecureStore).
 */

import type { Transaction } from '@/lib/mock-data';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface SyncResult {
  synced: number;
  failed: number;
  pulledAt: string;
}

export const syncService = {
  async push(transactions: Transaction[], accessToken: string): Promise<{ synced: number; failed: number }> {
    const payload = transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      type: t.type === 'debit' ? 'DEBIT' : 'CREDIT',
      merchant: t.merchant,
      category: t.category,
      source: t.source === 'manual' ? 'MANUAL' : t.source?.toUpperCase() ?? 'MANUAL',
      timestamp: t.date,
      note: t.note,
    }));

    const res = await fetch(`${API_BASE}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ transactions: payload }),
    });

    if (!res.ok) throw new Error('Sync push failed');
    const json = await res.json();
    return json.data;
  },

  async pull(since: string, accessToken: string): Promise<unknown[]> {
    const res = await fetch(`${API_BASE}/api/sync/pull?since=${encodeURIComponent(since)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error('Sync pull failed');
    const json = await res.json();
    return json.data.transactions ?? [];
  },
};
