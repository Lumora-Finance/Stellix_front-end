import { CircleAlert,CircleCheck,Clock3,LoaderCircle,FileText } from "lucide-react";
import type { InvoiceStatus,TransactionStatus } from "@/types";
import { cn } from "@/lib/utils";
export function TransactionStatusBadge({status}:{status:TransactionStatus}){const Icon=status==="confirmed"?CircleCheck:status==="pending"?LoaderCircle:CircleAlert;return <span className={cn("status",status==="confirmed"&&"status-strong")}><Icon className={cn("size-3.5",status==="pending"&&"animate-spin")}/>{status}</span>}
export function InvoiceStatusBadge({status}:{status:InvoiceStatus}){const Icon=status==="paid"?CircleCheck:status==="draft"?FileText:status==="pending"?Clock3:CircleAlert;return <span className={cn("status",status==="paid"&&"status-strong")}><Icon className="size-3.5"/>{status}</span>}
