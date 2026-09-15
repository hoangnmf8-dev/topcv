import Link from "next/link"
import { Facebook, Linkedin, Mail, MapPin, Phone, Send } from "lucide-react"

const groups = [
  { title: "Việc làm & CV", links: [["Tìm việc làm", "/#jobs"], ["Việc làm đã lưu", "/candidate"], ["Tạo CV online", "/cv-builder"], ["Danh sách công ty", "/companies"], ["Cẩm nang nghề nghiệp", "/career-guide"]] },
  { title: "Công cụ sự nghiệp", links: [["Tính lương Gross - Net", "/discover/gross-net"], ["Tính thuế TNCN", "/discover/personal-income-tax"], ["Bảo hiểm thất nghiệp", "/discover/unemployment-benefit"], ["Tra cứu mức lương", "/discover/salary-lookup"], ["TopCV Pro", "/services"]] },
  { title: "Nhà tuyển dụng", links: [[["Đăng tin tuyển dụng"], "/employer/post-job"], [["Quản lý tuyển dụng"], "/employer"], [["Tìm hồ sơ ứng viên"], "/employer"], [["Gói dịch vụ tuyển dụng"], "/employer/services"], [["Tin nhắn với ứng viên"], "/employer/messages"]].map(([label, href]) => [label[0], href]) },
] as { title: string; links: string[][] }[]

export function SiteFooter() {
  return <footer className="mt-12 bg-[#103d2e] text-white">
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12">
      <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
        <div><Link href="/" className="text-3xl font-extrabold tracking-[-1.5px]">top<span className="text-[#2ee780]">cv</span></Link><p className="mt-3 max-w-sm text-sm leading-6 text-emerald-50/75">Kết nối ứng viên với cơ hội phù hợp, cung cấp CV, công cụ nghề nghiệp và giải pháp tuyển dụng cho doanh nghiệp.</p><div className="mt-5 flex gap-2"><Social label="Facebook"><Facebook className="size-4"/></Social><Social label="LinkedIn"><Linkedin className="size-4"/></Social><Social label="Telegram"><Send className="size-4"/></Social></div></div>
        {groups.map((group) => <FooterGroup key={group.title} {...group}/>) }
      </div>
      <div className="mt-10 grid gap-5 border-t border-white/10 pt-7 md:grid-cols-[1.2fr_1fr]"><div><h3 className="font-bold">Hỗ trợ khách hàng</h3><div className="mt-3 grid gap-2 text-sm text-emerald-50/75 sm:grid-cols-2"><p className="flex items-center gap-2"><Phone className="size-4"/>1900 633 156</p><p className="flex items-center gap-2"><Mail className="size-4"/>hotro@topcv.vn</p><p className="flex items-start gap-2 sm:col-span-2"><MapPin className="mt-0.5 size-4 shrink-0"/>Hà Nội · TP. Hồ Chí Minh · Làm việc 08:00–18:00, Thứ 2–Thứ 6</p></div></div><div className="flex flex-wrap content-start gap-x-5 gap-y-2 text-sm text-emerald-50/75 md:justify-end"><Link href="/career-guide#about" className="hover:text-white">Về TopCV</Link><Link href="/career-guide#privacy" className="hover:text-white">Bảo mật</Link><Link href="/career-guide#terms" className="hover:text-white">Điều khoản</Link><Link href="/career-guide#help" className="hover:text-white">Trợ giúp</Link></div></div>
    </div>
    <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-emerald-50/55">© 2026 TopCV Việt Nam · Nền tảng kết nối nhân tài và cơ hội nghề nghiệp.</div>
  </footer>
}

function FooterGroup({ title, links }: { title: string; links: string[][] }) { return <div><h3 className="font-bold">{title}</h3><ul className="mt-4 space-y-3 text-sm text-emerald-50/75">{links.map(([label, href]) => <li key={label}><Link className="transition hover:text-[#2ee780]" href={href}>{label}</Link></li>)}</ul></div> }
function Social({ label, children }: { label: string; children: React.ReactNode }) { return <button aria-label={label} className="grid size-9 place-items-center rounded-full border border-white/15 text-emerald-50/80 transition hover:border-[#2ee780] hover:text-[#2ee780]">{children}</button> }
