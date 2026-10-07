import { createFileRoute } from "@tanstack/react-router";
import { PageIntro } from "@/components/shared/common";
import { Reveal } from "@/components/shared/motion";
import { InvoiceForm } from "@/components/invoices/invoice-form";
export const Route=createFileRoute("/invoices/new")({head:()=>({meta:[{title:"Create Invoice — Stellix"},{name:"description",content:"Create a professional Stellar payment invoice."},{property:"og:title",content:"Create Invoice — Stellix"},{property:"og:description",content:"Create a professional Stellar payment invoice."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary_large_image"}]}),component:NewInvoicePage});
function NewInvoicePage(){return <div className="space-y-7"><Reveal><PageIntro title="Create invoice" description="Build a clear payment request for your client."/></Reveal><Reveal delay={50}><InvoiceForm/></Reveal></div>}
