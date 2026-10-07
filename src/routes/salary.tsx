import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit,
  PieChart,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PageIntro, DemoBadge, currency } from "@/components/shared/common";
import { Reveal } from "@/components/shared/motion";
import { mockSalaryConfig, mockSalaryHistory } from "@/data/mockSalary";
import type { SalaryConfig, SalaryRecord, SalarySplitRule } from "@/types";

export const Route = createFileRoute("/salary")({
  head: () => ({
    meta: [
      { title: "Salary — Stellix" },
      { name: "description", content: "Track salary history and configure automatic distribution." },
    ],
  }),
  component: SalaryPage,
});

const COLORS = [
  "bg-primary",
  "bg-chart-2",
  "bg-chart-3",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
];

const HEX_COLORS = [
  "oklch(.62 .13 76)",
  "oklch(.48 .04 79)",
  "oklch(.78 .07 84)",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
];

function AllocationBar({ rules }: { rules: SalarySplitRule[] }) {
  return (
    <div className="space-y-4">
      {/* Visual bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-md">
        {rules.map((rule, i) => (
          <div
            key={rule.id}
            className="transition-all"
            style={{ width: `${rule.percentage}%`, backgroundColor: HEX_COLORS[i % HEX_COLORS.length] }}
            title={`${rule.label}: ${rule.percentage}%`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="grid gap-2 sm:grid-cols-2">
        {rules.map((rule, i) => (
          <div key={rule.id} className="flex items-center gap-2 text-sm">
            <span className={`size-3 shrink-0 rounded-sm ${COLORS[i % COLORS.length]}`} style={{ backgroundColor: HEX_COLORS[i % HEX_COLORS.length] }} />
            <span className="text-muted-foreground">{rule.label}</span>
            <span className="ml-auto font-mono font-medium">{rule.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EditDistributionDialog({
  open,
  onOpenChange,
  config,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  config: SalaryConfig;
  onSave: (rules: SalarySplitRule[]) => void;
}) {
  const [rules, setRules] = useState<SalarySplitRule[]>([...config.distributionRules]);
  const [loading, setLoading] = useState(false);

  const total = rules.reduce((s, r) => s + r.percentage, 0);
  const valid = Math.abs(total - 100) < 0.01;

  const updateRule = (id: string, key: keyof SalarySplitRule, val: string | number) => {
    setRules((r) =>
      r.map((rule) => (rule.id === id ? { ...rule, [key]: key === "percentage" ? Number(val) : val } : rule))
    );
  };

  const addRule = () =>
    setRules((r) => [
      ...r,
      { id: `rule-${Date.now()}`, label: "New bucket", destination: "", percentage: 0, asset: "USDC" },
    ]);

  const removeRule = (id: string) => setRules((r) => r.filter((rule) => rule.id !== id));

  const handleSave = async () => {
    if (!valid) return;
    setLoading(true);
    await new Promise((res) => setTimeout(res, 500));
    setLoading(false);
    onSave(rules);
    onOpenChange(false);
    toast.success("Distribution updated", { description: "Your salary will be allocated according to the new rules. [SIMULATED]" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit salary distribution</DialogTitle>
          <DialogDescription>Configure how your salary is automatically split. Total must equal 100%.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-end gap-3">
              <div className="grid flex-1 gap-1">
                <Label className="text-xs">Label</Label>
                <Input value={rule.label} onChange={(e) => updateRule(rule.id, "label", e.target.value)} placeholder="e.g. Savings" />
              </div>
              <div className="grid w-24 gap-1">
                <Label className="text-xs">%</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={rule.percentage}
                  onChange={(e) => updateRule(rule.id, "percentage", e.target.value)}
                />
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeRule(rule.id)}>
                ×
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addRule}>+ Add bucket</Button>
          <div className={`text-sm font-medium ${valid ? "text-primary" : "text-destructive"}`}>
            Total: {total}% {valid ? "✓" : `— ${100 - total}% remaining`}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!valid || loading}>
            {loading ? <RefreshCw className="animate-spin" /> : <CheckCircle2 />}
            Save distribution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const statusCls: Record<string, string> = {
  received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  upcoming: "bg-blue-50 text-blue-700 border-blue-200",
};

function SalaryPage() {
  const [config, setConfig] = useState<SalaryConfig>(mockSalaryConfig);
  const [history] = useState<SalaryRecord[]>(mockSalaryHistory);
  const [editOpen, setEditOpen] = useState(false);

  const received = history.filter((h) => h.status === "received");
  const totalReceived = received.reduce((s, r) => s + r.amount, 0);

  const handleSaveRules = (rules: SalarySplitRule[]) => {
    setConfig((c) => ({ ...c, distributionRules: rules }));
  };

  return (
    <div className="space-y-8">
      <Reveal>
        <PageIntro
          title="Salary"
          description="Track your salary history and configure automatic distribution rules."
          action={<DemoBadge />}
        />
      </Reveal>

      {/* Salary overview */}
      <Reveal delay={40}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Monthly salary", value: currency(config.amount), icon: ArrowDownLeft },
            { label: "Total received (YTD)", value: currency(totalReceived), icon: Wallet },
            { label: "Next payment", value: new Date(config.nextPayment).toLocaleDateString(), icon: CalendarClock },
            { label: "Employer", value: config.employer, icon: Building2 },
          ].map((s) => (
            <section key={s.label} className="stat-card">
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="size-5 text-primary" />
              </div>
              <p className="mt-5 text-xl font-semibold">{s.value}</p>
            </section>
          ))}
        </div>
      </Reveal>

      {/* Distribution */}
      <Reveal delay={60}>
        <section className="panel">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="section-title flex items-center gap-2">
                <PieChart className="size-5 text-primary" />
                Salary distribution
              </h2>
              <p className="section-subtitle">How your {currency(config.amount)} {config.asset} salary is allocated.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Switch
                  id="auto-dist"
                  checked={config.autoDistribute}
                  onCheckedChange={(v) => {
                    setConfig((c) => ({ ...c, autoDistribute: v }));
                    toast(v ? "Auto-distribution enabled" : "Auto-distribution disabled");
                  }}
                />
                <Label htmlFor="auto-dist">Auto-distribute</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Edit className="size-4" />
                Edit
              </Button>
            </div>
          </div>

          <AllocationBar rules={config.distributionRules} />

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {config.distributionRules.map((rule, i) => (
              <div key={rule.id} className="flex items-center justify-between rounded-md border border-border p-4">
                <div className="flex items-center gap-3">
                  <span className="size-3 shrink-0 rounded-sm" style={{ backgroundColor: HEX_COLORS[i % HEX_COLORS.length] }} />
                  <div>
                    <p className="text-sm font-medium">{rule.label}</p>
                    <p className="text-xs text-muted-foreground">{rule.destination}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-primary">{rule.percentage}%</p>
                  <p className="text-xs text-muted-foreground">{currency(config.amount * rule.percentage / 100)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Payment history */}
      <Reveal delay={80}>
        <section>
          <div className="mb-4">
            <h2 className="section-title">Payment history</h2>
            <p className="section-subtitle">All salary payments from {config.employer}.</p>
          </div>
          <div className="overflow-hidden border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">Employer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((record) => (
                  <tr key={record.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="action-icon size-8 shrink-0">
                          {record.status === "received" ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                        </span>
                        <span className="font-medium">{record.period}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{record.employer}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-600 capitalize ${statusCls[record.status]}`}>
                        <span className="size-1.5 rounded-full bg-current" />
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {currency(record.amount)} {record.asset}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      <EditDistributionDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        config={config}
        onSave={handleSaveRules}
      />
    </div>
  );
}
