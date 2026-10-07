import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  CircleOff,
  Clock,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Repeat,
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
import { PageIntro, DemoBadge, EmptyState, currency } from "@/components/shared/common";
import { Reveal } from "@/components/shared/motion";
import { mockRecurringPayments } from "@/data/mockRecurringPayments";
import type { RecurringPayment } from "@/types";

export const Route = createFileRoute("/recurring")({
  head: () => ({
    meta: [
      { title: "Recurring Payments — Stellix" },
      { name: "description", content: "Manage scheduled and recurring payments on Stellar." },
    ],
  }),
  component: RecurringPage,
});

const statusColors: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  completed: "bg-secondary text-primary border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-600 capitalize ${statusColors[status] ?? ""}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function PaymentCard({
  payment,
  onPause,
  onResume,
  onCancel,
}: {
  payment: RecurringPayment;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <div className="panel">
      <div className="flex items-start gap-4">
        <span className="action-icon mt-0.5 shrink-0">
          <Repeat />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold">{payment.name}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">To {payment.recipient}</p>
            </div>
            <StatusBadge status={payment.status} />
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Amount</p>
              <p className="mt-1 font-mono font-semibold text-primary">
                {currency(payment.amount)} {payment.asset}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Frequency</p>
              <p className="mt-1 font-medium capitalize">{payment.frequency}</p>
            </div>
            {payment.nextPayment && (
              <div>
                <p className="text-xs text-muted-foreground">Next payment</p>
                <p className="mt-1 font-medium">{new Date(payment.nextPayment).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Payments made</p>
              <p className="mt-1 font-medium">
                {payment.paidCount}
                {payment.totalOccurrences ? ` / ${payment.totalOccurrences}` : ""}
              </p>
            </div>
          </div>

          {payment.memo && (
            <p className="mt-3 text-xs text-muted-foreground">Memo: {payment.memo}</p>
          )}

          {(payment.status === "active" || payment.status === "paused") && (
            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              {payment.status === "active" && (
                <Button variant="ghost" size="sm" onClick={() => onPause(payment.id)}>
                  <Pause className="size-4" />
                  Pause
                </Button>
              )}
              {payment.status === "paused" && (
                <Button variant="ghost" size="sm" onClick={() => onResume(payment.id)}>
                  <Play className="size-4" />
                  Resume
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onCancel(payment.id)}>
                <CircleOff className="size-4" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type NewPaymentForm = {
  name: string;
  recipient: string;
  amount: string;
  asset: "USDC" | "XLM" | "EURC";
  frequency: RecurringPayment["frequency"];
  startDate: string;
  endDate: string;
  totalOccurrences: string;
  memo: string;
};

const defaultForm: NewPaymentForm = {
  name: "",
  recipient: "",
  amount: "",
  asset: "USDC",
  frequency: "monthly",
  startDate: new Date().toISOString().split("T")[0]!,
  endDate: "",
  totalOccurrences: "",
  memo: "",
};

function CreatePaymentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreated: (p: RecurringPayment) => void;
}) {
  const [form, setForm] = useState<NewPaymentForm>(defaultForm);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof NewPaymentForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newPayment: RecurringPayment = {
      id: `rp-${Date.now()}`,
      name: form.name,
      recipient: form.recipient,
      recipientAddress: "",
      asset: form.asset,
      amount: Number(form.amount),
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      totalOccurrences: form.totalOccurrences ? Number(form.totalOccurrences) : undefined,
      paidCount: 0,
      nextPayment: form.startDate,
      status: "active",
      memo: form.memo || undefined,
      createdAt: new Date().toISOString(),
    };
    setLoading(false);
    onCreated(newPayment);
    onOpenChange(false);
    setForm(defaultForm);
    setStep("form");
    toast.success("Recurring payment created", { description: `${newPayment.name} will run ${newPayment.frequency}. [SIMULATED]` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "form" ? "New recurring payment" : "Confirm payment schedule"}</DialogTitle>
          <DialogDescription>
            {step === "form" ? "Set up a scheduled or recurring payment." : "Review details before activating."}
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Payment name</Label>
              <Input placeholder="e.g. Rent, Figma subscription" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Recipient</Label>
              <Input placeholder="Name or wallet address" value={form.recipient} onChange={(e) => set("recipient", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input type="number" placeholder="e.g. 500" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
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
                    <SelectItem value="quarterly">Quarterly</SelectItem>
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
                <Label>Occurrences (optional)</Label>
                <Input type="number" placeholder="e.g. 12" value={form.totalOccurrences} onChange={(e) => set("totalOccurrences", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Memo (optional)</Label>
              <Input placeholder="What is this payment for?" value={form.memo} onChange={(e) => set("memo", e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="insight">
              <p className="text-xs font-600 uppercase tracking-wide text-muted-foreground">SIMULATED — Demo mode</p>
              <p className="mt-1 text-sm">No real Stellar transaction will occur until live mode is enabled.</p>
            </div>
            <div className="detail-list">
              {[
                ["Name", form.name],
                ["Recipient", form.recipient],
                ["Amount", `${currency(Number(form.amount))} ${form.asset}`],
                ["Frequency", form.frequency],
                ["Start date", form.startDate],
                ...(form.endDate ? [["End date", form.endDate] as [string, string]] : []),
                ...(form.memo ? [["Memo", form.memo] as [string, string]] : []),
                ["Network", "Stellar (Demo)"],
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
              <Button onClick={() => setStep("confirm")} disabled={!form.name || !form.amount || !form.recipient}>Review</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" /> : <Repeat />}
                Activate payment
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecurringPage() {
  const [payments, setPayments] = useState<RecurringPayment[]>(mockRecurringPayments);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? payments : payments.filter((p) => p.status === filter);
  const active = payments.filter((p) => p.status === "active");
  const totalMonthly = active
    .filter((p) => p.frequency === "monthly")
    .reduce((s, p) => s + p.amount, 0);

  const handlePause = (id: string) => {
    setPayments((ps) => ps.map((p) => (p.id === id ? { ...p, status: "paused" } : p)));
    toast("Payment paused");
  };

  const handleResume = (id: string) => {
    setPayments((ps) => ps.map((p) => (p.id === id ? { ...p, status: "active" } : p)));
    toast.success("Payment resumed");
  };

  const handleCancel = () => {
    if (!cancelId) return;
    setPayments((ps) => ps.map((p) => (p.id === cancelId ? { ...p, status: "cancelled" } : p)));
    setCancelId(null);
    toast("Payment cancelled");
  };

  const handleCreated = (p: RecurringPayment) => setPayments((ps) => [p, ...ps]);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageIntro
          title="Recurring Payments"
          description="Schedule and manage automatic recurring payments to anyone on Stellar."
          action={<DemoBadge />}
        />
      </Reveal>

      <Reveal delay={40}>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active payments", value: active.length, icon: Repeat },
            { label: "Monthly total", value: currency(totalMonthly), icon: Wallet },
            { label: "Next payment", value: active[0]?.nextPayment ? new Date(active[0].nextPayment).toLocaleDateString() : "—", icon: CalendarDays },
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
            New payment
          </Button>
        </div>
      </Reveal>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Repeat}
            title="No recurring payments found"
            description="Set up automatic recurring payments to rent, subscriptions, family, and more."
            action={<Button onClick={() => setCreateOpen(true)}><Plus />New payment</Button>}
          />
        ) : (
          filtered.map((p, i) => (
            <Reveal key={p.id} delay={i * 40}>
              <PaymentCard payment={p} onPause={handlePause} onResume={handleResume} onCancel={(id) => setCancelId(id)} />
            </Reveal>
          ))
        )}
      </div>

      <CreatePaymentDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />

      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel recurring payment?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently stop this payment. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cancel payment</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
