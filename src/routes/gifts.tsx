import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Clock,
  Gift,
  Inbox,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  XCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PageIntro, DemoBadge, EmptyState, currency } from "@/components/shared/common";
import { Reveal } from "@/components/shared/motion";
import { mockGifts } from "@/data/mockGifts";
import type { Gift as GiftType } from "@/types";

export const Route = createFileRoute("/gifts")({
  head: () => ({
    meta: [
      { title: "Gifts — Stellix" },
      { name: "description", content: "Send and manage programmable USDC gifts on Stellar." },
    ],
  }),
  component: GiftsPage,
});

const statusConfig: Record<string, { label: string; classes: string }> = {
  scheduled: { label: "Scheduled", classes: "bg-blue-50 text-blue-700 border-blue-200" },
  available: { label: "Available", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  claimed: { label: "Claimed", classes: "bg-secondary text-primary border-border" },
  expired: { label: "Expired", classes: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", classes: "bg-destructive/10 text-destructive border-destructive/20" },
};

function GiftStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.scheduled!;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-600 ${cfg.classes}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}

function GiftCard({
  gift,
  onCancel,
  onClaim,
}: {
  gift: GiftType;
  onCancel: (id: string) => void;
  onClaim: (id: string) => void;
}) {
  const canCancel = ["scheduled", "available"].includes(gift.status) && gift.direction === "sent";
  const canClaim = gift.status === "available" && gift.direction === "received";

  return (
    <div className="panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="action-icon mt-0.5 shrink-0">
            <Gift />
          </span>
          <div>
            <p className="font-semibold">
              {gift.direction === "sent" ? `To ${gift.recipient}` : `From ${gift.sender}`}
            </p>
            {gift.message && (
              <p className="mt-1 max-w-md text-sm italic text-muted-foreground">"{gift.message}"</p>
            )}
          </div>
        </div>
        <GiftStatusBadge status={gift.status} />
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Amount</p>
          <p className="mt-1 font-mono font-semibold text-primary">
            {currency(gift.amount)} {gift.asset}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Unlock date</p>
          <p className="mt-1 font-medium">{new Date(gift.unlockDate).toLocaleDateString()}</p>
        </div>
        {gift.expirationDate && (
          <div>
            <p className="text-xs text-muted-foreground">Expires</p>
            <p className="mt-1 font-medium">{new Date(gift.expirationDate).toLocaleDateString()}</p>
          </div>
        )}
        {gift.isRecurring && (
          <div>
            <p className="text-xs text-muted-foreground">Recurrence</p>
            <p className="mt-1 font-medium capitalize">
              {gift.recurrenceFrequency} · {gift.executedCount}/{gift.recurrenceCount}
            </p>
          </div>
        )}
        {gift.claimedAt && (
          <div>
            <p className="text-xs text-muted-foreground">Claimed</p>
            <p className="mt-1 font-medium">{new Date(gift.claimedAt).toLocaleDateString()}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="mt-1 font-medium">{new Date(gift.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {(canCancel || canClaim) && (
        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          {canClaim && (
            <Button size="sm" onClick={() => onClaim(gift.id)}>
              <CheckCircle2 className="size-4" />
              Claim gift
            </Button>
          )}
          {canCancel && (
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onCancel(gift.id)}>
              <CircleOff className="size-4" />
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

type CreateGiftForm = {
  recipient: string;
  recipientAddress: string;
  amount: string;
  asset: "USDC" | "XLM" | "EURC";
  message: string;
  unlockDate: string;
  expirationDate: string;
  isRecurring: boolean;
  recurrenceCount: string;
  recurrenceFrequency: "weekly" | "monthly" | "biweekly";
};

const defaultForm: CreateGiftForm = {
  recipient: "",
  recipientAddress: "",
  amount: "",
  asset: "USDC",
  message: "",
  unlockDate: new Date().toISOString().split("T")[0]!,
  expirationDate: "",
  isRecurring: false,
  recurrenceCount: "",
  recurrenceFrequency: "weekly",
};

function CreateGiftDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (g: GiftType) => void }) {
  const [form, setForm] = useState<CreateGiftForm>(defaultForm);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof CreateGiftForm>(k: K, v: CreateGiftForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const newGift: GiftType = {
      id: `gift-${Date.now()}`,
      direction: "sent",
      recipient: form.recipient,
      recipientAddress: form.recipientAddress || undefined,
      sender: "Clement",
      senderAddress: "GDKQ4AVP7DNTJOFMBWLU5P3K4XQZW7TMMFXGQDGVXHLVLQOQX2JCFLOW",
      amount: Number(form.amount),
      asset: form.asset,
      message: form.message || undefined,
      unlockDate: form.unlockDate,
      expirationDate: form.expirationDate || undefined,
      isRecurring: form.isRecurring,
      recurrenceCount: form.isRecurring ? Number(form.recurrenceCount) : undefined,
      recurrenceFrequency: form.isRecurring ? form.recurrenceFrequency : undefined,
      executedCount: 0,
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };
    setLoading(false);
    onCreated(newGift);
    onOpenChange(false);
    setForm(defaultForm);
    setStep("form");
    toast.success("Gift created", { description: `${currency(newGift.amount)} ${newGift.asset} scheduled for ${newGift.recipient}. [SIMULATED]` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "form" ? "Send a programmable gift" : "Confirm gift"}</DialogTitle>
          <DialogDescription>
            {step === "form" ? "Set the amount, recipient, and unlock conditions." : "Review your gift details before sending."}
          </DialogDescription>
        </DialogHeader>

        {step === "form" ? (
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label>Recipient name</Label>
              <Input placeholder="e.g. Mom, Alex, Team" value={form.recipient} onChange={(e) => set("recipient", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Recipient address (optional)</Label>
              <Input placeholder="Stellar wallet address" value={form.recipientAddress} onChange={(e) => set("recipientAddress", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input type="number" placeholder="e.g. 100" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Asset</Label>
                <Select value={form.asset} onValueChange={(v) => set("asset", v as CreateGiftForm["asset"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="XLM">XLM</SelectItem>
                    <SelectItem value="EURC">EURC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Message (optional)</Label>
              <Textarea placeholder="Add a personal note…" value={form.message} onChange={(e) => set("message", e.target.value)} className="resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Unlock date</Label>
                <Input type="date" value={form.unlockDate} onChange={(e) => set("unlockDate", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Expiration (optional)</Label>
                <Input type="date" value={form.expirationDate} onChange={(e) => set("expirationDate", e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isRecurring} onCheckedChange={(v) => set("isRecurring", v)} id="recurring-gift" />
              <Label htmlFor="recurring-gift">Recurring gift</Label>
            </div>
            {form.isRecurring && (
              <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-primary/30">
                <div className="grid gap-2">
                  <Label>Frequency</Label>
                  <Select value={form.recurrenceFrequency} onValueChange={(v) => set("recurrenceFrequency", v as CreateGiftForm["recurrenceFrequency"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Number of times</Label>
                  <Input type="number" placeholder="e.g. 12" value={form.recurrenceCount} onChange={(e) => set("recurrenceCount", e.target.value)} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="insight">
              <p className="text-xs font-600 uppercase tracking-wide text-muted-foreground">SIMULATED — Demo mode</p>
              <p className="mt-1 text-sm">No real Stellar transaction will occur. Gifts in live mode use Soroban time-lock contracts.</p>
            </div>
            <div className="detail-list">
              {[
                ["To", form.recipient],
                ["Amount", `${currency(Number(form.amount))} ${form.asset}`],
                ["Unlock date", form.unlockDate],
                ...(form.expirationDate ? [["Expires", form.expirationDate] as [string, string]] : []),
                ...(form.isRecurring ? [["Recurrence", `${form.recurrenceFrequency} × ${form.recurrenceCount}`] as [string, string]] : []),
                ...(form.message ? [["Message", form.message] as [string, string]] : []),
                ["Network", "Stellar (Demo)"],
              ].map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "form" ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={() => setStep("confirm")} disabled={!form.recipient || !form.amount || !form.unlockDate}>Review gift</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep("form")}>Back</Button>
              <Button onClick={handleConfirm} disabled={loading}>
                {loading ? <RefreshCw className="animate-spin" /> : <Gift />}
                Send gift
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GiftsPage() {
  const [gifts, setGifts] = useState<GiftType[]>(mockGifts);
  const [createOpen, setCreateOpen] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const sent = gifts.filter((g) => g.direction === "sent");
  const received = gifts.filter((g) => g.direction === "received");
  const claimable = gifts.filter((g) => g.direction === "received" && g.status === "available");

  const handleCancel = () => {
    if (!cancelId) return;
    setGifts((gs) => gs.map((g) => (g.id === cancelId ? { ...g, status: "cancelled" as const } : g)));
    setCancelId(null);
    toast("Gift cancelled", { description: "The gift has been cancelled and funds returned." });
  };

  const handleClaim = (id: string) => {
    setGifts((gs) => gs.map((g) => (g.id === id ? { ...g, status: "claimed" as const, claimedAt: new Date().toISOString() } : g)));
    toast.success("Gift claimed! [SIMULATED]", { description: "Funds added to your wallet." });
  };

  const handleCreated = (gift: GiftType) => setGifts((gs) => [gift, ...gs]);

  return (
    <div className="space-y-8">
      <Reveal>
        <PageIntro
          title="Gifts"
          description="Send programmable USDC gifts — time-locked, recurring, or one-time."
          action={<DemoBadge />}
        />
      </Reveal>

      {/* Stats */}
      <Reveal delay={40}>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Gifts sent", value: sent.length, icon: Send },
            { label: "Gifts received", value: received.length, icon: Inbox },
            { label: "Claimable now", value: claimable.length, icon: CheckCircle2 },
            { label: "Total gifted", value: currency(sent.reduce((s, g) => s + g.amount, 0)), icon: Sparkles },
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

      {/* Claimable banner */}
      {claimable.length > 0 && (
        <Reveal delay={60}>
          <div className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                You have {claimable.length} gift{claimable.length > 1 ? "s" : ""} available to claim
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-500">
                {claimable.map((g) => `${currency(g.amount)} ${g.asset} from ${g.sender}`).join(" · ")}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {/* Action */}
      <Reveal delay={70}>
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Send a gift
          </Button>
        </div>
      </Reveal>

      {/* Tabs */}
      <Reveal delay={80}>
        <Tabs defaultValue="sent">
          <TabsList className="mb-6">
            <TabsTrigger value="sent">
              <Send className="size-4" />
              Sent ({sent.length})
            </TabsTrigger>
            <TabsTrigger value="received">
              <Inbox className="size-4" />
              Received ({received.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <CalendarDays className="size-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="expired">
              <XCircle className="size-4" />
              Expired
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sent">
            <div className="space-y-4">
              {sent.length === 0 ? (
                <EmptyState icon={Gift} title="No gifts sent" description="Create your first programmable gift." action={<Button onClick={() => setCreateOpen(true)}><Plus />Send a gift</Button>} />
              ) : (
                sent.map((g) => <GiftCard key={g.id} gift={g} onCancel={(id) => setCancelId(id)} onClaim={handleClaim} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="received">
            <div className="space-y-4">
              {received.length === 0 ? (
                <EmptyState icon={Inbox} title="No gifts received" description="You haven't received any programmable gifts yet." />
              ) : (
                received.map((g) => <GiftCard key={g.id} gift={g} onCancel={(id) => setCancelId(id)} onClaim={handleClaim} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="upcoming">
            <div className="space-y-4">
              {gifts.filter((g) => g.status === "scheduled").length === 0 ? (
                <EmptyState icon={Clock} title="No upcoming gifts" description="All scheduled gifts will appear here." />
              ) : (
                gifts
                  .filter((g) => g.status === "scheduled")
                  .map((g) => <GiftCard key={g.id} gift={g} onCancel={(id) => setCancelId(id)} onClaim={handleClaim} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="expired">
            <div className="space-y-4">
              {gifts.filter((g) => g.status === "expired").length === 0 ? (
                <EmptyState icon={XCircle} title="No expired gifts" description="Unclaimed gifts past their expiration date appear here." />
              ) : (
                gifts
                  .filter((g) => g.status === "expired")
                  .map((g) => <GiftCard key={g.id} gift={g} onCancel={(id) => setCancelId(id)} onClaim={handleClaim} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Reveal>

      <CreateGiftDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />

      <AlertDialog open={!!cancelId} onOpenChange={(o) => !o && setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this gift?</AlertDialogTitle>
            <AlertDialogDescription>The gift will be cancelled and the recipient won't be able to claim it. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Cancel gift</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
