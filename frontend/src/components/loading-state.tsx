import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({message="Đang tải…",fullscreen=false,className}:{message?:string;fullscreen?:boolean;className?:string}) {
  return <div role="status" aria-live="polite" aria-busy="true" className={cn(
    "flex flex-col items-center justify-center gap-3 px-4 py-8 text-center text-sm text-slate-500",
    fullscreen ? "fixed inset-0 z-40 bg-slate-50" : "min-h-40 w-full",
    className,
  )}>
    <Loader2 aria-hidden="true" className="size-6 animate-spin text-emerald-600 motion-reduce:animate-none" />
    <p>{message}</p>
  </div>;
}
