export type AssetSymbol = "USDC" | "XLM" | "EURC" | "AQUA";
export type TransactionType = "incoming" | "outgoing" | "payment" | "swap";
export type TransactionStatus = "confirmed" | "pending" | "failed";
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue";

export interface Asset { id: string; name: string; symbol: AssetSymbol; balance: number; usdValue: number; change: number; allocation: number; issuer?: string }
export interface Wallet { id: string; name: string; address: string; network: "Stellar Testnet"; connected: boolean; totalBalance: number; assets: Asset[] }
export interface Transaction { id: string; hash: string; type: TransactionType; counterparty: string; from: string; to: string; asset: AssetSymbol; amount: number; usdValue: number; status: TransactionStatus; timestamp: string; memo?: string; fee: number; explorerUrl: string }
export interface InvoiceItem { id: string; description: string; quantity: number; rate: number }
export interface Payment { id: string; invoiceId: string; amount: number; asset: AssetSymbol; status: "pending" | "confirmed"; createdAt: string; transactionHash?: string }
export interface Invoice { id: string; number: string; clientName: string; clientEmail: string; title: string; description: string; amount: number; asset: AssetSymbol; dueDate: string; createdAt: string; status: InvoiceStatus; items: InvoiceItem[]; notes?: string; paymentLink: string }
export interface User { id: string; name: string; username: string; email: string; walletAddress: string; joinedAt: string; initials: string; role: string }
export interface AnalyticsPoint { date: string; balance: number; income: number; expenses: number; volume: number }
export interface Analytics { points: AnalyticsPoint[]; totalVolume: number; income: number; expenses: number; netFlow: number; averageTransaction: number; invoicePerformance: { name: string; value: number }[]; assetDistribution: { name: string; value: number }[] }
export interface TransactionDraft { recipient: string; amount: number; asset: AssetSymbol; fee: number; memo?: string }
export interface AssistantMessage { id: string; role: "user" | "assistant"; content: string; createdAt: string; draft?: TransactionDraft }
export interface InvoiceDraft { clientName: string; clientEmail: string; title: string; description: string; asset: AssetSymbol; dueDate: string; number: string; notes?: string; items: InvoiceItem[] }
