import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  FilePlus2,
  Gift,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageIntro, DemoBadge, currency } from "@/components/shared/common";
import { CountUp, Reveal } from "@/components/shared/motion";
import { mockWallet } from "@/data/mockWallet";
import { mockAnalytics } from "@/data/mockAnalytics";
import { mockTransactions } from "@/data/mockTransactions";
import { mockInvoices } from "@/data/mockInvoices";
import { mockAutomations } from "@/data/mockAutomations";
import { mockSalaryConfig } from "@/data/mockSalary";
import { mockGifts } from "@/data/mockGifts";
import { mockAiInsights } from "@/data/mockAssistant";
import { BalanceChart, ChartFrame, DonutChart, FlowChart } from "@/components/analytics/charts";
import { TransactionList } from "@/components/transactions/transaction-list";
import { SendDialog, ReceiveDialog } from "@/components/wallet/wallet-flows";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Stellix" },
      { name: "description", content: "Your Stellar wallet, activity, invoices, and financial overview." },
      { property: "og:title", content: "Dashboard — Stellix" },
      { property: "og:description", content: "Your Stellar wallet, activity, invoices, and financial overview." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

const insightTypeStyles: Record<string, string> = {
  info: "border-l-primary bg-muted",
  warning: "border-l-amber-500 bg-amber-50 dark:bg-amber-950/20",
  tip: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
  alert: "border-l-destructive bg-destructive/5",
};

function DashboardPage() {
  const nav = useNavigate();
  const [send, setSend] = useState(false);
  const [receive, setReceive] = useState(false);

  const stats = [
    { label: "Total balance", value: 12480.32, prefix: "$", decimals: 2, change: "+14.2%", icon: Wallet },
    { label: "Income", value: mockAnalytics.income, prefix: "$", change: "+18.0%", icon: TrendingUp },
    { label: "Expenses", value: mockAnalytics.expenses, prefix: "$", change: "−4.3%", icon: TrendingDown },
    { label: "Pending invoices", value: 2450, prefix: "$", change: "2 open", icon: Clock3 },
  ];

  const actions = [
    { title: "Send", description: "Send assets to another Stellar wallet.", icon: ArrowUpRight, onClick: () => setSend(true) },
    { title: "Receive", description: "Receive assets into your wallet.", icon: ArrowDownLeft, onClick: () => setReceive(true) },
    { title: "Create invoice", description: "Request payment from a client.", icon: FilePlus2, onClick: () => nav({ to: "/invoices/new" }) },
    { title: "Analytics", description: "Understand your financial activity.", icon: ChartNoAxesCombined, onClick: () => nav({ to: "/analytics" }) },
  ];

  // Derived data for new sections
  const activeAutomations = mockAutomations.filter((a) => a.status === "active");
  const claimableGifts = mockGifts.filter((g) => g.direction === "received" && g.status === "available");
  const upcomingGifts = mockGifts.filter((g) => g.status === "scheduled");
  const savingsAuto = mockAutomations.find((a) => a.type === "auto_savings" && a.status === "active");
  const savingsProgress = savingsAuto ? Math.round((savingsAuto.executedCount / (savingsAuto.occurrences ?? 12)) * 100) : 50;

  return (
    <div className="space-y-8">
      <Reveal>
        <PageIntro title="Good morning, Clement" description="Here's what's happening with your Stellar activity." action={<DemoBadge />} />
      </Reveal>

      {/* Hero wallet */}
      <Reveal delay={60}>
        <section className="wallet-hero">
          <div>
            <p className="text-sm text-primary-foreground/70">Total portfolio balance</p>
            <p className="mt-2 text-4xl font-semibold tracking-normal md:text-5xl">
              <CountUp value={mockWallet.totalBalance} prefix="$" decimals={2} />
            </p>
            <p className="mt-3 text-sm text-primary-foreground/70">Across USDC, XLM, and EURC · Stellar Network</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setSend(true)}>
              <ArrowUpRight />Send
            </Button>
            <Button className="border border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setReceive(true)}>
              <ArrowDownLeft />Receive
            </Button>
          </div>
        </section>
      </Reveal>

      {/* ── Financial Overview stats ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={80 + i * 45}>
            <section className="stat-card">
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="size-5 text-primary" />
              </div>
              <p className="mt-5 text-2xl font-semibold">
                <CountUp value={stat.value} prefix={stat.prefix} decimals={stat.decimals} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-primary">{stat.change}</span> from last month
              </p>
            </section>
          </Reveal>
        ))}
      </div>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="section-title">Quick actions</h2>
          <p className="section-subtitle">Move quickly through your most common workflows.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action, i) => (
            <Reveal key={action.title} delay={i * 50}>
              <button className="quick-action" onClick={action.onClick}>
                <span className="action-icon">
                  <action.icon />
                </span>
                <span>
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Money Automation section ── */}
      <Reveal delay={60}>
        <section className="panel">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Zap className="size-5 text-primary" />
                Money automation
              </h2>
              <p className="section-subtitle">Active rules and upcoming scheduled events.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => nav({ to: "/automations" })}>
              Manage rules
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Active automations",
                value: activeAutomations.length,
                sub: "money rules running",
                icon: Activity,
                onClick: () => nav({ to: "/automations" }),
              },
              {
                label: "Next scheduled",
                value: "Nov 1",
                sub: "Rent · $1,200 USDC",
                icon: CalendarDays,
                onClick: () => nav({ to: "/recurring" }),
              },
              {
                label: "Next salary",
                value: new Date(mockSalaryConfig.nextPayment).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                sub: `${currency(mockSalaryConfig.amount)} from ${mockSalaryConfig.employer}`,
                icon: TrendingUp,
                onClick: () => nav({ to: "/salary" }),
              },
              {
                label: "Upcoming gifts",
                value: upcomingGifts.length,
                sub: claimableGifts.length > 0 ? `${claimableGifts.length} available to claim` : "scheduled",
                icon: Gift,
                onClick: () => nav({ to: "/gifts" }),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="quick-action group flex-col items-start gap-2 text-left"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <item.icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-semibold">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Savings progress */}
          {savingsAuto && (
            <div className="mt-5 border-t border-border pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Savings progress — {savingsAuto.name}</span>
                <span className="font-medium text-primary">{savingsProgress}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-700"
                  style={{ width: `${savingsProgress}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {savingsAuto.executedCount} of {savingsAuto.occurrences ?? "∞"} executions · {currency(savingsAuto.amount * savingsAuto.executedCount)} saved
              </p>
            </div>
          )}
        </section>
      </Reveal>

      {/* ── AI Insights ── */}
      <Reveal delay={70}>
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                AI Insights
              </h2>
              <p className="section-subtitle">Observations based on your recent financial activity.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => nav({ to: "/assistant" })}>
              Ask AI Assistant
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mockAiInsights.map((insight, i) => (
              <Reveal key={insight.id} delay={i * 25}>
                <div className={`insight border-l-2 ${insightTypeStyles[insight.type] ?? insightTypeStyles.info}`}>
                  <p>{insight.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Reveal className="xl:col-span-2">
          <ChartFrame title="Balance over time" subtitle="Portfolio value over the last six months">
            <BalanceChart compact />
          </ChartFrame>
        </Reveal>
        <Reveal delay={70}>
          <ChartFrame title="Portfolio allocation" subtitle="Current asset distribution">
            <DonutChart />
          </ChartFrame>
        </Reveal>
        <Reveal className="xl:col-span-2">
          <ChartFrame title="Income vs expenses" subtitle="Monthly settled activity">
            <FlowChart compact />
          </ChartFrame>
        </Reveal>
        <Reveal delay={70}>
          <section className="panel h-full">
            <h3 className="font-semibold">Invoice pulse</h3>
            <p className="mt-1 text-xs text-muted-foreground">Current payment requests</p>
            <div className="mt-6 space-y-5">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Paid</span>
                  <strong>{currency(mockInvoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0))}</strong>
                </div>
                <div className="mt-2 h-1.5 bg-muted">
                  <div className="h-full w-[68%] bg-primary" />
                </div>
              </div>
              <div className="detail-list compact">
                <div><span>Pending</span><strong>1 invoice</strong></div>
                <div><span>Overdue</span><strong>1 invoice</strong></div>
                <div><span>Collection rate</span><strong>68%</strong></div>
              </div>
              <Button variant="outline" className="mt-5 w-full" onClick={() => nav({ to: "/invoices" })}>
                Manage invoices
              </Button>
            </div>
          </section>
        </Reveal>
      </div>

      {/* Recent transactions */}
      <Reveal>
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="section-title">Recent transactions</h2>
              <p className="section-subtitle">Latest activity across your wallet.</p>
            </div>
          </div>
          <TransactionList transactions={mockTransactions} limit={5} onViewAll={() => nav({ to: "/transactions" })} />
        </section>
      </Reveal>

      <SendDialog open={send} onOpenChange={setSend} />
      <ReceiveDialog open={receive} onOpenChange={setReceive} />
    </div>
  );
}
