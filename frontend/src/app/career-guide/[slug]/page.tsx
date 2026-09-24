import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, UserRound } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { CareerArticle } from "@/types/career"
const careerArticles: CareerArticle[] = [];

export function generateStaticParams() {
  return careerArticles.map(({ slug }) => ({ slug }))
}

export default async function CareerArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = careerArticles.find(item => item.slug === slug)
  if (!article) return <main className="route-home min-h-screen bg-slate-50"><SiteHeader/><section className="mx-auto max-w-4xl px-6 py-16"><h1 className="text-2xl font-bold">Cẩm nang nghề nghiệp</h1><p className="mt-5">Chưa có nội dung bài viết.</p><Link href="/career-guide" className="mt-5 block text-emerald-700">Quay lại cẩm nang</Link></section><SiteFooter/></main>
  const related = careerArticles.filter((item) => item.slug !== article.slug).slice(0, 3)

  return <main className="route-home min-h-screen bg-slate-50"><SiteHeader/>
    <header className="border-b border-emerald-900/10 bg-gradient-to-br from-[#06452f] via-[#087b43] to-[#00a64f] text-white"><div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14"><Link href="/career-guide" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-100 hover:text-white"><ArrowLeft className="size-4"/>Cẩm nang nghề nghiệp</Link><span className="mt-7 block w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">{article.category}</span><h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">{article.title}</h1><p className="mt-5 max-w-3xl text-base leading-7 text-emerald-50/90">{article.excerpt}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-emerald-100"><span className="flex items-center gap-1.5"><UserRound className="size-4"/>{article.author}</span><span className="flex items-center gap-1.5"><CalendarDays className="size-4"/>{article.publishedAt}</span><span className="flex items-center gap-1.5"><Clock3 className="size-4"/>{article.readTime} đọc</span></div></div></header>
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]"><article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><p className="border-l-4 border-emerald-500 pl-5 text-lg font-medium leading-8 text-slate-700">{article.intro}</p><div className="mt-9 space-y-10">{article.sections.map((section,index)=><section key={section.title}><div className="flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">{index+1}</span><h2 className="pt-0.5 text-xl font-bold text-slate-900 sm:text-2xl">{section.title}</h2></div><div className="ml-11 mt-4 space-y-4">{section.paragraphs.map(paragraph=><p key={paragraph} className="leading-7 text-slate-600">{paragraph}</p>)}{section.bullets&&<ul className="space-y-3 rounded-2xl bg-emerald-50/70 p-5">{section.bullets.map(item=><li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600"/>{item}</li>)}</ul>}</div></section>)}</div><div className="mt-10 rounded-2xl bg-slate-900 p-6 text-white"><h2 className="text-xl font-bold">Sẵn sàng áp dụng vào hồ sơ?</h2><p className="mt-2 text-sm leading-6 text-slate-300">Cập nhật CV và khám phá các vị trí phù hợp với định hướng của bạn.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/cv-builder" className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold">Cập nhật CV</Link><Link href="/#jobs" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-bold">Tìm việc làm</Link></div></div></article>
    <aside><div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Đọc tiếp</p><h2 className="mt-2 font-bold text-slate-900">Bài viết liên quan</h2><div className="mt-4 divide-y divide-slate-100">{related.map(item=><Link key={item.slug} href={`/career-guide/${item.slug}`} className="group block py-4 first:pt-0"><span className="text-xs font-semibold text-emerald-600">{item.category}</span><h3 className="mt-1 text-sm font-semibold leading-6 text-slate-800 group-hover:text-emerald-700">{item.title}</h3><span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">{item.readTime} <ArrowRight className="size-3"/></span></Link>)}</div></div></aside></div><SiteFooter/>
  </main>
}
