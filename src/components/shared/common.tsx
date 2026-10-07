import type { LucideIcon } from "lucide-react";
import { CircleAlert, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip,TooltipContent,TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
export function IconButton({label,children,onClick,className}:{label:string;children:React.ReactNode;onClick?:()=>void;className?:string}){return <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label={label} onClick={onClick} className={cn("min-h-11 min-w-11",className)}>{children}</Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>}
export function PageIntro({title,description,action}:{title:string;description:string;action?:React.ReactNode}){return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold md:text-3xl">{title}</h1><p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p></div>{action}</div>}
export function EmptyState({icon:Icon,title,description,action}:{icon:LucideIcon;title:string;description:string;action?:React.ReactNode}){return <div className="flex min-h-64 flex-col items-center justify-center border border-dashed border-border p-8 text-center"><Icon className="mb-4 size-10 text-primary"/><h3 className="font-semibold">{title}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>{action&&<div className="mt-5">{action}</div>}</div>}
export function ErrorState({retry}:{retry?:()=>void}){return <div className="flex min-h-52 flex-col items-center justify-center border border-border p-8 text-center"><CircleAlert className="mb-3 size-9 text-primary"/><h3 className="font-semibold">Something needs attention</h3><p className="mt-1 text-sm text-muted-foreground">The demo data could not be loaded.</p>{retry&&<Button className="mt-4" variant="outline" onClick={retry}><RefreshCw/>Try again</Button>}</div>}
export function LoadingState({rows=3}:{rows?:number}){return <div className="space-y-3">{Array.from({length:rows}).map((_,i)=><Skeleton key={i} className="h-20 w-full"/>)}</div>}
export function DemoBadge(){return <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">Demo data</span>}
export function shorten(value:string,start=6,end=5){return value.length>start+end?`${value.slice(0,start)}…${value.slice(-end)}`:value}
export function currency(value:number,asset?:string){return `${new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value)}${asset&&asset!=="USDC"?` ${asset}`:""}`}
