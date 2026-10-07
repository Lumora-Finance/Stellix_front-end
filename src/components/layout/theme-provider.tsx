import { createContext,useContext,useEffect,useState,type ReactNode } from "react";
export type Theme="light"|"dark"|"system";
const ThemeContext=createContext<{theme:Theme;setTheme:(theme:Theme)=>void}>({theme:"system",setTheme:()=>{}});
export function ThemeProvider({children}:{children:ReactNode}){const [theme,setThemeState]=useState<Theme>("system");useEffect(()=>{const saved=localStorage.getItem("stellarflow-theme") as Theme|null;if(saved)setThemeState(saved)},[]);useEffect(()=>{const root=document.documentElement;const dark=theme==="dark"||(theme==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);root.classList.toggle("dark",dark);root.style.colorScheme=dark?"dark":"light";localStorage.setItem("stellarflow-theme",theme)},[theme]);return <ThemeContext.Provider value={{theme,setTheme:setThemeState}}>{children}</ThemeContext.Provider>}
export const useTheme=()=>useContext(ThemeContext);
