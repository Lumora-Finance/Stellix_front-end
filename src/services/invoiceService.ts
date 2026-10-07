import { mockInvoices } from "@/data/mockInvoices";
import type { Invoice, InvoiceDraft } from "@/types";
const wait = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
let invoices = [...mockInvoices];
export const invoiceService = {
 async getInvoices(): Promise<Invoice[]> { await wait(); return invoices; },
 async getInvoice(id: string): Promise<Invoice | undefined> { await wait(180); return invoices.find((invoice) => invoice.id === id || invoice.number === id); },
 async createInvoice(draft: InvoiceDraft): Promise<Invoice> { await wait(700); const amount=draft.items.reduce((sum,item)=>sum+item.quantity*item.rate,0); const invoice:Invoice={...draft,id:`inv-${Date.now()}`,amount,status:"pending",createdAt:new Date().toISOString().slice(0,10),paymentLink:`stellix.finance/pay/${draft.number}`}; invoices=[invoice,...invoices]; return invoice; },
 async duplicateInvoice(id: string): Promise<Invoice | undefined> { const source=invoices.find((i)=>i.id===id); if(!source)return; await wait(); const copy={...source,id:`inv-${Date.now()}`,number:`${source.number}-COPY`,status:"draft" as const,createdAt:new Date().toISOString().slice(0,10)}; invoices=[copy,...invoices]; return copy; },
 async deleteInvoice(id: string): Promise<void> { await wait(); invoices=invoices.filter((i)=>i.id!==id); },
 async markPaid(id: string): Promise<Invoice | undefined> { await wait(); const invoice=invoices.find((i)=>i.id===id); if(invoice) invoice.status="paid"; return invoice; },
};
