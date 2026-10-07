import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  FileText,
  Gift,
  RefreshCw,
  Repeat,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
  Zap,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DemoBadge, IconButton, currency } from "@/components/shared/common";
import { assistantService } from "@/services/assistantService";
import type { AssistantMessage, AssetSymbol } from "@/types";
import { SendDialog } from "@/components/wallet/wallet-flows";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [{ title: "AI Assistant — Stellix" }],
  }),
  component: AssistantPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────────

type InputField = {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "chips";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

type FlowStep = {
  message: string;
  field: InputField;
};

/** What modal to open when a flow is confirmed */
type ModalTrigger =
  | { type: "invoice"; prefill: Record<string, string> }
  | { type: "send"; prefill: Record<string, string> }
  | { type: "gift"; prefill: Record<string, string> }
  | { type: "automation"; prefill: Record<string, string> }
  | { type: "recurring"; prefill: Record<string, string> }
  | { type: "salary"; prefill: Record<string, string> };

type Flow = {
  id: string;
  title: string;
  steps: FlowStep[];
  buildConfirmSummary: (data: Record<string, string>) => Record<string, string>;
  confirmQuestion: string;
  modal: (data: Record<string, string>) => ModalTrigger;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: Date;
  flowStep?: FlowStep;
  confirmation?: {
    summary: Record<string, string>;
    flowTitle: string;
    data: Record<string, string>;
    flowId: string;
  };
  confirmed?: boolean;
  cancelled?: boolean;
  successAction?: ModalTrigger & { label: string };
};

type FlowState = {
  flowId: string;
  stepIndex: number;
  data: Record<string, string>;
  activeMessageId: string;
};

// ─── Flows ─────────────────────────────────────────────────────────────────────

const flows: Record<string, Flow> = {
  create_invoice: {
    id: "create_invoice",
    title: "Create an invoice",
    steps: [
      { message: "Who is this invoice for? Enter the client's name.", field: { key: "clientName", label: "Client name", type: "text", placeholder: "e.g. Acme Studio", required: true } },
      { message: "What's the client's email address?", field: { key: "clientEmail", label: "Client email", type: "text", placeholder: "finance@client.com", required: true } },
      { message: "What's the invoice title?", field: { key: "title", label: "Invoice title", type: "text", placeholder: "e.g. Product design retainer", required: true } },
      { message: "What's the total amount?", field: { key: "amount", label: "Amount", type: "number", placeholder: "e.g. 1500", required: true } },
      { message: "Which asset?", field: { key: "asset", label: "Asset", type: "chips", options: ["USDC", "EURC", "XLM"] } },
      { message: "What's the due date?", field: { key: "dueDate", label: "Due date", type: "date", required: true } },
      { message: "Any notes for the client? (optional)", field: { key: "notes", label: "Notes", type: "text", placeholder: "e.g. Payment due within 14 days" } },
    ],
    buildConfirmSummary: (d) => ({
      "Client": d.clientName ?? "",
      "Email": d.clientEmail ?? "",
      "Title": d.title ?? "",
      "Amount": `${d.amount} ${d.asset ?? "USDC"}`,
      "Due": d.dueDate ?? "",
      ...(d.notes && d.notes !== "—" ? { "Notes": d.notes } : {}),
      "Network": "Stellar (Demo)",
    }),
    confirmQuestion: "Here's your invoice. Open the invoice editor to review and send it?",
    modal: (d) => ({ type: "invoice", prefill: d }),
  },

  send_money: {
    id: "send_money",
    title: "Send money",
    steps: [
      { message: "Who are you sending to? Enter their name or wallet address.", field: { key: "recipient", label: "Recipient", type: "text", placeholder: "G… or name", required: true } },
      { message: "How much?", field: { key: "amount", label: "Amount", type: "number", placeholder: "e.g. 500", required: true } },
      { message: "Which asset?", field: { key: "asset", label: "Asset", type: "chips", options: ["USDC", "XLM", "EURC"] } },
      { message: "Any memo? (optional — leave blank to skip)", field: { key: "memo", label: "Memo", type: "text", placeholder: "e.g. Invoice #104" } },
    ],
    buildConfirmSummary: (d) => ({
      "To": d.recipient ?? "",
      "Amount": `${d.amount} ${d.asset ?? "USDC"}`,
      ...(d.memo && d.memo !== "—" ? { "Memo": d.memo } : {}),
      "Network fee": "0.00001 XLM",
      "Network": "Stellar (Demo)",
    }),
    confirmQuestion: "Ready to open the send dialog with these details?",
    modal: (d) => ({ type: "send", prefill: d }),
  },

  create_gift: {
    id: "create_gift",
    title: "Create a programmable gift",
    steps: [
      { message: "Who is the gift for?", field: { key: "recipient", label: "Recipient", type: "text", placeholder: "e.g. Mom, Alex", required: true } },
      { message: "How much?", field: { key: "amount", label: "Amount", type: "number", placeholder: "e.g. 100", required: true } },
      { message: "Which asset?", field: { key: "asset", label: "Asset", type: "chips", options: ["USDC", "XLM", "EURC"] } },
      { message: "When should it unlock? The recipient can claim it on or after this date.", field: { key: "unlockDate", label: "Unlock date", type: "date", required: true } },
      { message: "Should it expire? Enter an expiry date, or skip to leave it open.", field: { key: "expirationDate", label: "Expiry date", type: "date" } },
      { message: "Is this recurring?", field: { key: "recurring", label: "Recurring?", type: "chips", options: ["No — one-time", "Yes — weekly", "Yes — monthly"] } },
      { message: "Add a personal message? (optional)", field: { key: "message", label: "Message", type: "text", placeholder: "e.g. Happy birthday! 🎂" } },
    ],
    buildConfirmSummary: (d) => ({
      "To": d.recipient ?? "",
      "Amount": `${d.amount} ${d.asset ?? "USDC"}`,
      "Unlocks": d.unlockDate ?? "",
      ...(d.expirationDate && d.expirationDate !== "—" ? { "Expires": d.expirationDate } : {}),
      "Recurrence": d.recurring ?? "No — one-time",
      ...(d.message && d.message !== "—" ? { "Message": d.message } : {}),
    }),
    confirmQuestion: "Open the gift creator with these details?",
    modal: (d) => ({ type: "gift", prefill: d }),
  },

  create_savings_rule: {
    id: "create_savings_rule",
    title: "Create a savings rule",
    steps: [
      { message: "How much to save — enter a fixed amount (e.g. 200) or percentage (e.g. 20%)?", field: { key: "amount", label: "Amount or %", type: "text", placeholder: "e.g. 200 or 20%", required: true } },
      { message: "Which asset?", field: { key: "asset", label: "Asset", type: "chips", options: ["USDC", "XLM", "EURC"] } },
      { message: "Where should savings go?", field: { key: "destination", label: "Destination", type: "text", placeholder: "e.g. Savings wallet", required: true } },
      { message: "How often?", field: { key: "frequency", label: "Frequency", type: "chips", options: ["On every payment", "Weekly", "Monthly"] } },
      { message: "What should this rule be called?", field: { key: "name", label: "Rule name", type: "text", placeholder: "e.g. Auto savings 20%", required: true } },
    ],
    buildConfirmSummary: (d) => ({
      "Name": d.name ?? "",
      "Save": `${d.amount} ${d.asset ?? "USDC"}`,
      "Destination": d.destination ?? "",
      "Frequency": d.frequency ?? "",
    }),
    confirmQuestion: "Open the automation creator with these details?",
    modal: (d) => ({ type: "automation", prefill: d }),
  },

  recurring_transfer: {
    id: "recurring_transfer",
    title: "Set up a recurring transfer",
    steps: [
      { message: "Who receives it?", field: { key: "recipient", label: "Recipient", type: "text", placeholder: "Name or address", required: true } },
      { message: "How much per payment?", field: { key: "amount", label: "Amount", type: "number", placeholder: "e.g. 50", required: true } },
      { message: "Which asset?", field: { key: "asset", label: "Asset", type: "chips", options: ["USDC", "XLM", "EURC"] } },
      { message: "How often?", field: { key: "frequency", label: "Frequency", type: "chips", options: ["Daily", "Weekly", "Biweekly", "Monthly"] } },
      { message: "For how many payments? (leave blank for indefinite)", field: { key: "occurrences", label: "Occurrences", type: "number", placeholder: "e.g. 12" } },
      { message: "When should it start?", field: { key: "startDate", label: "Start date", type: "date", required: true } },
    ],
    buildConfirmSummary: (d) => ({
      "To": d.recipient ?? "",
      "Amount": `${d.amount} ${d.asset ?? "USDC"}`,
      "Frequency": d.frequency ?? "",
      "Occurrences": d.occurrences && d.occurrences !== "—" ? d.occurrences : "Indefinite",
      "Starts": d.startDate ?? "",
    }),
    confirmQuestion: "Open the recurring payment creator with these details?",
    modal: (d) => ({ type: "recurring", prefill: d }),
  },

  set_salary_distribution: {
    id: "set_salary_distribution",
    title: "Set up salary distribution",
    steps: [
      { message: "What's your monthly salary amount?", field: { key: "salary", label: "Monthly salary", type: "number", placeholder: "e.g. 2000", required: true } },
      { message: "Which asset do you receive salary in?", field: { key: "asset", label: "Asset", type: "chips", options: ["USDC", "EURC", "XLM"] } },
      { message: "What % goes to your Personal account?", field: { key: "personal", label: "Personal %", type: "number", placeholder: "e.g. 60", required: true } },
      { message: "What % to Savings?", field: { key: "savings", label: "Savings %", type: "number", placeholder: "e.g. 20", required: true } },
      { message: "What % to Rent?", field: { key: "rent", label: "Rent %", type: "number", placeholder: "e.g. 10", required: true } },
      { message: "What % to Family?", field: { key: "family", label: "Family %", type: "number", placeholder: "e.g. 10", required: true } },
    ],
    buildConfirmSummary: (d) => {
      const s = Number(d.salary);
      const p = Number(d.personal), sv = Number(d.savings), r = Number(d.rent), f = Number(d.family);
      const total = p + sv + r + f;
      return {
        "Salary": `${d.asset ?? "USDC"} ${d.salary}/month`,
        "Personal": `${p}% → $${((s * p) / 100).toFixed(0)}`,
        "Savings": `${sv}% → $${((s * sv) / 100).toFixed(0)}`,
        "Rent": `${r}% → $${((s * r) / 100).toFixed(0)}`,
        "Family": `${f}% → $${((s * f) / 100).toFixed(0)}`,
        "Total": `${total}%${total !== 100 ? " ⚠️ must be 100%" : " ✓"}`,
      };
    },
    confirmQuestion: "Open the salary distribution editor with these details?",
    modal: (d) => ({ type: "salary", prefill: d }),
  },

  create_allowance: {
    id: "create_allowance",
    title: "Set up an automatic allowance",
    steps: [
      { message: "Who receives the allowance?", field: { key: "recipient", label: "Recipient", type: "text", placeholder: "e.g. Child, Family member", required: true } },
      { message: "How much per payment?", field: { key: "amount", label: "Amount", type: "number", placeholder: "e.g. 50", required: true } },
      { message: "Which asset?", field: { key: "asset", label: "Asset", type: "chips", options: ["USDC", "XLM", "EURC"] } },
      { message: "How often?", field: { key: "frequency", label: "Frequency", type: "chips", options: ["Weekly", "Biweekly", "Monthly"] } },
      { message: "When should it start?", field: { key: "startDate", label: "Start date", type: "date", required: true } },
    ],
    buildConfirmSummary: (d) => ({
      "To": d.recipient ?? "",
      "Amount": `${d.amount} ${d.asset ?? "USDC"} ${(d.frequency ?? "").toLowerCase()}`,
      "Starts": d.startDate ?? "",
    }),
    confirmQuestion: "Open the recurring payment creator with these details?",
    modal: (d) => ({ type: "recurring", prefill: d }),
  },
};

// ─── Category suggestions ──────────────────────────────────────────────────────

type ChipDef = string | { text: string; flowId: string };

const categories = [
  {
    id: "money", label: "Your Money", icon: Wallet,
    chips: ["How much did I spend?", "How much did I receive?", "Show my biggest transactions.", "What is my total portfolio value?", "Give me a summary of my finances.", "Compare my spending with last month."] as ChipDef[],
  },
  {
    id: "payments", label: "Payments", icon: CreditCard,
    chips: ["Which invoices are unpaid?", "Show my recurring payments.", "What payments are coming up?", "Which invoices are overdue?", "How much am I waiting to receive?"] as ChipDef[],
  },
  {
    id: "portfolio", label: "Portfolio", icon: BarChart3,
    chips: ["How is my portfolio distributed?", "How much USDC do I have?", "How much XLM do I have?", "How much EURC do I have?", "How has my balance changed?"] as ChipDef[],
  },
  {
    id: "actions", label: "Take Action", icon: Zap,
    chips: [
      { text: "Create an invoice", flowId: "create_invoice" },
      { text: "Send money", flowId: "send_money" },
      { text: "Create a savings rule", flowId: "create_savings_rule" },
      { text: "Set up a recurring transfer", flowId: "recurring_transfer" },
      { text: "Create a programmable gift", flowId: "create_gift" },
      { text: "Set up salary distribution", flowId: "set_salary_distribution" },
      { text: "Set up an allowance", flowId: "create_allowance" },
    ] as ChipDef[],
  },
  {
    id: "gifts", label: "Gifts", icon: Gift,
    chips: [
      { text: "Create a programmable gift", flowId: "create_gift" },
      "Show my active gifts.", "Show gifts I've sent.", "Which gifts are waiting to be claimed?",
    ] as ChipDef[],
  },
  {
    id: "salary", label: "Salary", icon: TrendingUp,
    chips: [
      { text: "Set up salary distribution", flowId: "set_salary_distribution" },
      "Show my salary history.", "Show where my salary goes.", "Show my upcoming salary.",
    ] as ChipDef[],
  },
  {
    id: "invoices", label: "Invoices", icon: FileText,
    chips: [
      { text: "Create an invoice", flowId: "create_invoice" },
      "Show my unpaid invoices.", "How much am I owed?", "What's my invoice collection rate?",
    ] as ChipDef[],
  },
  {
    id: "insights", label: "Insights", icon: Sparkles,
    chips: ["Summarize my financial activity.", "What changed this month?", "Show my income vs expenses.", "Highlight unusual transactions.", "What are my biggest financial trends?"] as ChipDef[],
  },
];

// ─── Inline input components ────────────────────────────────────────────────────

function ChipsInput({ options, onSelect }: { options: string[]; onSelect: (v: string) => void }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function InlineInput({ field, onSubmit }: { field: InputField; onSubmit: (v: string) => void }) {
  const [val, setVal] = useState("");
  const submit = () => {
    const v = val.trim() || (field.required ? "" : "—");
    if (field.required && !v) return;
    onSubmit(v || "—");
    setVal("");
  };
  return (
    <div className="mt-3 flex items-end gap-2">
      <div className="flex-1">
        <Input
          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
          placeholder={field.placeholder}
          value={val}
          autoFocus
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className="max-w-xs"
        />
      </div>
      <Button size="sm" onClick={submit} disabled={field.required && !val.trim()}>
        Continue
      </Button>
      {!field.required && (
        <Button size="sm" variant="ghost" onClick={() => onSubmit("—")}>
          Skip
        </Button>
      )}
    </div>
  );
}

// ─── Inline action modals ────────────────────────────────────────────────────────

/** Invoice creation modal — pre-filled from AI flow data */
function InlineInvoiceModal({
  open, onOpenChange, prefill, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefill: Record<string, string>;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    clientName: prefill.clientName ?? "",
    clientEmail: prefill.clientEmail ?? "",
    title: prefill.title ?? "",
    amount: prefill.amount ?? "",
    asset: (prefill.asset ?? "USDC") as AssetSymbol,
    dueDate: prefill.dueDate ?? "",
    notes: prefill.notes !== "—" ? (prefill.notes ?? "") : "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Invoice created", { description: `${form.title} · ${form.amount} ${form.asset} [SIMULATED]` });
    onDone();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create invoice</DialogTitle>
          <DialogDescription>Pre-filled from your conversation. Review and adjust before creating.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label>Client name</Label><Input value={form.clientName} onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))} /></div>
            <div className="grid gap-1.5"><Label>Client email</Label><Input type="email" value={form.clientEmail} onChange={(e) => setForm((f) => ({ ...f, clientEmail: e.target.value }))} /></div>
            <div className="grid gap-1.5 sm:col-span-2"><Label>Invoice title</Label><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid gap-1.5"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="grid gap-1.5">
              <Label>Asset</Label>
              <Select value={form.asset} onValueChange={(v) => setForm((f) => ({ ...f, asset: v as AssetSymbol }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["USDC", "EURC", "XLM"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></div>
          </div>
          <div className="grid gap-1.5"><Label>Description (optional)</Label><Textarea rows={2} className="resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
          <div className="grid gap-1.5"><Label>Notes (optional)</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></div>
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            Demo mode — no real transaction will be broadcast.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.clientName || !form.amount}>
            {loading ? <RefreshCw className="animate-spin size-4" /> : <FileText className="size-4" />}
            Create invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Gift creation modal — pre-filled from AI flow data */
function InlineGiftModal({
  open, onOpenChange, prefill, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefill: Record<string, string>;
  onDone: () => void;
}) {
  const isRecurring = prefill.recurring?.toLowerCase().startsWith("yes");
  const [form, setForm] = useState({
    recipient: prefill.recipient ?? "",
    amount: prefill.amount ?? "",
    asset: (prefill.asset ?? "USDC") as AssetSymbol,
    unlockDate: prefill.unlockDate ?? "",
    expirationDate: prefill.expirationDate !== "—" ? (prefill.expirationDate ?? "") : "",
    message: prefill.message !== "—" ? (prefill.message ?? "") : "",
    isRecurring,
    frequency: prefill.recurring?.includes("weekly") ? "weekly" : "monthly",
    recurrenceCount: "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Gift created", { description: `${form.amount} ${form.asset} to ${form.recipient} [SIMULATED]` });
    onDone();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create programmable gift</DialogTitle>
          <DialogDescription>Pre-filled from your conversation. Review before sending.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5 sm:col-span-2"><Label>Recipient</Label><Input value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} /></div>
            <div className="grid gap-1.5"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="grid gap-1.5">
              <Label>Asset</Label>
              <Select value={form.asset} onValueChange={(v) => setForm((f) => ({ ...f, asset: v as AssetSymbol }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USDC", "XLM", "EURC"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Unlock date</Label><Input type="date" value={form.unlockDate} onChange={(e) => setForm((f) => ({ ...f, unlockDate: e.target.value }))} /></div>
            <div className="grid gap-1.5"><Label>Expiry (optional)</Label><Input type="date" value={form.expirationDate} onChange={(e) => setForm((f) => ({ ...f, expirationDate: e.target.value }))} /></div>
          </div>
          <div className="grid gap-1.5"><Label>Personal message (optional)</Label><Textarea rows={2} className="resize-none" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} /></div>
          <div className="flex items-center gap-3">
            <Switch id="rec-gift" checked={form.isRecurring} onCheckedChange={(v) => setForm((f) => ({ ...f, isRecurring: v }))} />
            <Label htmlFor="rec-gift">Recurring gift</Label>
          </div>
          {form.isRecurring && (
            <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-primary/30">
              <div className="grid gap-1.5">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="biweekly">Biweekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Times</Label><Input type="number" placeholder="e.g. 12" value={form.recurrenceCount} onChange={(e) => setForm((f) => ({ ...f, recurrenceCount: e.target.value }))} /></div>
            </div>
          )}
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            Demo mode — in live mode this creates a Soroban time-lock contract.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.recipient || !form.amount || !form.unlockDate}>
            {loading ? <RefreshCw className="animate-spin size-4" /> : <Gift className="size-4" />}
            Send gift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Automation creation modal — pre-filled from AI flow data */
function InlineAutomationModal({
  open, onOpenChange, prefill, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefill: Record<string, string>;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    name: prefill.name ?? "",
    amount: prefill.amount ?? "",
    asset: (prefill.asset ?? "USDC") as AssetSymbol,
    destination: prefill.destination ?? "",
    frequency: prefill.frequency ?? "Monthly",
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Automation created", { description: `${form.name} — ${form.amount} ${form.asset} [SIMULATED]` });
    onDone();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create money rule</DialogTitle>
          <DialogDescription>Pre-filled from your conversation. Review before activating.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-1.5"><Label>Rule name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Amount or %</Label><Input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="grid gap-1.5">
              <Label>Asset</Label>
              <Select value={form.asset} onValueChange={(v) => setForm((f) => ({ ...f, asset: v as AssetSymbol }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USDC", "XLM", "EURC"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5"><Label>Destination</Label><Input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} /></div>
          <div className="grid gap-1.5">
            <Label>Frequency</Label>
            <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["On every payment", "Daily", "Weekly", "Biweekly", "Monthly"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            Demo mode — no real transaction will be executed.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.name || !form.amount}>
            {loading ? <RefreshCw className="animate-spin size-4" /> : <Zap className="size-4" />}
            Activate rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Recurring payment modal — pre-filled from AI */
function InlineRecurringModal({
  open, onOpenChange, prefill, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefill: Record<string, string>;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    name: prefill.recipient ? `Payment to ${prefill.recipient}` : "",
    recipient: prefill.recipient ?? "",
    amount: prefill.amount ?? "",
    asset: (prefill.asset ?? "USDC") as AssetSymbol,
    frequency: (prefill.frequency ?? "Monthly").toLowerCase(),
    startDate: prefill.startDate ?? prefill.date ?? "",
    occurrences: prefill.occurrences !== "—" ? (prefill.occurrences ?? "") : "",
    memo: prefill.memo !== "—" ? (prefill.memo ?? "") : "",
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Recurring payment created", { description: `${form.amount} ${form.asset} to ${form.recipient} [SIMULATED]` });
    onDone();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create recurring payment</DialogTitle>
          <DialogDescription>Pre-filled from your conversation. Review before activating.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid gap-1.5"><Label>Payment name</Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
          <div className="grid gap-1.5"><Label>Recipient</Label><Input value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Amount</Label><Input type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
            <div className="grid gap-1.5">
              <Label>Asset</Label>
              <Select value={form.asset} onValueChange={(v) => setForm((f) => ({ ...f, asset: v as AssetSymbol }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USDC", "XLM", "EURC"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["daily", "weekly", "biweekly", "monthly", "quarterly"].map((f) => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} /></div>
          </div>
          <div className="grid gap-1.5"><Label>Memo (optional)</Label><Input value={form.memo} onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value }))} /></div>
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            Demo mode — no real transaction will be executed.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !form.recipient || !form.amount}>
            {loading ? <RefreshCw className="animate-spin size-4" /> : <Repeat className="size-4" />}
            Activate payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Salary distribution modal — pre-filled from AI */
function InlineSalaryModal({
  open, onOpenChange, prefill, onDone,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  prefill: Record<string, string>;
  onDone: () => void;
}) {
  const [form, setForm] = useState({
    salary: prefill.salary ?? "",
    asset: (prefill.asset ?? "USDC") as AssetSymbol,
    personal: prefill.personal ?? "60",
    savings: prefill.savings ?? "20",
    rent: prefill.rent ?? "10",
    family: prefill.family ?? "10",
  });
  const [loading, setLoading] = useState(false);
  const total = [form.personal, form.savings, form.rent, form.family].reduce((s, v) => s + Number(v), 0);

  const handleSave = async () => {
    if (total !== 100) { toast.error("Percentages must total 100%"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    toast.success("Salary distribution saved", { description: `${form.asset} ${form.salary}/month auto-distributed [SIMULATED]` });
    onDone();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Salary distribution</DialogTitle>
          <DialogDescription>Pre-filled from your conversation. Total must equal 100%.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Monthly salary</Label><Input type="number" value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} /></div>
            <div className="grid gap-1.5">
              <Label>Asset</Label>
              <Select value={form.asset} onValueChange={(v) => setForm((f) => ({ ...f, asset: v as AssetSymbol }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["USDC", "EURC", "XLM"].map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {[
            { label: "Personal %", key: "personal" as const },
            { label: "Savings %", key: "savings" as const },
            { label: "Rent %", key: "rent" as const },
            { label: "Family %", key: "family" as const },
          ].map(({ label, key }) => (
            <div key={key} className="flex items-center gap-4">
              <Label className="w-28 shrink-0">{label}</Label>
              <Input type="number" min={0} max={100} className="max-w-[100px]" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
              <span className="text-sm text-muted-foreground">
                → ${((Number(form.salary) * Number(form[key])) / 100).toFixed(0)}
              </span>
            </div>
          ))}
          <div className={`text-sm font-medium ${total === 100 ? "text-primary" : "text-destructive"}`}>
            Total: {total}% {total === 100 ? "✓" : `— needs ${100 - total}% more`}
          </div>
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-400">
            Demo mode — no real transaction will be executed.
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || total !== 100}>
            {loading ? <RefreshCw className="animate-spin size-4" /> : <CheckCircle2 className="size-4" />}
            Save distribution
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Confirmation card ─────────────────────────────────────────────────────────

function ConfirmCard({
  summary, title, question, onConfirm, onCancel,
}: {
  summary: Record<string, string>;
  title: string;
  question: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 rounded-md border border-border bg-background/80 p-4">
      <div className="space-y-1.5 mb-4">
        {Object.entries(summary).map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-4 text-sm">
            <span className="shrink-0 text-muted-foreground">{k}</span>
            <strong className="text-right">{v}</strong>
          </div>
        ))}
      </div>
      <p className="mb-3 text-sm">{question}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onConfirm}>
          <CheckCircle2 className="size-4" /> Yes, open the form
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          <X className="size-4" /> Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Chat message component ────────────────────────────────────────────────────

function ChatBubble({
  msg, flowState, onFlowInput, onConfirm, onCancel,
}: {
  msg: ChatMessage;
  flowState: FlowState | null;
  onFlowInput: (v: string) => void;
  onConfirm: (msg: ChatMessage) => void;
  onCancel: (msg: ChatMessage) => void;
}) {
  const isActiveStep = flowState?.activeMessageId === msg.id && !!msg.flowStep;
  const isActiveConfirm = !!msg.confirmation && !msg.confirmed && !msg.cancelled;

  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="message-user max-w-[80%]">
          <p>{msg.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="size-3.5 text-primary" />
      </div>
      <div className="max-w-[80%]">
        <div className="message-assistant">
          <p className="whitespace-pre-line">{msg.text}</p>

          {/* Active flow input */}
          {isActiveStep && msg.flowStep && (
            msg.flowStep.field.type === "chips"
              ? <ChipsInput options={msg.flowStep.field.options ?? []} onSelect={onFlowInput} />
              : <InlineInput field={msg.flowStep.field} onSubmit={onFlowInput} />
          )}

          {/* Confirmation card */}
          {isActiveConfirm && msg.confirmation && (
            <ConfirmCard
              summary={msg.confirmation.summary}
              title={msg.confirmation.flowTitle}
              question={msg.confirmation.confirmQuestion ?? "Confirm?"}
              onConfirm={() => onConfirm(msg)}
              onCancel={() => onCancel(msg)}
            />
          )}

          {msg.confirmed && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" /> Form opened
            </p>
          )}
          {msg.cancelled && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <X className="size-3.5" /> Cancelled
            </p>
          )}
        </div>
        <p className="mt-1 px-1 text-[10px] text-muted-foreground">
          {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm the Stellix AI Assistant.\n\nAsk me anything about your finances, or pick an action below — I'll guide you step by step and open the right form when you're ready.",
  ts: new Date(),
};

type ActiveModal =
  | { type: "invoice"; prefill: Record<string, string> }
  | { type: "send"; prefill: Record<string, string> }
  | { type: "gift"; prefill: Record<string, string> }
  | { type: "automation"; prefill: Record<string, string> }
  | { type: "recurring"; prefill: Record<string, string> }
  | { type: "salary"; prefill: Record<string, string> }
  | null;

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [flowState, setFlowState] = useState<FlowState | null>(null);
  const [freeInput, setFreeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("actions");
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendPrefill, setSendPrefill] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMsg = (msg: Omit<ChatMessage, "id" | "ts">): ChatMessage => {
    const m: ChatMessage = { ...msg, id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, ts: new Date() };
    setMessages((prev) => [...prev, m]);
    return m;
  };

  const updateMsg = (id: string, patch: Partial<ChatMessage>) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  // ── Start a flow ───────────────────────────────────────────────────────────
  const startFlow = (flowId: string) => {
    const flow = flows[flowId];
    if (!flow) return;
    addMsg({ role: "user", text: flow.title });
    const firstStep = flow.steps[0]!;
    const am = addMsg({ role: "assistant", text: firstStep.message, flowStep: firstStep, flowId });
    setFlowState({ flowId, stepIndex: 0, data: {}, activeMessageId: am.id });
    setSuggestionsOpen(false);
  };

  // ── Flow step answered ─────────────────────────────────────────────────────
  const handleFlowInput = (value: string) => {
    if (!flowState) return;
    const flow = flows[flowState.flowId];
    if (!flow) return;
    const step = flow.steps[flowState.stepIndex];
    if (!step) return;

    updateMsg(flowState.activeMessageId, { flowStep: undefined });
    addMsg({ role: "user", text: value });

    const newData = { ...flowState.data, [step.field.key]: value };
    const nextIdx = flowState.stepIndex + 1;

    if (nextIdx < flow.steps.length) {
      const nextStep = flow.steps[nextIdx]!;
      const am = addMsg({ role: "assistant", text: nextStep.message, flowStep: nextStep, flowId: flowState.flowId });
      setFlowState({ ...flowState, stepIndex: nextIdx, data: newData, activeMessageId: am.id });
    } else {
      // All steps done — show confirmation
      const summary = flow.buildConfirmSummary(newData);
      const am = addMsg({
        role: "assistant",
        text: "Here's a summary of what you've entered:",
        confirmation: {
          summary,
          flowTitle: flow.title,
          confirmQuestion: flow.confirmQuestion,
          data: newData,
          flowId: flowState.flowId,
        },
        flowId: flowState.flowId,
      });
      setFlowState({ ...flowState, stepIndex: nextIdx, data: newData, activeMessageId: am.id });
    }
  };

  // ── Confirm — open the modal, stay in chat ─────────────────────────────────
  const handleConfirm = (msg: ChatMessage) => {
    if (!msg.confirmation) return;
    const flow = flows[msg.confirmation.flowId];
    if (!flow) return;

    updateMsg(msg.id, { confirmed: true });
    setFlowState(null);

    const trigger = flow.modal(msg.confirmation.data);

    // Open the right modal directly in the page — no navigation
    if (trigger.type === "send") {
      setSendPrefill(trigger.prefill);
      setSendOpen(true);
    } else {
      setActiveModal(trigger);
    }
  };

  // ── Cancel flow ────────────────────────────────────────────────────────────
  const handleCancel = (msg: ChatMessage) => {
    updateMsg(msg.id, { cancelled: true });
    addMsg({ role: "assistant", text: "No problem — cancelled. What else can I help with?" });
    setFlowState(null);
  };

  // ── Informational question ─────────────────────────────────────────────────
  const askQuestion = async (text: string) => {
    if (loading) return;
    addMsg({ role: "user", text });
    setLoading(true);
    setSuggestionsOpen(false);
    const result = await assistantService.sendMessage(text);
    addMsg({ role: "assistant", text: result.content });
    setLoading(false);
  };

  // ── Chip click ─────────────────────────────────────────────────────────────
  const handleChip = (chip: ChipDef) => {
    if (typeof chip === "string") askQuestion(chip);
    else startFlow(chip.flowId);
  };

  // ── Free text ──────────────────────────────────────────────────────────────
  const handleFreeSubmit = () => {
    const text = freeInput.trim();
    if (!text || loading) return;
    setFreeInput("");

    const lower = text.toLowerCase();
    if (lower.includes("create invoice") || lower.includes("new invoice")) return startFlow("create_invoice");
    if (lower.includes("send money") || lower.includes("send ")) return startFlow("send_money");
    if (lower.includes("savings rule") || lower.includes("auto save")) return startFlow("create_savings_rule");
    if (lower.includes("recurring transfer")) return startFlow("recurring_transfer");
    if (lower.includes("create a gift") || lower.includes("send a gift") || lower.includes("programmable gift")) return startFlow("create_gift");
    if (lower.includes("schedule a payment") || lower.includes("schedule payment")) return startFlow("recurring_transfer");
    if (lower.includes("salary distribution") || lower.includes("split my salary")) return startFlow("set_salary_distribution");
    if (lower.includes("allowance")) return startFlow("create_allowance");

    askQuestion(text);
  };

  const activeCat = categories.find((c) => c.id === activeCategory);

  return (
    <div className="mx-auto flex max-w-4xl flex-col" style={{ height: "calc(100vh - 9rem)" }}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Assistant</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Ask questions or take action — forms open right here.</p>
        </div>
        <DemoBadge />
      </div>

      <div className="assistant-shell flex flex-1 flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-6">
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              msg={msg}
              flowState={flowState}
              onFlowInput={handleFlowInput}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}

          {loading && (
            <div className="flex justify-start gap-2">
              <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <div className="message-assistant flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                  <span className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {!flowState && (
          <div className="border-t border-border">
            <button
              className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setSuggestionsOpen((o) => !o)}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                Suggestions
              </span>
              {suggestionsOpen ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
            </button>

            {suggestionsOpen && (
              <div className="px-4 pb-3">
                <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        activeCategory === cat.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      <cat.icon className="size-3" />
                      {cat.label}
                    </button>
                  ))}
                </div>
                {activeCat && (
                  <div className="flex flex-wrap gap-2">
                    {activeCat.chips.map((chip) => {
                      const text = typeof chip === "string" ? chip : chip.text;
                      const isAction = typeof chip !== "string";
                      return (
                        <button
                          key={text}
                          onClick={() => handleChip(chip)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all hover:border-primary/60 ${
                            isAction
                              ? "border-primary/30 bg-primary/8 font-medium text-primary"
                              : "border-border bg-muted/60 text-foreground"
                          }`}
                        >
                          {isAction && <Zap className="size-3" />}
                          {text}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Input bar */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <Input
              value={freeInput}
              onChange={(e) => setFreeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFreeSubmit(); } }}
              placeholder={flowState ? "Answer the question above to continue…" : "Ask anything or describe an action…"}
              disabled={!!flowState || loading}
              className="flex-1"
            />
            <Button size="icon" className="size-10 shrink-0" onClick={handleFreeSubmit} disabled={!!flowState || loading || !freeInput.trim()}>
              <ArrowUp className="size-4" />
            </Button>
          </div>
          {flowState && (
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="size-3 text-primary" />
                Flow in progress — answer above to continue
              </span>
              <button className="text-destructive/70 hover:text-destructive" onClick={() => {
                if (flowState) {
                  const lastConfirmMsg = messages.findLast((m) => m.confirmation && !m.confirmed && !m.cancelled);
                  if (lastConfirmMsg) handleCancel(lastConfirmMsg);
                  else { addMsg({ role: "assistant", text: "Flow cancelled." }); setFlowState(null); }
                }
              }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Inline modals — triggered by AI, opened here, never navigate away ── */}

      <SendDialog
        open={sendOpen}
        onOpenChange={setSendOpen}
        initialDraft={sendPrefill.recipient ? {
          recipient: sendPrefill.recipient,
          amount: Number(sendPrefill.amount) || 0,
          asset: (sendPrefill.asset ?? "USDC") as AssetSymbol,
          fee: 0.00001,
          memo: sendPrefill.memo !== "—" ? sendPrefill.memo : undefined,
        } : undefined}
      />

      {activeModal?.type === "invoice" && (
        <InlineInvoiceModal
          open
          onOpenChange={(o) => !o && setActiveModal(null)}
          prefill={activeModal.prefill}
          onDone={() => addMsg({ role: "assistant", text: "Invoice created successfully! You can view and send it from the Invoices section." })}
        />
      )}

      {activeModal?.type === "gift" && (
        <InlineGiftModal
          open
          onOpenChange={(o) => !o && setActiveModal(null)}
          prefill={activeModal.prefill}
          onDone={() => addMsg({ role: "assistant", text: "Gift created and scheduled! You can track it in the Gifts section." })}
        />
      )}

      {activeModal?.type === "automation" && (
        <InlineAutomationModal
          open
          onOpenChange={(o) => !o && setActiveModal(null)}
          prefill={activeModal.prefill}
          onDone={() => addMsg({ role: "assistant", text: "Automation rule activated! You can manage it in the Automations section." })}
        />
      )}

      {activeModal?.type === "recurring" && (
        <InlineRecurringModal
          open
          onOpenChange={(o) => !o && setActiveModal(null)}
          prefill={activeModal.prefill}
          onDone={() => addMsg({ role: "assistant", text: "Recurring payment scheduled! You can manage it in Recurring Payments." })}
        />
      )}

      {activeModal?.type === "salary" && (
        <InlineSalaryModal
          open
          onOpenChange={(o) => !o && setActiveModal(null)}
          prefill={activeModal.prefill}
          onDone={() => addMsg({ role: "assistant", text: "Salary distribution saved! Your next payment will be auto-distributed. You can adjust it in the Salary section." })}
        />
      )}
    </div>
  );
}
