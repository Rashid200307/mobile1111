// lib/store.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  paymentMethod: string; // Typically, the card number
  type: 'expense' | 'income';
  // Optionally, add custom fields (e.g., customColor)
}

export interface Card {
  id: string;
  type: string;
  number: string;
  balance: number;
  color: string;
  image: string;
}

interface FinanceState {
  transactions: Transaction[];
  cards: Card[];
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  addCard: (card: Card) => void;
  removeCard: (id: string) => void;
  updateCard: (id: string, updates: Partial<Card>) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setCards: (cards: Card[]) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      cards: [
        {
          id: '1',
          type: 'Visa',
          number: '•••• 4589',
          balance: 3240.5,
          color: '#007AFF',
          image:
            'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?q=80&w=2340&fit=crop',
        },
        {
          id: '2',
          type: 'Mastercard',
          number: '•••• 1234',
          balance: 5680.75,
          color: '#5856D6',
          image:
            'https://images.unsplash.com/photo-1613243555978-636c48dc653c?q=80&w=2340&fit=crop',
        },
      ],
      addTransaction: (transaction) =>
        set((state) => {
          // Add the new transaction.
          const newTransactions = [...state.transactions, transaction];
          // Update the corresponding card balance.
          const updatedCards = state.cards.map((card) => {
            if (card.number === transaction.paymentMethod) {
              // Increase or decrease balance based on transaction.amount.
              return { ...card, balance: card.balance + transaction.amount };
            }
            return card;
          });
          return { transactions: newTransactions, cards: updatedCards };
        }),
      removeTransaction: (id: string) =>
        set((state) => {
          // Find the transaction to remove.
          const transactionToRemove = state.transactions.find((t) => t.id === id);
          if (!transactionToRemove) return {};
          // Remove the transaction.
          const newTransactions = state.transactions.filter((t) => t.id !== id);
          // Reverse its effect on the corresponding card.
          const updatedCards = state.cards.map((card) => {
            if (card.number === transactionToRemove.paymentMethod) {
              return { ...card, balance: card.balance - transactionToRemove.amount };
            }
            return card;
          });
          return { transactions: newTransactions, cards: updatedCards };
        }),
      updateTransaction: (id: string, updates: Partial<Transaction>) =>
        set((state) => {
          // Find the old transaction.
          const oldTransaction = state.transactions.find((t) => t.id === id);
          if (!oldTransaction) return {};
          // Calculate the difference in amount if the amount is updated.
          const newAmount = updates.amount !== undefined ? updates.amount : oldTransaction.amount;
          const amountDiff = newAmount - oldTransaction.amount;
          // Update the transaction.
          const newTransactions = state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          );
          // Update the corresponding card's balance by applying the difference.
          const updatedCards = state.cards.map((card) => {
            if (card.number === oldTransaction.paymentMethod) {
              return { ...card, balance: card.balance + amountDiff };
            }
            return card;
          });
          return { transactions: newTransactions, cards: updatedCards };
        }),
      addCard: (card) =>
        set((state) => ({
          cards: [...state.cards, card],
        })),
      removeCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        })),
      updateCard: (id, updates) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          ),
        })),
      setTransactions: (transactions) => set(() => ({ transactions })),
      setCards: (cards) => set(() => ({ cards })),
    }),
    {
      name: 'finance-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
