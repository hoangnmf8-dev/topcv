import Link from "next/link"
import { BarChart3, BriefcaseBusiness, Building2, LayoutDashboard, MessageCircle, ReceiptText, Search, UsersRound, X } from "lucide-react"

const items = [
  ["overview", "Tổng quan", LayoutDashboard],
  ["company", "Hồ sơ doanh nghiệp", Building2],
  ["jobs", "Tin tuyển dụng", BriefcaseBusiness],
  ["candidates", "Ứng viên · Mini ATS", UsersRound],
  ["talent", "Tìm hồ sơ công khai", Search],
  ["analytics", "Báo cáo tuyển dụng", BarChart3],
  ["billing", "Dịch vụ & thanh toán", ReceiptText],
] as const

export function EmployerMobileSidebar({ active, onChange, onClose }: { active: string; onChange: (id: string) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 lg:hidden">
    <button className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" onClick={onClose} aria-label="Đóng menu" />
    <aside className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] animate-in slide-in-from-left flex-col bg-white shadow-2xl duration-200">
      <div className="flex h-16 items-center justify-between bg-[#203246] px-4 text-white"><div><b className="text-lg">top<span className="text-[#24d276]">cv</span></b><p className="text-[11px] text-slate-300">Nhà tuyển dụng</p></div><button onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-white/10" aria-label="Đóng menu"><X className="size-5"/></button></div>
      <div className="border-b px-4 py-4"><p className="font-bold text-slate-800">Tài khoản doanh nghiệp</p><p className="mt-1 text-xs text-slate-500">Thông tin doanh nghiệp</p></div>
      <nav className="flex-1 overflow-y-auto p-3">{items.map(([id, label, Icon]) => <button key={id} onClick={() => onChange(id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${active === id ? "bg-[#e7f9ef] text-[#008f40]" : "text-slate-600 hover:bg-slate-50"}`}><Icon className="size-5 shrink-0"/>{label}</button>)}<Link href="/employer/messages" onClick={onClose} className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"><MessageCircle className="size-5 shrink-0"/>Tin nhắn</Link></nav>
      <p className="m-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">Quản lý tuyển dụng và hồ sơ ứng viên của doanh nghiệp.</p>
    </aside>
  </div>
}
