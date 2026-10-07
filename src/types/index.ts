// ─── Core primitives ──────────────────────────────────────────────────────────
export type AssetSymbol = "USDC" | "XLM" | "EURC" | "AQUA";
export type TransactionType = "incoming" | "outgoing" | "payment" | "swap";
export type TransactionStatus = "confirmed" | "pending" | "failed";
export type InvoiceStatus = "draft" | "pending" | "paid" | "overdue";

// ─── Existing models ──────────────────────────────────────────────────────────
export interface Asset {
  id: string;
  name: string;
  symbol: AssetSymbol;
  balance: number;
  usdValue: number;
  change: number;
  allocation: number;
  issuer?: string;
}

export interface Wallet {
  id: string;
  name: string;
  address: string;
  network: "Stellar Testnet" | "Stellar Network";
  connected: boolean;
  totalBalance: number;
  assets: Asset[];
}

export interface Transaction {
  id: string;
  hash: string;
  type: TransactionType;
  counterparty: string;
  from: string;
  to: string;
  asset: AssetSymbol;
  amount: number;
  usdValue: number;
  status: TransactionStatus;
  timestamp: string;
  memo?: string;
  fee: number;
  explorerUrl: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  asset: AssetSymbol;
  status: "pending" | "confirmed";
  createdAt: string;
  transactionHash?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  amount: number;
  asset: AssetSymbol;
  dueDate: string;
  createdAt: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
  paymentLink: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  walletAddress: string;
  joinedAt: string;
  initials: string;
  role: string;
}

export interface AnalyticsPoint {
  date: string;
  balance: number;
  income: number;
  expenses: number;
  volume: number;
}

export interface Analytics {
  points: AnalyticsPoint[];
  totalVolume: number;
  income: number;
  expenses: number;
  netFlow: number;
  averageTransaction: number;
  invoicePerformance: { name: string; value: number }[];
  assetDistribution: { name: string; value: number }[];
}

export interface TransactionDraft {
  recipient: string;
  amount: number;
  asset: AssetSymbol;
  fee: number;
  memo?: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  draft?: TransactionDraft;
  /** If set, assistant response has an action flow attached */
  actionType?: AssistantActionType;
}

export interface InvoiceDraft {
  clientName: string;
  clientEmail: string;
  title: string;
  description: string;
  asset: AssetSymbol;
  dueDate: string;
  number: string;
  notes?: string;
  items: InvoiceItem[];
}

// ─── Automations / Money Rules ────────────────────────────────────────────────
export type AutomationStatus = "active" | "paused" | "completed" | "cancelled";
export type AutomationFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "on_payment";
export type AutomationType =
  | "salary_split"
  | "recurring_transfer"
  | "auto_savings"
  | "recurring_payment"
  | "allowance"
  | "custom";

export interface AutomationRule {
  id: string;
  name: string;
  type: AutomationType;
  description: string;
  /** Amount (absolute) or percentage string like "20%" */
  amount: number;
  isPercentage: boolean;
  asset: AssetSymbol;
  source: string;
  destination: string;
  frequency: AutomationFrequency;
  startDate: string;
  endDate?: string;
  occurrences?: number;
  executedCount: number;
  status: AutomationStatus;
  nextExecution?: string;
  lastExecution?: string;
  createdAt: string;
}

export interface AutomationExecution {
  id: string;
  automationId: string;
  executedAt: string;
  amount: number;
  asset: AssetSymbol;
  status: "success" | "failed" | "skipped";
  txHash?: string;
  note?: string;
}

export interface SalarySplitRule {
  id: string;
  label: string;
  destination: string;
  percentage: number;
  asset: AssetSymbol;
}

// ─── Recurring Payments ───────────────────────────────────────────────────────
export type RecurringPaymentStatus = "active" | "paused" | "completed" | "cancelled";

export interface RecurringPayment {
  id: string;
  name: string;
  recipient: string;
  recipientAddress: string;
  asset: AssetSymbol;
  amount: number;
  frequency: AutomationFrequency;
  startDate: string;
  endDate?: string;
  totalOccurrences?: number;
  paidCount: number;
  nextPayment?: string;
  lastPayment?: string;
  status: RecurringPaymentStatus;
  memo?: string;
  createdAt: string;
}

// ─── Salary ───────────────────────────────────────────────────────────────────
export interface SalaryRecord {
  id: string;
  employer: string;
  amount: number;
  asset: AssetSymbol;
  paymentDate: string;
  status: "received" | "pending" | "upcoming";
  txHash?: string;
  period: string;
}

export interface SalaryConfig {
  id: string;
  employer: string;
  amount: number;
  asset: AssetSymbol;
  frequency: AutomationFrequency;
  nextPayment: string;
  lastPayment?: string;
  distributionRules: SalarySplitRule[];
  autoDistribute: boolean;
}

// ─── Programmable Gifts ───────────────────────────────────────────────────────
export type GiftStatus = "scheduled" | "available" | "claimed" | "expired" | "cancelled";
export type GiftDirection = "sent" | "received";

export interface Gift {
  id: string;
  direction: GiftDirection;
  recipient: string;
  recipientAddress?: string;
  sender: string;
  senderAddress?: string;
  amount: number;
  asset: AssetSymbol;
  message?: string;
  unlockDate: string;
  expirationDate?: string;
  /** If true this is a recurring gift */
  isRecurring: boolean;
  recurrenceCount?: number;
  recurrenceFrequency?: AutomationFrequency;
  executedCount: number;
  status: GiftStatus;
  claimedAt?: string;
  createdAt: string;
  txHash?: string;
}

export interface GiftClaim {
  id: string;
  giftId: string;
  claimedAt: string;
  txHash: string;
  amount: number;
  asset: AssetSymbol;
}

// ─── AI Assistant ─────────────────────────────────────────────────────────────
export type AssistantActionType =
  | "create_savings_rule"
  | "create_recurring_transfer"
  | "create_gift"
  | "schedule_payment"
  | "create_invoice"
  | "set_salary_distribution";

export interface AiQuery {
  id: string;
  question: string;
  category: string;
  answer: string;
  createdAt: string;
}

export interface AiInsight {
  id: string;
  text: string;
  type: "info" | "warning" | "tip" | "alert";
  createdAt: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardOverview {
  totalBalance: number;
  income: number;
  expenses: number;
  pendingInvoicesAmount: number;
  portfolioValue: number;
  activeAutomations: number;
  nextScheduledPayment?: string;
  nextSalary?: string;
  upcomingGifts: number;
  savingsProgress: number;
}
