/**
 * Recurring Payments Service
 *
 * MODE: DEMO / SIMULATION
 */
import type { RecurringPayment } from "@/types";
import { mockRecurringPayments } from "@/data/mockRecurringPayments";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

let payments: RecurringPayment[] = [...mockRecurringPayments];

export const recurringPaymentService = {
  async list(): Promise<RecurringPayment[]> {
    await delay(300);
    return [...payments];
  },

  async create(payment: Omit<RecurringPayment, "id" | "createdAt" | "paidCount">): Promise<RecurringPayment> {
    await delay(500);
    const newPayment: RecurringPayment = {
      ...payment,
      id: `rp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      paidCount: 0,
    };
    payments = [newPayment, ...payments];
    return newPayment;
  },

  async update(id: string, updates: Partial<RecurringPayment>): Promise<RecurringPayment> {
    await delay(400);
    payments = payments.map((p) => (p.id === id ? { ...p, ...updates } : p));
    const updated = payments.find((p) => p.id === id);
    if (!updated) throw new Error("Recurring payment not found");
    return updated;
  },

  async pause(id: string): Promise<RecurringPayment> {
    return recurringPaymentService.update(id, { status: "paused" });
  },

  async resume(id: string): Promise<RecurringPayment> {
    return recurringPaymentService.update(id, { status: "active" });
  },

  async cancel(id: string): Promise<RecurringPayment> {
    return recurringPaymentService.update(id, { status: "cancelled" });
  },
};
