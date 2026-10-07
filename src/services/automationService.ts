/**
 * Automation Service
 *
 * MODE: DEMO / SIMULATION
 * All operations are local mock data mutations. No Stellar transactions are executed.
 * Replace the internals of each method with Soroban contract calls for live mode.
 */
import type { AutomationRule, AutomationExecution } from "@/types";
import { mockAutomations, mockAutomationExecutions } from "@/data/mockAutomations";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

// Local state (in-memory for demo)
let automations: AutomationRule[] = [...mockAutomations];
let executions: AutomationExecution[] = [...mockAutomationExecutions];

export const automationService = {
  /** Returns all automation rules */
  async list(): Promise<AutomationRule[]> {
    await delay(300);
    return [...automations];
  },

  /** Returns executions for a specific automation */
  async getExecutions(automationId: string): Promise<AutomationExecution[]> {
    await delay(200);
    return executions.filter((e) => e.automationId === automationId);
  },

  /** Creates a new automation rule */
  async create(rule: Omit<AutomationRule, "id" | "createdAt" | "executedCount">): Promise<AutomationRule> {
    await delay(500);
    const newRule: AutomationRule = {
      ...rule,
      id: `auto-${Date.now()}`,
      createdAt: new Date().toISOString(),
      executedCount: 0,
    };
    automations = [newRule, ...automations];
    return newRule;
  },

  /** Updates an existing automation */
  async update(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    await delay(400);
    automations = automations.map((a) => (a.id === id ? { ...a, ...updates } : a));
    const updated = automations.find((a) => a.id === id);
    if (!updated) throw new Error("Automation not found");
    return updated;
  },

  /** Pauses an active automation */
  async pause(id: string): Promise<AutomationRule> {
    return automationService.update(id, { status: "paused" });
  },

  /** Resumes a paused automation */
  async resume(id: string): Promise<AutomationRule> {
    return automationService.update(id, { status: "active" });
  },

  /** Cancels an automation permanently */
  async cancel(id: string): Promise<AutomationRule> {
    return automationService.update(id, { status: "cancelled" });
  },

  /** Simulates executing an automation (demo only) */
  async simulateExecution(id: string): Promise<AutomationExecution> {
    await delay(700);
    const rule = automations.find((a) => a.id === id);
    if (!rule) throw new Error("Automation not found");
    const exec: AutomationExecution = {
      id: `exec-${Date.now()}`,
      automationId: id,
      executedAt: new Date().toISOString(),
      amount: rule.amount,
      asset: rule.asset,
      status: "success",
      txHash: `sim-${Math.random().toString(36).slice(2, 10)}`,
      note: "[SIMULATED] Demo execution — no real transaction",
    };
    executions = [exec, ...executions];
    automations = automations.map((a) =>
      a.id === id
        ? { ...a, executedCount: a.executedCount + 1, lastExecution: exec.executedAt }
        : a
    );
    return exec;
  },
};
