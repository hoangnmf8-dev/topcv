import type { LucideIcon } from "lucide-react"

export type MobileTabItem = {
  id: string
  label: string
  icon: LucideIcon
  href?: string
}

export function MobileTabBar({ items, active, onChange }: { items: MobileTabItem[]; active: string; onChange: (id: string) => void }) {
  return <nav className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom-4 border-t border-slate-200 bg-white/95 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_24px_rgba(15,23,42,0.10)] backdrop-blur duration-200 lg:hidden" aria-label="Thanh điều hướng nhanh">
    <div className="mx-auto grid max-w-lg grid-cols-5">
      {items.map(({ id, label, icon: Icon, href }) => href
        ? <a key={id} href={href} className="flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold text-slate-500"><Icon className="size-5"/><span className="w-full truncate text-center">{label}</span></a>
        : <button key={id} onClick={() => onChange(id)} className={`flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-semibold transition ${active === id ? "bg-[#e7f9ef] text-[#008f40]" : "text-slate-500"}`} aria-current={active === id ? "page" : undefined}><Icon className="size-5"/><span className="w-full truncate text-center">{label}</span></button>)}
    </div>
  </nav>
}
