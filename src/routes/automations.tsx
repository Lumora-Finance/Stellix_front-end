import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  CircleOff,
  Clock,
  Edit,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Repeat,
  Sparkles,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageIntro, DemoBadge, EmptyState, currency } from "@/components/shared/common";
import { Reveal } from "@/components/shared/motion";
import { mockAutomations, mockAutomationExecutions } from "@/data/mockAutomations";
import type { AutomationRule, AutomationExecution } from "@/types";

export const Route = createFileRoute("/automations")({
  head: () => ({
    meta: [
      { title: "Automations — Stellix" },
      { name: "description", content: "Create and manage your programmable money rules on Stellar." },
    ],
  }),
  component: AutomationsPage,
});

const typeIcons: Record<string, React.ElementType> = {
  salary_split: Wallet,
  recurring_transfer: Repeat,
  auto_savings: Sparkles,
  recurring_payment: RefreshCw,
  allowance: Clock,
  custom: Zap,
};

const statusColors: Record<string, string> = {
  active: "text-emerald-600 bg-emerald-50 border-emerald-200",
  paused: "text-amber-600 bg-amber-50 border-amber-200",
  completed: "text-primary bg-secondary border-border",
  cancelled: "text-destructive bg-destructive/10 border-destructive/20",
};

function AutomationStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-600 capitalize ${statusColors[status] ?? ""}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function AutomationCard({
  rule,
  onPause,
  onResume,
  onCancel,
  onViewHistory,
  onEdit,
}: {
  rule: AutomationRule;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onViewHistory: (rule: AutomationRule) => void;
  onEdit: (rule: AutomationRule) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[rule.type] ?? Zap;

  return (
    <div className="panel transition-all">
      <div className="flex items-start gap-4">
        <span className="action-icon mt-0.5 shrink-0">
          <Icon />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold leading-tight">{rule.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{rule.description}</p>
            </div>
            <AutomationStatusBadge status={rule.status} />
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="mt-1 font-mono font-medium">
                {rule.isPercentage ? `${rule.amount}%` : currency(rule.amount)} {rule.asset}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Frequency</p>
              <p className="mt-1 font-medium capitalize">{rule.frequency.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Executions</p>
              <p className="mt-1 font-medium">
                {rule.executedCount}
                {rule.occurrences ? ` / ${rule.occurrences}` : ""}
              </p>
            </div>
          </div>

          {expanded && (
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="detail-list compact">
                <div>
                  <span>Source</span>
                  <strong>{rule.source}</strong>
                </div>
                <div>
                  <span>Destination</span>
                  <strong>{rule.destination}</strong>
                </div>
                {rule.nextExecution && (
                  <div>
                    <span>Next execution</span>
                    <strong>{rule.nextExecution}</strong>
                  </div>
                )}
                {rule.lastExecution && (
                  <div>
                    <span>Last execution</span>
                    <strong>{new Date(rule.lastExecution).toLocaleDateString()}</strong>
                  </div>
                )}
                <div>
                  <span>Started</span>
                  <strong>{new Date(rule.startDate).toLocaleDateString()}</strong>
                </div>
                {rule.endDate && (
                  <div>
                    <span>Ends</span>
                    <strong>{new Date(rule.endDate).toLocaleDateString()}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              {expanded ? "Less" : "Details"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onViewHistory(rule)}>
              <Activity className="size-4" />
              History
            </Button>
            {rule.status !== "cancelled" && rule.status !== "completed" && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(rule)}>
                <Edit className="size-4" />
                Edit
              </Button>
            )}
            {rule.status === "active" && (
              <Button variant="ghost" size="sm" onClick={() => onPause(rule.id)}>
                <Pause className="size-4" />
                Pause
              </Button>
            )}
            {rule.status === "paused" && (
              <Button variant="ghost" size="sm" onClick={() => onResume(rule.id)}>
                <Play className="size-4" />
                Resume
              </Button>
            )}
            {(rule.status === "active" || rule.status === "paused") && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onCancel(rule.id)}>
                <CircleOff className="size-4" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ExecutionHistory({ rule, executions }: { rule: AutomationRule; executions: AutomationExecution[] }) {
  const ruleExecs = executions.filter((e) => e.automationId === rule.id);
  return (
    <div>
      <h3 className="font-semibold">{rule.name} — Execution History</h3>
      <p className="mt-1 text-sm text-muted-foreground">{ruleExecs.length} executions recorded.</p>
      {ruleExecs.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No executions yet.</p>
      ) : (
        <div className="detail-list mt-4">
          {ruleExecs.map((exec) => (
            <div key={exec.id}>
              <span className="text-xs">
                {new Date(exec.executedAt).toLocaleDateString()}
                {exec.note && <span className="ml-2 text-muted-foreground">— {exec.note}</span>}
              </span>
              <div className="flex items-center gap-2">
                <strong className="font-mono">
                  {currency(exec.amount)} {exec.asset}
                </strong>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-600 capitalize ${exec.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-destructive/10 text-destructive"}`}
                >
                  {exec.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type NewRuleForm = {
  name: string;
  type: AutomationRule["type"];
  amount: string;
  isPercentage: boolean;
  asset: AutomationRule["asset"];
  source: string;
  destination: string;
  frequency: AutomationRule["frequency"];
  startDate: string;
  endDate: string;
  occurrences: string;
};

const defaultForm: NewRuleForm = {
  name: "",
  type: "recurring_transfer",
  amount: "",
  isPercentage: false,
  asset: "USDC",
  source: "Primary wallet",
  destination: "",
  frequency: "monthly",
  startDate: new Date().toISOString().split("T")[0]!,
  endDate: "",
  occurrences: "",
};

function CreateRuleDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (rule: AutomationRule) => void }) {
  const [form, setForm] = useState<NewRuleForm>(defaultForm);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof NewRuleForm, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newRule: AutomationRule = {
      id: `auto-${Date.now()}`,
      name: form.name,
      type: form.type,
      description: `${form.isPercentage ? `${form.amount}%` : `${currency(Number(form.amount))} ${form.asset}`} → ${form.destination}`,
      amount: Number(form.amount),
      isPercentage: form.isPercentage,
      asset: form.asset,
      source: form.source,
      destination: form.destination,
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      occurrences: form.occurrences ? Number(form.occurrences) : undefined,
      executedCount: 0,
      status: "active",
      nextExecution: form.startDate,
      createdAt: new Date().toISOString(),
    };
    setLoading(false);
    onCreated(newRule);
    onOpenChange(false);
    setForm(defaultForm);
    setStep("form");
    toast.success("Automation created", { description: `${newRule.name} is now active. [SIMULATED — no real transaction]` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "form" ? "Create money rule" : "Confirm automation"}</DialogTitle>
          <DialogDescription>
            {step === "form" ? "Define how your money should move automatically." : "Review the details before activating this automation."}
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Rule name</Label>
              <Input placeholder="e.g. Monthly Rent, Weekly Savings" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recurring_transfer">Recurring transfer</SelectItem>
                  <SelectItem value="auto_savings">Auto savings</SelectItem>
                  <SelectItem value="recurring_payment">Recurring payment</SelectItem>
                  <SelectItem value="salary_split">Salary split</SelectItem>
                  <SelectItem value="allowance">Allowance</SelectItem>
                  <SelectItem value="custom">Custom rule</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input type="number" placeholder="e.g. 200" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Asset</Label>
                <Select value={form.asset} onValueChange={(v) => set("asset", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="XLM">XLM</SelectItem>
                    <SelectItem value="EURC">EURC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isPercentage} onCheckedChange={(v) => set("isPercentage", v)} id="pct" />
              <Label htmlFor="pct">Amount is a percentage of incoming payment</Label>
            </div>
            <div className="grid gap-2">
              <Label>Destination</Label>
              <Input placeholder="Wallet address or label" value={form.destination} onChange={(e) => set("destination", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => set("frequency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="on_payment">On payment received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Start date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>End date (optional)</Label>
                <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>No. of occurrences (optional)</Label>
                <Input type="number" placeholder="e.g. 12" value={form.occurrences} onChange={(e) => set("occurrences", e.target.value)} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="insight">
              <p className="text-xs font-600 uppercase tracking-wide text-muted-foreground">SIMULATED — Demo mode</p>
              <p className="mt-1 text-sm">No real Stellar transaction will be created. This automation is stored in demo state only.</p>
            </div>
            <div className="detail-list">
              {[
                ["Name", form.name],
                ["Type", form.type.replace("_", " ")],
                ["Amount", `${form.isPercentage ? `${form.amount}%` : currency(Number(form.amount))} ${form.asset}`],
                ["Destination", form.destination || "—"],
                ["Frequency", form.frequency],
                ["Start date", form.startDate],
                ...(form.endDate ? [["End date", form.endDate] as [string, string]] : []),
                ...(form.occurrences ? [["Occurrences", form.occurrences] as [string, string]] : []),
              ].map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <strong className="capitalize">{v}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "form" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStep("confirm")} disabled={!form.name || !form.amount || !form.destination}>Review</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" /> : <Zap />}
                Activate automation
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>(mockAutomations);
  const [executions] = useState<AutomationExecution[]>(mockAutomationExecutions);
  const [historyRule, setHistoryRule] = useState<AutomationRule | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? rules : rules.filter((r) => r.status === filter);
  const active = rules.filter((r) => r.status === "active").length;

  const handlePause = (id: string) => {
    setRules((r) => r.map((a) => (a.id === id ? { ...a, status: "paused" } : a)));
    toast("Automation paused", { description: "It will not execute until resumed." });
  };

  const handleResume = (id: string) => {
    setRules((r) => r.map((a) => (a.id === id ? { ...a, status: "active" } : a)));
    toast.success("Automation resumed", { description: "It will run on its next scheduled time." });
  };

  const handleCancel = () => {
    if (!cancelId) return;
    setRules((r) => r.map((a) => (a.id === cancelId ? { ...a, status: "cancelled" } : a)));
    setCancelId(null);
    toast("Automation cancelled", { description: "It has been permanently stopped." });
  };

  const handleCreated = (rule: AutomationRule) => {
    setRules((r) => [rule, ...r]);
  };

  return (
    <div className="space-y-8">
      <Reveal>
        <PageIntro
          title="Automations"
          description="Create programmable money rules that automatically control how your funds move."
          action={<DemoBadge />}
        />
      </Reveal>

      {/* Stats row */}
      <Reveal delay={40}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active rules", value: active, icon: Activity },
            { label: "Total executions", value: executions.length, icon: Zap },
            { label: "Automations saved", value: `${rules.filter((r) => r.type === "auto_savings").length} rules`, icon: Sparkles },
          ].map((s) => (
            <section key={s.label} className="stat-card">
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="size-5 text-primary" />
              </div>
              <p className="mt-5 text-2xl font-semibold">{s.value}</p>
            </section>
          ))}
        </div>
      </Reveal>

      {/* Toolbar */}
      <Reveal delay={60}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["all", "active", "paused", "completed", "cancelled"].map((f) => (
              <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)} className="capitalize">
                {f}
              </Button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            New rule
          </Button>
        </div>
      </Reveal>

      {/* Rule cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Zap}
            title="No automations found"
            description="Create your first money rule to automate how your funds move."
            action={<Button onClick={() => setCreateOpen(true)}><Plus />Create rule</Button>}
          />
        ) : (
          filtered.map((rule, i) => (
            <Reveal key={rule.id} delay={i * 40}>
              <AutomationCard
                rule={rule}
                onPause={handlePause}
                onResume={handleResume}
                onCancel={(id) => setCancelId(id)}
                onViewHistory={(r) => setHistoryRule(r)}
                onEdit={(r) => toast.info("Edit coming soon", { description: r.name })}
              />
            </Reveal>
          ))
        )}
      </div>

      {/* Create dialog */}
      <CreateRuleDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />

      {/* History dialog */}
      <Dialog open={!!historyRule} onOpenChange={(o) => !o && setHistoryRule(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Execution history</DialogTitle>
            <DialogDescription>Past runs for this automation rule.</DialogDescription>
          </DialogHeader>
          {historyRule && <ExecutionHistory rule={historyRule} executions={executions} />}
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation */}
      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel automation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently stop the automation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, cancel it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
