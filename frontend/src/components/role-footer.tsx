import Link from "next/link"
import { BriefcaseBusiness, Building2, FileText, Headphones, LayoutDashboard, LockKeyhole, MessageCircle, ShieldCheck } from "lucide-react"

type RoleFooterProps = { variant: "candidate" | "employer" | "admin" | "minimal" }

const candidateLinks = [
  ["Tổng quan", "/candidate"],
  ["Việc làm phù hợp", "/#jobs"],
  ["Quản lý CV", "/candidate"],
  ["Tính lương Gross – Net", "/discover/gross-net"],
  ["Tra cứu mức lương", "/discover/salary-lookup"],
  ["Tin nhắn", "/messages"],
]

const employerLinks = [
  ["Tổng quan", "/employer"],
  ["Quản lý tin", "/employer?tab=jobs"],
  ["Ứng viên", "/employer?tab=candidates"],
  ["Gói dịch vụ", "/employer/services"],
  ["Tin nhắn", "/employer/messages"],
]

export function RoleFooter({ variant }: RoleFooterProps) {
  if (variant === "minimal") return <footer className="border-t border-slate-200 bg-white px-4 py-5 text-xs text-slate-500"><div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left"><p>© 2026 TopCV Việt Nam. Bảo mật tài khoản và dữ liệu người dùng.</p><div className="flex flex-wrap justify-center gap-x-5 gap-y-2"><Link href="/career-guide#privacy" className="hover:text-emerald-700">Chính sách bảo mật</Link><Link href="/career-guide#terms" className="hover:text-emerald-700">Điều khoản sử dụng</Link><Link href="/career-guide#help" className="hover:text-emerald-700">Trung tâm trợ giúp</Link></div></div></footer>

  if (variant === "admin") return <footer className="border-t border-slate-800 bg-slate-950 px-4 py-5 text-slate-400"><div className="mx-auto flex max-w-[1280px] flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400"><ShieldCheck className="size-4"/></span><div><b className="text-slate-200">TopCV Admin Console</b><p className="mt-0.5">Khu vực vận hành nội bộ · Mọi thao tác được ghi nhật ký</p></div></div><div className="flex flex-wrap gap-x-5 gap-y-2"><span className="inline-flex items-center gap-1.5 text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-400"/>Hệ thống hoạt động</span><button>Hướng dẫn vận hành</button><button>Liên hệ kỹ thuật</button></div></div></footer>

  const employer = variant === "employer"
  const links = employer ? employerLinks : candidateLinks
  return <footer className={employer ? "border-t border-slate-700 bg-[#172b3f] text-white" : "border-t border-emerald-900/10 bg-[#103d2e] text-white"}>
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="grid gap-7 md:grid-cols-[1.2fr_1fr_.8fr] md:items-start">
        <div><Link href={employer?"/employer":"/candidate"} className="inline-flex items-center gap-2 text-xl font-extrabold">top<span className="-ml-2 text-[#2ee780]">cv</span><span className="ml-1 text-xs font-semibold text-slate-300">{employer?"Nhà tuyển dụng":"Ứng viên"}</span></Link><p className="mt-3 max-w-md text-sm leading-6 text-slate-300">{employer?"Quản lý tuyển dụng, hồ sơ ứng viên và hiệu quả chiến dịch tại một nơi.":"Quản lý hồ sơ, CV và hành trình ứng tuyển của bạn một cách chủ động."}</p></div>
        <div><h3 className="text-sm font-bold">Truy cập nhanh</h3><nav className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-300">{links.map(([label,href])=><Link key={label} href={href} className="transition hover:text-[#2ee780]">{label}</Link>)}</nav></div>
        <div><h3 className="text-sm font-bold">Hỗ trợ</h3><p className="mt-3 flex items-center gap-2 text-sm text-slate-300"><Headphones className="size-4 text-[#2ee780]"/>1900 633 156</p><p className="mt-2 text-xs leading-5 text-slate-400">Thứ 2–Thứ 6 · 08:00–18:00</p></div>
      </div>
      <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 TopCV Việt Nam · {employer?"Nền tảng tuyển dụng dành cho doanh nghiệp.":"Đồng hành cùng sự nghiệp của bạn."}</p><div className="flex gap-4"><Link href="/career-guide#privacy">Bảo mật</Link><Link href="/career-guide#terms">Điều khoản</Link><Link href="/career-guide#help">Trợ giúp</Link></div></div>
    </div>
  </footer>
}
