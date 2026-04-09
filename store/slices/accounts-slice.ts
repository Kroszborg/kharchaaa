import { accountRepository, type BankAccount, type NewAccount } from '@/lib/db/repositories/account-repository';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AccountsState {
  accounts: BankAccount[];
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  addAccount: (input: NewAccount) => Promise<BankAccount>;
  updateAccount: (id: string, patch: Partial<NewAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountsState>()(
  immer((set, get) => ({
    accounts: [],
    isLoading: false,
    isInitialized: false,

    initialize: async () => {
      if (get().isInitialized) return;
      set(s => { s.isLoading = true; });
      const accounts = await accountRepository.findAll();
      set(s => {
        s.accounts = accounts;
        s.isLoading = false;
        s.isInitialized = true;
      });
    },

    addAccount: async (input) => {
      const account = await accountRepository.insert(input);
      set(s => {
        if (input.isDefault || s.accounts.length === 0) {
          s.accounts.forEach(a => { a.isDefault = false; });
        }
        s.accounts.push(account);
      });
      return account;
    },

    updateAccount: async (id, patch) => {
      await accountRepository.update(id, patch);
      set(s => {
        const acc = s.accounts.find(a => a.id === id);
        if (!acc) return;
        if (patch.name !== undefined)     acc.name = patch.name;
        if (patch.type !== undefined)     acc.type = patch.type;
        if (patch.bank !== undefined)     acc.bank = patch.bank;
        if (patch.balance !== undefined)  acc.balance = patch.balance;
        if (patch.lastFour !== undefined) acc.lastFour = patch.lastFour;
        if (patch.color !== undefined)    acc.color = patch.color;
      });
    },

    deleteAccount: async (id) => {
      await accountRepository.delete(id);
      set(s => { s.accounts = s.accounts.filter(a => a.id !== id); });
    },

    setDefault: async (id) => {
      await accountRepository.setDefault(id);
      set(s => {
        s.accounts.forEach(a => { a.isDefault = a.id === id; });
      });
    },
  }))
);

export type { BankAccount, NewAccount };
export const selectAccounts = (s: AccountsState) => s.accounts;
export const selectDefaultAccount = (s: AccountsState) =>
  s.accounts.find(a => a.isDefault) ?? s.accounts[0] ?? null;
