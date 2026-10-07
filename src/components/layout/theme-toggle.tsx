import { Monitor,Moon,Sun } from "lucide-react";
import { useTheme,type Theme } from "./theme-provider";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip,TooltipContent,TooltipTrigger } from "@/components/ui/tooltip";
const options:{value:Theme;label:string;icon:typeof Sun}[]=[{value:"light",label:"Light",icon:Sun},{value:"dark",label:"Dark",icon:Moon},{value:"system",label:"System",icon:Monitor}];
export function ThemeToggle(){const {theme,setTheme}=useTheme();const Icon=options.find(o=>o.value===theme)?.icon??Monitor;return <DropdownMenu><Tooltip><TooltipTrigger asChild><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Change appearance"><Icon className="theme-icon"/></Button></DropdownMenuTrigger></TooltipTrigger><TooltipContent>Change appearance</TooltipContent></Tooltip><DropdownMenuContent align="end">{options.map(({value,label,icon:ItemIcon})=><DropdownMenuItem key={value} onClick={()=>setTheme(value)} className={theme===value?"text-primary":""}><ItemIcon/>{label}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>}
