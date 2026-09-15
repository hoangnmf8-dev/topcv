import Link from "next/link"
import { ClipboardList, CreditCard, FileText, Heart, LayoutDashboard, PackageCheck, ReceiptText, ShieldCheck, UserRound, X } from "lucide-react"

const items = [
  ["overview", "Tổng quan", LayoutDashboard], ["profile", "Hồ sơ & CV", UserRound],
  ["applications", "Việc đã ứng tuyển", ClipboardList], ["saved", "Việc đã lưu", Heart],
  ["services", "TopCV Pro", PackageCheck], ["orders", "Đơn hàng", ReceiptText],
  ["payments", "Thanh toán", CreditCard], ["security", "Cá nhân & bảo mật", ShieldCheck],
] as const

export function CandidateMobileSidebar({ active, onChange, onClose }: { active: string; onChange: (id: string) => void; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" onClick={onClose} aria-label="Đóng menu"/><aside className="absolute inset-y-0 left-0 flex w-[min(84vw,320px)] animate-in slide-in-from-left flex-col bg-white shadow-2xl duration-200"><div className="flex h-[76px] items-center justify-between bg-[#087b43] px-4 text-white"><div><b className="text-xl">top<span className="text-[#41e48d]">cv</span></b><p className="text-[11px] text-emerald-100">Không gian ứng viên</p></div><button onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-white/10" aria-label="Đóng menu"><X className="size-5"/></button></div><div className="border-b px-4 py-4"><p className="font-bold">Nguyễn Văn A</p><p className="mt-1 text-xs text-slate-500">Hồ sơ hoàn thiện 80%</p></div><nav className="flex-1 overflow-y-auto p-3">{items.map(([id,label,Icon])=><button key={id} onClick={()=>onChange(id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${active===id?"bg-[#e7f9ef] text-[#008f40]":"text-slate-600 hover:bg-slate-50"}`}><Icon className="size-5 shrink-0"/>{label}</button>)}</nav><Link href="/cv-builder" className="m-4 flex items-center justify-center gap-2 rounded-xl bg-[#00b14f] px-4 py-3 text-sm font-bold text-white"><FileText className="size-4"/>Tạo CV mới</Link></aside></div>
}
