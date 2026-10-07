import { mockAnalytics } from "@/data/mockAnalytics";
import { mockInvoices } from "@/data/mockInvoices";
import { mockTransactions } from "@/data/mockTransactions";
import { mockWallet } from "@/data/mockWallet";
import type { AssistantMessage, TransactionDraft } from "@/types";
const response=(content:string,draft?:TransactionDraft):AssistantMessage=>({id:`assistant-${Date.now()}`,role:"assistant",content,createdAt:new Date().toISOString(),...(draft?{draft}:{})});
export const assistantService={ async sendMessage(text:string):Promise<AssistantMessage>{ await new Promise((r)=>setTimeout(r,650)); const q=text.toLowerCase();
 if(q.includes("send")&&q.match(/\d+/)){ const amount=Number(q.match(/\d+(?:\.\d+)?/)?.[0]??0); const asset=q.includes("xlm")?"XLM":"USDC"; return response("I created a demo transaction draft. I will never send assets automatically—review the recipient, amount, and fee in the wallet before confirming.",{recipient:"Recipient address required",amount,asset,fee:0.00001}); }
 if(q.includes("spend")) return response(`You spent $${mockAnalytics.expenses.toLocaleString()} this month across ${mockTransactions.filter(t=>t.type==="outgoing"||t.type==="payment").length} outgoing payments. Your largest expense was 680 USDC to Northstar Labs.`);
 if(q.includes("largest")) return response("Your largest recent transaction was an incoming 2,450 USDC payment from Acme Studio, followed by 1,850 USDC from Frame & Form.");
 if(q.includes("unpaid")||q.includes("invoice")) { const open=mockInvoices.filter(i=>i.status==="pending"||i.status==="overdue"); return response(`You have ${open.length} unpaid invoices totaling ${open.reduce((s,i)=>s+i.amount,0).toLocaleString()} across USDC and EURC. INV-102 is overdue.`); }
 if(q.includes("usdc")||q.includes("balance")) return response(`Your wallet holds ${mockWallet.assets.find(a=>a.symbol==="USDC")?.balance.toLocaleString(undefined,{minimumFractionDigits:2})??"0.00"} USDC, representing ${mockWallet.assets.find(a=>a.symbol==="USDC")?.allocation??0}% of your $${mockWallet.totalBalance.toLocaleString()} portfolio.`);
 return response(`This month you received $${mockAnalytics.income.toLocaleString()} and spent $${mockAnalytics.expenses.toLocaleString()}, for a net flow of $${mockAnalytics.netFlow.toLocaleString()}. USDC remains your primary asset.`); } };
