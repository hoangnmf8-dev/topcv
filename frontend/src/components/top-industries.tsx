import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Calculator,
  Code2,
  Headphones,
  Landmark,
  Megaphone,
  UsersRound,
} from "lucide-react";

const industries = [
  {
    name: "Kinh doanh / Bán hàng",
    count: "2.685",
    category: "sales",
    icon: BarChart3,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    name: "Marketing / Truyền thông",
    count: "1.595",
    category: "marketing",
    icon: Megaphone,
    tone: "bg-orange-50 text-orange-700",
  },
  {
    name: "Chăm sóc khách hàng",
    count: "840",
    query: "chăm sóc khách hàng",
    icon: Headphones,
    tone: "bg-cyan-50 text-cyan-700",
  },
  {
    name: "Nhân sự / Hành chính",
    count: "734",
    query: "nhân sự",
    icon: UsersRound,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    name: "Công nghệ thông tin",
    count: "1.825",
    category: "it",
    icon: Code2,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    name: "Tài chính / Ngân hàng",
    count: "1.084",
    query: "tài chính",
    icon: Landmark,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    name: "Bất động sản",
    count: "388",
    query: "bất động sản",
    icon: Building2,
    tone: "bg-rose-50 text-rose-700",
  },
  {
    name: "Kế toán / Kiểm toán",
    count: "1.263",
    category: "accounting",
    icon: Calculator,
    tone: "bg-teal-50 text-teal-700",
  },
];

export function TopIndustries() {
  return (
    <section className="border-y border-slate-100 bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Khám phá cơ hội
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Top ngành nghề nổi bật
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Chọn ngành nghề để xem ngay các vị trí đang tuyển dụng.
            </p>
          </div>
          <Link
            href="/#jobs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Xem tất cả việc làm <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {industries.map(
            ({ name, count, category, query, icon: Icon, tone }) => {
              const href = category
                ? `/?category=${category}#jobs`
                : `/?q=${encodeURIComponent(query ?? name)}#jobs`;
              return (
                <Link
                  key={name}
                  href={href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-lg"
                >
                  <span
                    className={`grid size-12 place-items-center rounded-2xl ${tone}`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-semibold text-slate-900 group-hover:text-emerald-700">
                    {name}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-emerald-600">
                    {count} việc làm
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 group-hover:text-emerald-700">
                    Khám phá ngay{" "}
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
}
