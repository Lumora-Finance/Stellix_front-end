/**
 * Salary Service
 *
 * MODE: DEMO / SIMULATION
 * No real payments. Replace with Soroban / Stellar Horizon integration for live mode.
 */
import type { SalaryConfig, SalaryRecord, SalarySplitRule } from "@/types";
import { mockSalaryConfig, mockSalaryHistory } from "@/data/mockSalary";

const delay = (ms = 400) => new Promise<void>((r) => setTimeout(r, ms));

let salaryConfig: SalaryConfig = { ...mockSalaryConfig };
let salaryHistory: SalaryRecord[] = [...mockSalaryHistory];

export const salaryService = {
  async getConfig(): Promise<SalaryConfig> {
    await delay(250);
    return { ...salaryConfig };
  },

  async getHistory(): Promise<SalaryRecord[]> {
    await delay(300);
    return [...salaryHistory];
  },

  async updateConfig(updates: Partial<SalaryConfig>): Promise<SalaryConfig> {
    await delay(450);
    salaryConfig = { ...salaryConfig, ...updates };
    return { ...salaryConfig };
  },

  async updateDistributionRules(rules: SalarySplitRule[]): Promise<SalaryConfig> {
    await delay(500);
    const total = rules.reduce((s, r) => s + r.percentage, 0);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error(`Distribution rules must total 100%. Current total: ${total}%`);
    }
    salaryConfig = { ...salaryConfig, distributionRules: rules };
    return { ...salaryConfig };
  },

  async toggleAutoDistribute(enabled: boolean): Promise<SalaryConfig> {
    return salaryService.updateConfig({ autoDistribute: enabled });
  },
};
