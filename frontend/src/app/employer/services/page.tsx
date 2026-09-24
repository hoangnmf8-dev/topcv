import { Check, Clock3, Crown, Sparkles } from "lucide-react"
import Link from "next/link"
import { EmployerHeader } from "@/components/employer-header"
import { RoleFooter } from "@/components/role-footer"

const plans = [] as ({ name: string; price: string; period: string; desc: string; features: string[]; button: string; popular?: undefined; developing?: undefined; } | { name: string; price: string; period: string; desc: string; popular: boolean; features: string[]; button: string; developing?: undefined; } | { name: string; price: string; period: string; desc: string; developing: boolean; features: string[]; button: string; popular?: undefined; })[]

export default function EmployerServicesPage() {
  return <main className="min-h-screen bg-[#f6f8f7]">
    <EmployerHeader />
    <section className="bg-gradient-to-r from-[#063c27] to-[#087b43] text-white"><div className="mx-auto w-full max-w-[1280px] px-4 py-12 text-center sm:px-6">
      <Sparkles className="mx-auto size-7" />
      <h1 className="mt-3 text-3xl font-bold">Gói dịch vụ dành cho Nhà tuyển dụng</h1>
      <p className="mt-2 text-emerald-50">Quyền lợi minh bạch, định lượng rõ ràng và dễ theo dõi trong tài khoản công ty.</p>
    </div></section>
    <div className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-2xl border border-emerald-100 bg-[#e7f9ef] p-4 text-center text-sm text-[#087b43]">
        <b>Chính sách chung:</b> mỗi tin được hiển thị tối đa 30 ngày. Hạn mức đăng tin làm mới lúc <b>00:00 mỗi ngày</b>; lượt đẩy tin và mở CV chỉ bị trừ khi sử dụng.
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {plans.map(plan => <article key={plan.name} className={`relative rounded-2xl bg-white p-6 shadow-sm ${plan.popular ? "ring-2 ring-[#00b14f]" : ""} ${plan.developing ? "opacity-80" : ""}`}>
          {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00b14f] px-3 py-1 text-xs font-bold text-white">Được chọn nhiều</span>}
          {plan.developing && <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-white"><Clock3 className="size-3" />Đang phát triển</span>}
          <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold">{plan.name}</h2><p className="mt-2 min-h-10 text-sm text-slate-500">{plan.desc}</p></div>{plan.developing && <Crown className="size-5 text-amber-500" />}</div>
          <p className="mt-5 text-2xl font-extrabold text-[#008f40]">{plan.price}</p>
          <p className="mt-1 text-xs font-medium text-slate-400">Thời hạn gói: {plan.period}</p>
          {plan.developing ? <button disabled className="mt-5 w-full cursor-not-allowed rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-400">{plan.button}</button> : <Link href="/employer" className={`mt-5 block w-full rounded-xl py-3 text-center text-sm font-bold ${plan.popular ? "bg-[#00b14f] text-white" : "bg-[#e7f9ef] text-[#008f40]"}`}>{plan.button}</Link>}
          <ul className="mt-6 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-2 text-sm leading-5 text-slate-600"><Check className="mt-0.5 size-4 shrink-0 text-[#00b14f]" />{feature}</li>)}</ul>
        </article>)}
      </div>
    </div>
    <RoleFooter variant="employer" />
  </main>
}
