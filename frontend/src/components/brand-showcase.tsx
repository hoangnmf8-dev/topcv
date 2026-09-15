import Link from "next/link"
import { ArrowRight, Building2, MapPin } from "lucide-react"

const brands = [
  { name: "FPT Software", field: "Công nghệ · Phần mềm", jobs: 38, tag: "FPT", color: "from-orange-500 to-orange-300" },
  { name: "Techcombank", field: "Tài chính · Ngân hàng", jobs: 24, tag: "TCB", color: "from-red-600 to-red-400" },
  { name: "VNG Corporation", field: "Công nghệ · Sản phẩm số", jobs: 16, tag: "VNG", color: "from-orange-400 to-amber-300" },
  { name: "Viettel Digital", field: "Công nghệ · Viễn thông", jobs: 29, tag: "VT", color: "from-emerald-700 to-green-400" },
]

export function BrandShowcase() {
  return <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6"><div className="overflow-hidden rounded-3xl bg-[#102a20] p-6 text-white shadow-xl sm:p-8">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm font-bold text-[#80ebb1]">THƯƠNG HIỆU ĐANG TUYỂN DỤNG</p><h2 className="mt-2 text-2xl font-bold sm:text-3xl">Cơ hội tại những công ty bạn muốn gia nhập</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">Khám phá văn hóa, vị trí đang mở và câu chuyện phát triển của các thương hiệu nổi bật.</p></div><Link href="/companies" className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#087b43]">Xem tất cả thương hiệu <ArrowRight className="size-4" /></Link></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{brands.map((brand) => <Link key={brand.name} href={`/companies/${brand.name.toLowerCase().replaceAll(" ", "-")}`} className="group rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:-translate-y-1 hover:bg-white/15"><div className={`grid size-11 place-items-center rounded-xl bg-gradient-to-br ${brand.color} text-sm font-black text-white shadow-lg`}>{brand.tag}</div><h3 className="mt-5 font-bold">{brand.name}</h3><p className="mt-1 text-xs text-emerald-100">{brand.field}</p><p className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#90e8b7]"><Building2 className="size-3.5" /> {brand.jobs} việc đang tuyển</p></Link>)}</div>
  </div></section>
}
