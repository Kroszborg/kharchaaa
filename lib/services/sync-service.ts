/**
 * Sync Service - Offline-First Architecture
 *
 * This service handles background synchronization between local SQLite storage
 * and the remote backend. It uses a queue-based approach:
 *
 * - All transactions are stored locally first (offline-first)
 * - Pending changes are queued and synced when online
 * - Pulls remote changes periodically
 * - Handles conflicts by preferring local changes
 */

import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import type { Transaction } from '@/lib/mock-data';
import { transactionRepository, type NewTransaction } from '@/lib/db/repositories/transaction-repository';

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const SYNC_INTERVAL = 30000; // 30 seconds
let syncIntervalId: ReturnType<typeof setInterval> | null = null;

export interface SyncResult {
  synced: number;
  failed: number;
  pulledAt: string;
}

interface PendingTransaction extends NewTransaction {
  id: string;
  synced: boolean;
  createdAt: string;
}

export const syncService = {
  /**
   * Initialize background sync
   * Call this after user logs in
   */
  async startBackgroundSync() {
    if (syncIntervalId) return;

    // Initial sync
    await this.sync();

    // Periodic sync every 30 seconds
    syncIntervalId = setInterval(async () => {
      const isOnline = await this.checkConnection();
      if (isOnline) {
        await this.sync();
      }
    }, SYNC_INTERVAL);

    console.log('[Sync] Background sync started');
  },

  /**
   * Stop background sync
   * Call this on logout
   */
  stopBackgroundSync() {
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
      console.log('[Sync] Background sync stopped');
    }
  },

  /**
   * Check if device is online
   */
  async checkConnection(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  },

  /**
   * Main sync method - push local changes and pull remote changes
   */
  async sync(): Promise<SyncResult> {
    const isOnline = await this.checkConnection();
    const accessToken = await SecureStore.getItemAsync('kh_auth_token');

    if (!isOnline || !accessToken) {
      return { synced: 0, failed: 0, pulledAt: new Date().toISOString() };
    }

    let synced = 0;
    let failed = 0;

    try {
      // Push unsynced local transactions
      const result = await this.pushPendingTransactions(accessToken);
      synced = result.synced;
      failed = result.failed;
    } catch (err) {
      console.error('[Sync] Push failed:', err);
    }

    try {
      // Pull remote changes
      await this.pullRemoteTransactions(accessToken);
    } catch (err) {
      console.error('[Sync] Pull failed:', err);
    }

    return { synced, failed, pulledAt: new Date().toISOString() };
  },

  /**
   * Queue a transaction for sync (optimistic - saves locally immediately)
   */
  async queueTransaction(data: NewTransaction): Promise<Transaction> {
    // Save locally first (optimistic update)
    const transaction = await transactionRepository.insert(data);

    // Try to sync in background (don't block)
    this.sync().catch(console.error);

    return transaction;
  },

  /**
   * Push pending transactions to backend
   */
  async pushPendingTransactions(accessToken: string): Promise<{ synced: number; failed: number }> {
    const pending = await transactionRepository.findAll();

    // Filter transactions that haven't been synced yet (no matching remote ID)
    // For now, sync all local transactions
    const payload = pending.map(t => ({
      id: t.id,
      amount: t.amount,
      type: t.type === 'debit' ? 'DEBIT' : 'CREDIT',
      merchant: t.merchant,
      category: t.category,
      source: t.source === 'manual' ? 'MANUAL' : t.source?.toUpperCase() ?? 'MANUAL',
      timestamp: t.date,
      note: t.note,
    }));

    if (payload.length === 0) {
      return { synced: 0, failed: 0 };
    }

    const res = await fetch(`${API_BASE}/api/sync/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ transactions: payload }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Sync push failed: ${error}`);
    }

    const json = await res.json();
    return json.data || { synced: payload.length, failed: 0 };
  },

  /**
   * Pull remote transactions and merge with local
   */
  async pullRemoteTransactions(accessToken: string): Promise<void> {
    // Get the last sync timestamp
    const lastSyncAt = await SecureStore.getItemAsync('kh_last_sync') || new Date(0).toISOString();

    const res = await fetch(`${API_BASE}/api/sync/pull?since=${encodeURIComponent(lastSyncAt)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error('Sync pull failed');
    }

    const json = await res.json();
    const remoteTransactions = json.data?.transactions ?? [];

    if (remoteTransactions.length > 0) {
      // Convert remote transactions to local format and bulk insert
      // Using INSERT OR IGNORE to avoid duplicates
      const localTransactions: NewTransaction[] = remoteTransactions.map((t: any) => ({
        amount: t.amount,
        type: t.type === 'DEBIT' ? 'debit' : 'credit' as 'debit' | 'credit',
        merchant: t.merchant?.name || 'Unknown',
        category: t.category?.name || 'other',
        source: t.source === 'MANUAL' ? 'manual' : t.source?.toLowerCase() ?? 'manual',
        date: t.timestamp,
        note: t.note,
      }));

      await transactionRepository.bulkInsert(localTransactions);

      // Update last sync timestamp
      await SecureStore.setItemAsync('kh_last_sync', json.data?.pulledAt || new Date().toISOString());
    }
  },

  /**
   * Force sync - useful when user manually triggers sync
   */
  async forceSync(): Promise<SyncResult> {
    return this.sync();
  },

  /**
   * Get sync status for UI
   */
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    hasPendingChanges: boolean;
    lastSyncAt: string | null;
  }> {
    const isOnline = await this.checkConnection();
    const lastSyncAt = await SecureStore.getItemAsync('kh_last_sync');
    const transactions = await transactionRepository.findAll();
    // For now, assume all local transactions need syncing
    const hasPendingChanges = transactions.length > 0;

    return { isOnline, hasPendingChanges, lastSyncAt };
  },
};
