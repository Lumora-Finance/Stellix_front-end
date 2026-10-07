import { createFileRoute,Link } from "@tanstack/react-router";
import { ArrowLeft,Check,ReceiptText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { PageIntro,EmptyState } from "@/components/shared/common";
import { mockInvoices } from "@/data/mockInvoices";
export const Route=createFileRoute("/invoices/$id")({head:({params})=>({meta:[{title:`Invoice ${params.id} — StellarFlow`},{name:"description",content:"Review a StellarFlow payment invoice and payment status."},{property:"og:title",content:`Invoice — StellarFlow`},{property:"og:description",content:"Review a StellarFlow payment invoice and payment status."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:InvoiceDetailPage});
function InvoiceDetailPage(){const {id}=Route.useParams();const found=mockInvoices.find(i=>i.id===id||i.number===id);const [paid,setPaid]=useState(false);if(!found)return <EmptyState icon={ReceiptText} title="Invoice not found" description="This invoice may have been removed or the link is incorrect." action={<Button asChild><Link to="/invoices">Back to invoices</Link></Button>}/>;const invoice={...found,status:paid?"paid" as const:found.status};return <div className="space-y-7"><PageIntro title={invoice.number} description={`${invoice.clientName} · ${invoice.title}`} action={<div className="flex gap-2"><Button variant="outline" asChild><Link to="/invoices"><ArrowLeft/>Back</Link></Button>{invoice.status!=="paid"&&<Button onClick={()=>{setPaid(true);toast.success("Invoice marked as paid",{description:"Demo state only."})}}><Check/>Mark as paid</Button>}</div>}/><InvoicePreview invoice={invoice}/></div>}
