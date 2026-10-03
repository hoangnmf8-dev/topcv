import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { informationArticles } from "@/data/information-articles";

function getArticle(slug: string) {
  if (!Object.prototype.hasOwnProperty.call(informationArticles, slug)) notFound();
  return informationArticles[slug as keyof typeof informationArticles];
}

export function generateStaticParams() {
  return Object.keys(informationArticles).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getArticle((await params).slug);
  return { title: `${article.title} | TopCV`, description: article.description };
}

export default async function InformationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  return <div className="min-h-screen bg-[#f5f7f8]">
    <SiteHeader />
    <main className="mx-auto max-w-[1120px] px-4 py-10 sm:px-6 sm:py-14">
      <nav aria-label="Đường dẫn" className="mb-6 text-sm text-slate-500"><Link href="/" className="hover:text-emerald-700">Trang chủ</Link><span className="mx-2">/</span>Thông tin & hỗ trợ</nav>
      <div className="grid items-start gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
          <h2 className="mb-4 font-bold text-slate-900">Thông tin & hỗ trợ</h2>
          <nav aria-label="Thông tin và hỗ trợ" className="flex flex-col gap-1">{Object.entries(informationArticles).map(([key, item]) => <Link key={key} href={`/information/${key}`} aria-current={key === slug ? "page" : undefined} className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${key === slug ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"}`}>{item.title}</Link>)}</nav>
        </aside>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10">
          <header className="mb-8 border-b border-slate-100 pb-7"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-emerald-700">Thông tin & hỗ trợ</p><h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{article.title}</h1><p className="mt-4 text-base leading-7 text-slate-600">{article.description}</p></header>
          <div className="space-y-8">{article.sections.map(section => <section key={section.title}><h2 className="mb-3 text-xl font-semibold text-slate-900">{section.title}</h2><div className="space-y-3">{section.paragraphs.map(paragraph => <p key={paragraph} className="text-base leading-8 text-slate-600">{paragraph}</p>)}</div></section>)}</div>
          {slug === "help" && <Link href="/#jobs" className="mt-8 inline-flex rounded-lg bg-[#00b14f] px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Khám phá việc làm</Link>}
        </article>
      </div>
    </main>
    <SiteFooter />
  </div>;
}
