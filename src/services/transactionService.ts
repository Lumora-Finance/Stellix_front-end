import { mockTransactions } from "@/data/mockTransactions";
import type { Transaction } from "@/types";
const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
export const transactionService = {
 async getTransactions(): Promise<Transaction[]> { await wait(); return mockTransactions; },
 async getTransaction(id: string): Promise<Transaction | undefined> { await wait(); return mockTransactions.find((item) => item.id === id); },
};
