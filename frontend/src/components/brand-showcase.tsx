"use client";
import Link from "next/link";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCompaniesKey } from "@/cache-key";
import { useState } from "react";
import companyService from "@/services/company.service";
import { Company } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function BrandShowcase() {
  const [page, setPage] = useState<number>(1);
  const { data, isPending, isFetching, isError } = useQuery({
    queryKey: getCompaniesKey(page, 4),
    queryFn: () => companyService.getCompanies({ page, limit: 4 }),
  });
  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
      <div className="overflow-hidden rounded-3xl bg-[#102a20] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold text-[#80ebb1]">
              THƯƠNG HIỆU ĐANG TUYỂN DỤNG
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Cơ hội tại những công ty bạn muốn gia nhập
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
              Khám phá văn hóa, vị trí đang mở và câu chuyện phát triển của các
              thương hiệu nổi bật.
            </p>
          </div>
          <Link
            href="/companies"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#087b43]"
          >
            Xem tất cả thương hiệu <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data?.data.map((brand: Company) => (
            <Link
              key={brand.code}
              href={`/companies/${brand.code}`}
              className="group rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:-translate-y-1 hover:bg-white/15"
            >
              <div className="h-20 w-20 rounded-xl border border-white/20 bg-white p-2 shadow-sm overflow-hidden">
                <img
                  src={brand.logoUrl || ""}
                  alt={brand.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <h3 className="mt-5 font-bold">{brand.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
