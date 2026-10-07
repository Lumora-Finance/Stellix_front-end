import { mockWallet } from "@/data/mockWallet";
import type { AssetSymbol, TransactionDraft, Wallet } from "@/types";
const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
export interface SendInput { recipient: string; amount: number; asset: AssetSymbol; memo?: string }
export const walletService = {
 async connectWallet(): Promise<Wallet> { await wait(); return { ...mockWallet, connected: true }; },
 async disconnectWallet(): Promise<{ connected: false }> { await wait(200); return { connected: false }; },
 async getWalletBalance(): Promise<Wallet> { await wait(); return mockWallet; },
 async createTransactionDraft(input: SendInput): Promise<TransactionDraft> { await wait(250); return { ...input, fee: 0.00001 }; },
 async sendTransaction(draft: TransactionDraft): Promise<{ id: string; status: "demo-confirmed"; message: string }> { await wait(850); return { id:`demo-${Date.now()}`, status:"demo-confirmed", message:`Demo transfer prepared for ${draft.amount} ${draft.asset}. No blockchain transaction was broadcast.` }; },
 async createPaymentRequest(amount: number, asset: AssetSymbol) { await wait(250); return { id:`request-${Date.now()}`, amount, asset, status:"demo" as const }; },
};
