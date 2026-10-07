import type { AiInsight } from "@/types";

export const mockAiInsights: AiInsight[] = [
  { id: "ins-001", text: "Your spending increased 8% this month compared to September.", type: "warning", createdAt: "2026-10-07T08:00:00Z" },
  { id: "ins-002", text: "Your largest expense was Rent at $1,200 USDC.", type: "info", createdAt: "2026-10-07T08:00:00Z" },
  { id: "ins-003", text: "You have 3 upcoming recurring payments totaling $1,299.", type: "info", createdAt: "2026-10-07T08:00:00Z" },
  { id: "ins-004", text: "Your portfolio is 70% USDC — well diversified for stability.", type: "tip", createdAt: "2026-10-07T08:00:00Z" },
  { id: "ins-005", text: "INV-102 from Orbital Ventures is overdue. Consider following up.", type: "alert", createdAt: "2026-10-07T08:00:00Z" },
  { id: "ins-006", text: "You received $6,350 in income this month — your best month yet.", type: "tip", createdAt: "2026-10-07T08:00:00Z" },
];

export const suggestedPrompts = [
  "How much did I spend?",
  "Show my biggest transactions.",
  "Which invoices are unpaid?",
  "Summarize my financial activity.",
  "How much USDC do I have?",
  "Show my recurring payments.",
];
