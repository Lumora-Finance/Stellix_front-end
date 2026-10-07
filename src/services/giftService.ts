/**
 * Gift Service
 *
 * MODE: DEMO / SIMULATION
 * No blockchain transactions are executed.
 * In live mode, gift creation would call a Soroban smart contract
 * that time-locks USDC until the unlock date.
 */
import type { Gift } from "@/types";
import { mockGifts } from "@/data/mockGifts";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

let gifts: Gift[] = [...mockGifts];

export const giftService = {
  async list(): Promise<Gift[]> {
    await delay(300);
    return [...gifts];
  },

  async getSent(): Promise<Gift[]> {
    await delay(250);
    return gifts.filter((g) => g.direction === "sent");
  },

  async getReceived(): Promise<Gift[]> {
    await delay(250);
    return gifts.filter((g) => g.direction === "received");
  },

  async create(gift: Omit<Gift, "id" | "createdAt" | "executedCount">): Promise<Gift> {
    await delay(600);
    const newGift: Gift = {
      ...gift,
      id: `gift-${Date.now()}`,
      createdAt: new Date().toISOString(),
      executedCount: 0,
    };
    gifts = [newGift, ...gifts];
    return newGift;
  },

  async update(id: string, updates: Partial<Gift>): Promise<Gift> {
    await delay(400);
    gifts = gifts.map((g) => (g.id === id ? { ...g, ...updates } : g));
    const updated = gifts.find((g) => g.id === id);
    if (!updated) throw new Error("Gift not found");
    return updated;
  },

  async cancel(id: string): Promise<Gift> {
    return giftService.update(id, { status: "cancelled" });
  },

  /** Simulates claiming a gift (demo only) */
  async claim(id: string): Promise<Gift> {
    await delay(700);
    const gift = gifts.find((g) => g.id === id);
    if (!gift) throw new Error("Gift not found");
    if (gift.status !== "available") throw new Error("Gift is not available to claim");
    return giftService.update(id, {
      status: "claimed",
      claimedAt: new Date().toISOString(),
      txHash: `sim-${Math.random().toString(36).slice(2, 10)}`,
    });
  },
};
