"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useQuery } from "@tanstack/react-query";
import { getDetailCompanyKey } from "@/cache-key";
import companyService from "@/services/company.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CompanyDetail() {
  const { slug: code } = useParams<{ slug: string }>();
  const { data } = useQuery({
    queryKey: getDetailCompanyKey(code),
    queryFn: () => companyService.getDetailCompany(code),
  });
  return (
    <main className="route-home min-h-screen bg-[#f6f8f7]">
      <SiteHeader />
      <div className="mx-auto max-w-[1280px] px-4 py-5 text-sm text-slate-500">
        <Link
          href="/companies"
          className="inline-flex items-center gap-1 hover:text-[#008f40]"
        >
          <ArrowLeft className="size-4" />
          Danh sách công ty
        </Link>
      </div>
      <section className="bg-[linear-gradient(110deg,#063c27,#087b43,#00b14f)]">
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <Avatar className="size-24 overflow-hidden rounded-2xl bg-white shadow-xl after:hidden">
              <AvatarImage
                src={data?.logoUrl}
                className="size-full rounded-none object-contain"
              />
              <AvatarFallback className="size-full rounded-none bg-white text-2xl font-black text-[#087b43]">
                CN
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-white">
              <h1 className="mt-3 text-3xl font-extrabold">{data?.name}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-50">
                <Globe className="size-4" />
                {data?.website} <span>·</span>
                <Users className="size-4" />
                {data?.sizeRange}
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1280px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.5fr_.8fr]">
        <article className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Giới thiệu công ty</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {data?.description}
          </p>
        </article>
        <aside className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Thông tin chung</h2>
          <div className="mt-5 space-y-5 text-sm">
            <p className="flex gap-3">
              <Building2 className="size-5 text-[#00a64f]" />
              <span>
                <b className="block">Lĩnh vực</b>
                <span className="text-slate-500">{data?.industry}</span>
              </span>
            </p>
            <p className="flex gap-3">
              <Users className="size-5 text-[#00a64f]" />
              <span>
                <b className="block">Quy mô</b>
                <span className="text-slate-500">{data?.sizeRange}</span>
              </span>
            </p>
            <p className="flex gap-3">
              <MapPin className="size-5 text-[#00a64f]" />
              <span>
                <b className="block">Địa điểm</b>
                <span className="text-slate-500">{data?.address}</span>
              </span>
            </p>
          </div>
          <Link
            href={`/discover/jobs-by-field?code=${data?.code}`}
            className="mt-7 block w-full rounded-xl bg-[#00b14f] py-3 text-center text-sm font-bold text-white"
          >
            Xem danh sách công việc
          </Link>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
