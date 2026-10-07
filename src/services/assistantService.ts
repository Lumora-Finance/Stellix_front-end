import { mockAnalytics } from "@/data/mockAnalytics";
import { mockInvoices } from "@/data/mockInvoices";
import { mockTransactions } from "@/data/mockTransactions";
import { mockWallet } from "@/data/mockWallet";
import { mockAutomations } from "@/data/mockAutomations";
import { mockGifts } from "@/data/mockGifts";
import { mockSalaryConfig, mockSalaryHistory } from "@/data/mockSalary";
import { mockRecurringPayments } from "@/data/mockRecurringPayments";
import type { AssistantMessage, TransactionDraft } from "@/types";

const response = (content: string, draft?: TransactionDraft): AssistantMessage => ({
  id: `assistant-${Date.now()}`,
  role: "assistant",
  content,
  createdAt: new Date().toISOString(),
  ...(draft ? { draft } : {}),
});

const delay = (ms = 500) => new Promise<void>((r) => setTimeout(r, ms));

const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function resolveAnswer(question: string): string {
  const q = question.toLowerCase();

  // ── Your Money ───────────────────────────────────────────────────────────────
  if (q.includes("how much did i spend") || q === "how much did i spend?") {
    const out = mockTransactions.filter((t) => t.type === "outgoing" || t.type === "payment");
    return `You spent ${fmt(mockAnalytics.expenses)} this month across ${out.length} outgoing payments. Your largest single expense was ${fmt(680)} to Northstar Labs.`;
  }
  if (q.includes("how much did i receive") || q.includes("how much have i received")) {
    const inc = mockTransactions.filter((t) => t.type === "incoming");
    return `You received ${fmt(mockAnalytics.income)} this month across ${inc.length} incoming payments. Your largest incoming payment was ${fmt(2450)} from Acme Studio.`;
  }
  if (q.includes("biggest transaction") || q.includes("largest transaction")) {
    return "Your largest recent transaction was an incoming 2,450 USDC payment from Acme Studio, followed by 1,850 USDC from Frame & Form and 1,355 USD equivalent (1,250 EURC) from Orbital Ventures.";
  }
  if (q.includes("where did i spend") || q.includes("spend the most")) {
    return "Your top spending categories this month: Northstar Labs (${fmt(680)}), Lumen Hosting ($129), Cloudstack ($84). Most of your outgoing payments are business-related.";
  }
  if (q.includes("what did i spend") && q.includes("month")) {
    return `This month you spent ${fmt(mockAnalytics.expenses)} across hosting ($213), professional services ($680), and other payments. Your net flow is ${fmt(mockAnalytics.netFlow)}.`;
  }
  if (q.includes("compare") && q.includes("last month")) {
    return `This month you spent ${fmt(mockAnalytics.expenses)} compared to $2,780 last month — an 8% increase. Income this month is ${fmt(mockAnalytics.income)} vs $5,390 last month — up 18%.`;
  }
  if (q.includes("biggest expense")) {
    return "Your biggest expense this month was Rent at $1,200 USDC, followed by your payment to Northstar Labs at $680 USDC.";
  }
  if (q.includes("recent income") || q.includes("show my recent income")) {
    const inc = mockTransactions.filter((t) => t.type === "incoming").slice(0, 3);
    return `Recent income:\n${inc.map((t) => `• ${fmt(t.usdValue)} from ${t.counterparty} (${new Date(t.timestamp).toLocaleDateString()})`).join("\n")}`;
  }
  if (q.includes("recent expense") || q.includes("show my recent expense")) {
    const exp = mockTransactions.filter((t) => t.type === "outgoing" || t.type === "payment").slice(0, 3);
    return `Recent expenses:\n${exp.map((t) => `• ${fmt(t.usdValue)} to ${t.counterparty} (${new Date(t.timestamp).toLocaleDateString()})`).join("\n")}`;
  }
  if (q.includes("how much money do i have") || q.includes("how much do i have")) {
    return `Your total portfolio balance is ${fmt(mockWallet.totalBalance)} across USDC ($8,742.18), XLM ($3,104.99), and EURC ($633.15) on the Stellar network.`;
  }
  if (q.includes("total portfolio value") || q.includes("portfolio value")) {
    return `Your portfolio is worth ${fmt(mockWallet.totalBalance)}. It's composed of 70% USDC, 24.9% XLM, and 5.1% EURC — well-positioned for stability.`;
  }
  if (q.includes("summary") || q.includes("financial overview") || q.includes("summarize")) {
    return `Financial summary for October 2026:\n• Portfolio: ${fmt(mockWallet.totalBalance)}\n• Income: ${fmt(mockAnalytics.income)}\n• Expenses: ${fmt(mockAnalytics.expenses)}\n• Net flow: +${fmt(mockAnalytics.netFlow)}\n• Unpaid invoices: ${fmt(3700)} (2 open)\n• Active automations: ${mockAutomations.filter((a) => a.status === "active").length}`;
  }

  // ── Your Payments ────────────────────────────────────────────────────────────
  if (q.includes("unpaid invoice") || (q.includes("invoice") && (q.includes("unpaid") || q.includes("open")))) {
    const open = mockInvoices.filter((i) => i.status === "pending" || i.status === "overdue");
    return `You have ${open.length} unpaid invoices totaling ${fmt(open.reduce((s, i) => s + i.amount, 0))}:\n${open.map((i) => `• ${i.number} — ${i.clientName}: ${fmt(i.amount)} (${i.status})`).join("\n")}`;
  }
  if (q.includes("recurring payment") || q.includes("show my recurring")) {
    const active = mockRecurringPayments.filter((p) => p.status === "active");
    return `You have ${active.length} active recurring payments totaling ${fmt(active.reduce((s, p) => s + p.amount, 0))}/month:\n${active.map((p) => `• ${p.name}: ${fmt(p.amount)} ${p.asset} (${p.frequency})`).join("\n")}`;
  }
  if (q.includes("payments coming up") || q.includes("upcoming") && q.includes("payment")) {
    return "Upcoming payments:\n• Rent: $1,200 USDC on Nov 1\n• Family Support: $50 USDC on Oct 10\n• Figma: $15 USDC on Nov 1\n• Cloud Hosting: $84 USDC on Nov 1\n• Next salary: $2,000 USDC on Nov 1";
  }
  if (q.includes("recent payment") || q.includes("show my recent payment")) {
    return `Recent payments:\n• $1,200 USDC — Rent (Oct 1)\n• $50 USDC — Family Support (Oct 3)\n• $680 USDC — Northstar Labs (Sep 27)\n• $129 USDC — Lumen Hosting (Sep 24)`;
  }
  if (q.includes("pending payment") || q.includes("which payments are pending")) {
    return "You have 1 pending transaction: $129 USDC to Lumen Hosting (Infrastructure) from Sep 24 — awaiting Stellar network confirmation.";
  }
  if (q.includes("overdue invoice") || q.includes("which invoices are overdue")) {
    const overdue = mockInvoices.filter((i) => i.status === "overdue");
    return overdue.length
      ? `${overdue.length} overdue invoice:\n${overdue.map((i) => `• ${i.number} — ${i.clientName}: ${fmt(i.amount)} ${i.asset}, due ${i.dueDate}`).join("\n")}`
      : "No overdue invoices. You're all caught up!";
  }
  if (q.includes("waiting to receive") || q.includes("how much am i waiting")) {
    return `You're waiting to receive ${fmt(3700)} from 2 open invoices — INV-104 ($2,450 USDC from Acme Studio) and INV-102 ($1,250 EURC from Orbital Ventures).`;
  }
  if (q.includes("paid this month") || q.includes("how much have i paid")) {
    return `You paid ${fmt(mockAnalytics.expenses)} this month across ${mockTransactions.filter((t) => t.type === "outgoing" || t.type === "payment").length} transactions.`;
  }
  if (q.includes("payment history") || q.includes("show my payment history")) {
    return `Payment history (last 30 days):\n• $1,200 — Rent\n• $680 — Northstar Labs\n• $129 — Lumen Hosting\n• $84 — Cloudstack\n• $50 — Family Support (×3)\nTotal outgoing: ${fmt(mockAnalytics.expenses)}`;
  }

  // ── Your Portfolio ────────────────────────────────────────────────────────────
  if (q.includes("portfolio distributed") || q.includes("how is my portfolio")) {
    return `Portfolio distribution:\n• USDC: $8,742.18 (70.1%) — stable\n• XLM: $3,104.99 (24.9%) — Stellar native\n• EURC: $633.15 (5.1%) — Euro-pegged\n\nTotal: ${fmt(mockWallet.totalBalance)}`;
  }
  if (q.includes("balance changed") || q.includes("how has my balance")) {
    return "Your balance has grown from $9,200 six months ago to $12,480 today — a 35.7% increase. Income from client projects and steady savings automation drove this growth.";
  }
  if (q.includes("hold the most") || q.includes("which asset")) {
    return "You hold the most USDC — $8,742.18, representing 70.1% of your portfolio. XLM is your second-largest holding at $3,104.99 (24.9%).";
  }
  if (q.includes("how much usdc")) {
    const usdc = mockWallet.assets.find((a) => a.symbol === "USDC");
    return `You hold ${usdc?.balance.toLocaleString()} USDC ($${usdc?.usdValue.toLocaleString()}), representing ${usdc?.allocation}% of your portfolio.`;
  }
  if (q.includes("how much xlm")) {
    const xlm = mockWallet.assets.find((a) => a.symbol === "XLM");
    return `You hold ${xlm?.balance.toLocaleString()} XLM (≈$${xlm?.usdValue.toLocaleString()} at current price), representing ${xlm?.allocation}% of your portfolio.`;
  }
  if (q.includes("how much eurc")) {
    const eurc = mockWallet.assets.find((a) => a.symbol === "EURC");
    return `You hold ${eurc?.balance.toLocaleString()} EURC (≈$${eurc?.usdValue.toLocaleString()}), representing ${eurc?.allocation}% of your portfolio.`;
  }
  if (q.includes("portfolio activity")) {
    return "Portfolio activity this month: +$2,450 (Acme Studio retainer), +$1,850 (Frame & Form), +$1,250 EURC (Orbital). Outgoing: −$1,200 (Rent), −$680 (Northstar), −$213 (tools/hosting).";
  }
  if (q.includes("changed my portfolio balance") || q.includes("what changed my portfolio")) {
    return "This month your portfolio balance changed due to: +$6,350 in client income, −$2,910 in payments, and a minor XLM price dip (−1.2%). Net: +$3,440.";
  }
  if (q.includes("compare") && q.includes("portfolio") && q.includes("last month")) {
    return "Portfolio vs last month: $12,480 now vs $10,200 in September — up 22%. USDC grew from $7,100 to $8,742. XLM value decreased slightly due to price movements.";
  }

  // ── Your Invoices ─────────────────────────────────────────────────────────────
  if (q.includes("show my unpaid invoice")) {
    const open = mockInvoices.filter((i) => i.status === "pending" || i.status === "overdue");
    return open.map((i) => `• ${i.number} — ${i.clientName}: ${fmt(i.amount)} ${i.asset} (${i.status}, due ${i.dueDate})`).join("\n");
  }
  if (q.includes("show my overdue invoice")) {
    const overdue = mockInvoices.filter((i) => i.status === "overdue");
    return overdue.length ? overdue.map((i) => `• ${i.number} — ${i.clientName}: ${fmt(i.amount)} ${i.asset}, due ${i.dueDate}`).join("\n") : "No overdue invoices.";
  }
  if (q.includes("how much am i owed") || q.includes("amount owed")) {
    const open = mockInvoices.filter((i) => i.status === "pending" || i.status === "overdue");
    return `You are owed ${fmt(open.reduce((s, i) => s + i.amount, 0))} across ${open.length} open invoices.`;
  }
  if (q.includes("client owes me the most") || q.includes("which client")) {
    return "Acme Studio owes you the most — $2,450 USDC (INV-104, pending). Orbital Ventures has the oldest outstanding invoice at $1,250 EURC (INV-102, overdue).";
  }
  if (q.includes("show my paid invoice")) {
    const paid = mockInvoices.filter((i) => i.status === "paid");
    return paid.map((i) => `• ${i.number} — ${i.clientName}: ${fmt(i.amount)} ${i.asset} ✓`).join("\n");
  }
  if (q.includes("show my pending invoice")) {
    const pending = mockInvoices.filter((i) => i.status === "pending");
    return pending.map((i) => `• ${i.number} — ${i.clientName}: ${fmt(i.amount)} ${i.asset} (due ${i.dueDate})`).join("\n");
  }
  if (q.includes("invoice collection rate") || q.includes("collection rate")) {
    const total = mockInvoices.filter((i) => i.status !== "draft").length;
    const paid = mockInvoices.filter((i) => i.status === "paid").length;
    return `Your invoice collection rate is ${Math.round((paid / total) * 100)}% — ${paid} of ${total} invoices paid. Average payment time is 12 days.`;
  }
  if (q.includes("create an invoice") || q.includes("create invoice")) {
    return "To create an invoice, head to the Invoices section and click 'New invoice'. You can also go directly to /invoices/new.";
  }

  // ── Transfers ────────────────────────────────────────────────────────────────
  if (q.includes("recent transfer") || q.includes("show my recent transfer")) {
    return "Recent transfers:\n• +$2,450 USDC from Acme Studio (Sep 28)\n• −$680 USDC to Northstar Labs (Sep 27)\n• +$1,355 EURC from Orbital Ventures (Sep 22)\n• +$1,850 USDC from Frame & Form (Sep 18)";
  }
  if (q.includes("how much have i sent") || q.includes("sent this month")) {
    return `You sent ${fmt(mockAnalytics.expenses)} this month across outgoing transfers and payments to clients, services, and recurring obligations.`;
  }
  if (q.includes("how much have i received this month") || q.includes("received this month")) {
    return `You received ${fmt(mockAnalytics.income)} this month — primarily from Acme Studio ($2,450), Frame & Form ($1,850), and Orbital Ventures ($1,250 EURC).`;
  }
  if (q.includes("largest transfer") || q.includes("show my largest transfer")) {
    return "Largest transfers:\n1. +$2,450 USDC — Acme Studio (incoming)\n2. +$1,850 USDC — Frame & Form (incoming)\n3. +$1,355 — Orbital Ventures EURC (incoming)\n4. −$1,200 — Rent (outgoing)";
  }
  if (q.includes("who do i send money to") || q.includes("send money to most")) {
    return "You send most frequently to: Rent ($1,200/month), Northstar Labs (project-based), Lumen Hosting ($129/month), and Family ($50/week via automation).";
  }
  if (q.includes("who sends me money") || q.includes("sends me money most")) {
    return "Top income sources: Acme Studio (monthly retainer), Frame & Form (project-based), Orbital Ventures (advisory). Acme Studio is your most consistent payer.";
  }

  // ── Automations ──────────────────────────────────────────────────────────────
  if (q.includes("create a savings rule") || q.includes("savings rule")) {
    return "To create a savings rule, go to Automations → New Rule → Auto Savings. You can set a percentage (e.g., 20%) or fixed amount to save from every incoming payment. I'll guide you through it there.";
  }
  if (q.includes("recurring transfer") && (q.includes("set up") || q.includes("create"))) {
    return "To set up a recurring transfer, go to Automations → New Rule → Recurring Transfer. You'll specify the recipient, amount, frequency, and duration.";
  }
  if (q.includes("active automation") || q.includes("show my active automation")) {
    const active = mockAutomations.filter((a) => a.status === "active");
    return `You have ${active.length} active automations:\n${active.map((a) => `• ${a.name}: ${a.isPercentage ? `${a.amount}%` : fmt(a.amount)} ${a.asset} (${a.frequency})`).join("\n")}`;
  }
  if (q.includes("manage my money rule") || q.includes("my automations")) {
    return `You have ${mockAutomations.length} money rules. ${mockAutomations.filter((a) => a.status === "active").length} active, ${mockAutomations.filter((a) => a.status === "paused").length} paused. Head to the Automations section to manage them.`;
  }
  if (q.includes("pause an automation")) {
    return "To pause an automation, go to the Automations section, find the rule you want to pause, and click the pause button. Paused automations won't execute until resumed.";
  }
  if (q.includes("edit an automation")) {
    return "To edit an automation, go to Automations, click the rule you want to change, and select Edit. You can modify amounts, frequency, destination, and schedule.";
  }

  // ── Salary ───────────────────────────────────────────────────────────────────
  if (q.includes("salary history") || q.includes("show my salary history")) {
    const history = mockSalaryHistory.filter((s) => s.status === "received").slice(0, 4);
    return `Salary history:\n${history.map((s) => `• ${s.period}: ${fmt(s.amount)} ${s.asset} ✓`).join("\n")}\nTotal received this year: ${fmt(history.length * 2000)}`;
  }
  if (q.includes("how much salary") || q.includes("salary have i received")) {
    const received = mockSalaryHistory.filter((s) => s.status === "received");
    return `You've received ${received.length} salary payments totaling ${fmt(received.length * mockSalaryConfig.amount)} from ${mockSalaryConfig.employer}.`;
  }
  if (q.includes("upcoming salary") || q.includes("show my upcoming salary")) {
    return `Your next salary payment is ${fmt(mockSalaryConfig.amount)} ${mockSalaryConfig.asset} from ${mockSalaryConfig.employer}, expected on ${mockSalaryConfig.nextPayment}.`;
  }
  if (q.includes("salary distribution") || q.includes("set up salary") || q.includes("split my salary")) {
    return "To configure salary distribution, go to the Salary section and click 'Edit distribution'. You can set percentages for Personal, Savings, Rent, and Family.";
  }
  if (q.includes("where my salary goes") || q.includes("show where my salary")) {
    const rules = mockSalaryConfig.distributionRules;
    return `Your ${fmt(mockSalaryConfig.amount)} salary is distributed:\n${rules.map((r) => `• ${r.label}: ${r.percentage}% → ${fmt(mockSalaryConfig.amount * r.percentage / 100)}`).join("\n")}`;
  }

  // ── Gifts ────────────────────────────────────────────────────────────────────
  if (q.includes("create a programmable gift") || q.includes("create gift")) {
    return "To create a programmable gift, go to the Gifts section and click 'Send gift'. You can set the recipient, amount, unlock date, expiration, and optional recurrence.";
  }
  if (q.includes("show my active gift") || q.includes("active gifts")) {
    const active = mockGifts.filter((g) => g.direction === "sent" && ["scheduled", "available"].includes(g.status));
    return active.length ? `Active gifts:\n${active.map((g) => `• ${fmt(g.amount)} ${g.asset} to ${g.recipient} — ${g.status} (unlocks ${g.unlockDate})`).join("\n")}` : "No active gifts.";
  }
  if (q.includes("gifts i've sent") || q.includes("show gifts i've sent") || q.includes("gifts i have sent")) {
    const sent = mockGifts.filter((g) => g.direction === "sent");
    return `Gifts you've sent (${sent.length} total):\n${sent.map((g) => `• ${fmt(g.amount)} ${g.asset} to ${g.recipient} — ${g.status}`).join("\n")}`;
  }
  if (q.includes("gifts i've received") || q.includes("gifts received") || q.includes("gifts i have received")) {
    const rec = mockGifts.filter((g) => g.direction === "received");
    return rec.length ? `Gifts you've received:\n${rec.map((g) => `• ${fmt(g.amount)} ${g.asset} from ${g.sender} — ${g.status}`).join("\n")}` : "No received gifts yet.";
  }
  if (q.includes("waiting to be claimed") || q.includes("claimable")) {
    const avail = mockGifts.filter((g) => g.direction === "received" && g.status === "available");
    return avail.length ? `Gifts available to claim:\n${avail.map((g) => `• ${fmt(g.amount)} ${g.asset} from ${g.sender} — available now`).join("\n")}` : "No gifts waiting to be claimed.";
  }
  if (q.includes("upcoming gift") || q.includes("show my upcoming gift")) {
    const upcoming = mockGifts.filter((g) => g.status === "scheduled");
    return upcoming.length ? `Upcoming gifts:\n${upcoming.map((g) => `• ${fmt(g.amount)} ${g.asset} to ${g.recipient} — unlocks ${g.unlockDate}`).join("\n")}` : "No upcoming gifts scheduled.";
  }
  if (q.includes("cancel a gift")) {
    return "To cancel a gift, go to Gifts → Sent, find the gift you want to cancel, and click Cancel. You can only cancel gifts that haven't been claimed yet.";
  }

  // ── Insights ─────────────────────────────────────────────────────────────────
  if (q.includes("what changed this month") || q.includes("what changed")) {
    return "This month's key changes:\n• Income up 18% vs last month\n• Expenses up 8%\n• Portfolio grew 22%\n• INV-102 became overdue\n• Savings automation hit 6/12 executions\n• 3 recurring payments due Nov 1";
  }
  if (q.includes("biggest financial trend") || q.includes("financial trend")) {
    return "Your biggest financial trends:\n1. Consistent income growth from Acme Studio\n2. Rent + tools represent 58% of expenses\n3. USDC dominance in portfolio (70%)\n4. Savings automation accelerating balance growth";
  }
  if (q.includes("income vs expense") || q.includes("income versus expense")) {
    return `Income vs expenses:\n• Income: ${fmt(mockAnalytics.income)}\n• Expenses: ${fmt(mockAnalytics.expenses)}\n• Net: +${fmt(mockAnalytics.netFlow)}\n• Savings rate: ${Math.round((1 - mockAnalytics.expenses / mockAnalytics.income) * 100)}%`;
  }
  if (q.includes("average monthly spending")) {
    return "Your average monthly spending over the last 6 months is approximately $2,650 — slightly below this month's $2,910 due to an extra tool subscription in October.";
  }
  if (q.includes("average monthly income")) {
    return "Your average monthly income over the last 6 months is approximately $5,800. This month you received $6,350 — above average, driven by the Acme Studio and Frame & Form projects.";
  }
  if (q.includes("unusual transaction") || q.includes("highlight unusual")) {
    return "Unusual transactions detected:\n• XLM swap (Sep 25, $604): larger than your typical swap amount\n• Failed transfer to GDQQ…7HQL (Sep 20): address validation issue — may need follow-up";
  }
  if (q.includes("financial activity this month") || q.includes("activity this month")) {
    return `Activity this month:\n• 8 transactions processed\n• ${fmt(mockAnalytics.income)} received\n• ${fmt(mockAnalytics.expenses)} sent\n• 3 automations executed\n• 2 invoices open\n• Net: +${fmt(mockAnalytics.netFlow)}`;
  }

  // ── Send transaction ──────────────────────────────────────────────────────────
  if (q.includes("send") && q.match(/\d+/)) {
    const amount = Number(q.match(/\d+(?:\.\d+)?/)?.[0] ?? 0);
    const asset = q.includes("xlm") ? "XLM" : q.includes("eurc") ? "EURC" : "USDC";
    return "I created a demo transaction draft. I will never send assets automatically — review the recipient, amount, and fee before confirming.";
  }

  // ── Default ────────────────────────────────────────────────────────────────
  return `This month you received ${fmt(mockAnalytics.income)} and spent ${fmt(mockAnalytics.expenses)}, for a net flow of +${fmt(mockAnalytics.netFlow)}. Your portfolio is ${fmt(mockWallet.totalBalance)} with USDC as your primary asset. You have ${mockAutomations.filter((a) => a.status === "active").length} active automations and ${mockInvoices.filter((i) => i.status === "pending" || i.status === "overdue").length} unpaid invoices.`;
}

export const assistantService = {
  async sendMessage(text: string): Promise<AssistantMessage> {
    await delay(500);
    const answer = resolveAnswer(text);
    return response(answer);
  },
};
