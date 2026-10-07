import type { SalaryRecord, SalaryConfig, SalarySplitRule } from "@/types";

export const mockSalaryRules: SalarySplitRule[] = [
  { id: "rule-01", label: "Personal", destination: "Primary wallet", percentage: 60, asset: "USDC" },
  { id: "rule-02", label: "Savings", destination: "Savings wallet", percentage: 20, asset: "USDC" },
  { id: "rule-03", label: "Rent", destination: "GB3K…RENT", percentage: 10, asset: "USDC" },
  { id: "rule-04", label: "Family", destination: "GA7P…FMLY", percentage: 10, asset: "USDC" },
];

export const mockSalaryConfig: SalaryConfig = {
  id: "salary-config-01",
  employer: "Acme Studio",
  amount: 2000,
  asset: "USDC",
  frequency: "monthly",
  nextPayment: "2026-11-01",
  lastPayment: "2026-10-01",
  distributionRules: mockSalaryRules,
  autoDistribute: true,
};

export const mockSalaryHistory: SalaryRecord[] = [
  { id: "sal-001", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-10-01", status: "received", txHash: "sal10abc", period: "October 2026" },
  { id: "sal-002", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-09-01", status: "received", txHash: "sal09abc", period: "September 2026" },
  { id: "sal-003", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-08-01", status: "received", txHash: "sal08abc", period: "August 2026" },
  { id: "sal-004", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-07-01", status: "received", txHash: "sal07abc", period: "July 2026" },
  { id: "sal-005", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-06-01", status: "received", txHash: "sal06abc", period: "June 2026" },
  { id: "sal-006", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-05-01", status: "received", txHash: "sal05abc", period: "May 2026" },
  { id: "sal-007", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-04-01", status: "received", txHash: "sal04abc", period: "April 2026" },
  { id: "sal-008", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-03-01", status: "received", txHash: "sal03abc", period: "March 2026" },
  { id: "sal-009", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-02-01", status: "received", txHash: "sal02abc", period: "February 2026" },
  { id: "sal-010", employer: "Acme Studio", amount: 2000, asset: "USDC", paymentDate: "2026-11-01", status: "upcoming", period: "November 2026" },
];
