import { mockAnalytics } from "@/data/mockAnalytics";
import type { Analytics } from "@/types";
export const analyticsService = { async getAnalytics(_period="30D"):Promise<Analytics>{ await new Promise((r)=>setTimeout(r,300)); return mockAnalytics; } };
