"use client";
import Link from "next/link";
import { Bell, Crown, Menu, MessageCircle, UserRound } from "lucide-react";
import { useAccountStore } from "@/stores/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCompanyStore } from "@/stores/company.store";
import { useState } from "react";
import uploadService from "@/services/upload.service";
import { refreshImage } from "@/lib/utils";

export function EmployerHeader({
  onMenuClick,
  menuOpen = false,
}: {
  onMenuClick?: () => void;
  menuOpen?: boolean;
}) {
  const [isRetried, setIsRetried] = useState<boolean>(false);
  const { company } = useCompanyStore((state) => state);
  return (
    <header className="sticky top-0 z-40 bg-[#203246] text-white shadow">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        {onMenuClick ? (
          <button
            type="button"
            onClick={onMenuClick}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-200 transition hover:bg-white/10 lg:hidden"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
          >
            <Menu className="size-5" />
          </button>
        ) : (
          <Menu className="size-5 shrink-0 text-slate-200 lg:hidden" />
        )}
        <Link
          href="/employer"
          className="mr-auto whitespace-nowrap text-xl font-extrabold tracking-tight sm:text-2xl"
        >
          top<span className="text-[#24d276]">cv</span>
          <sup className="text-[8px]">®</sup>
          <span className="ml-2 hidden text-xs font-semibold text-slate-300 md:inline">
            Nhà tuyển dụng
          </span>
        </Link>
        <Link
          href="/employer/services"
          className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1.5 text-sm font-bold text-amber-700 sm:flex"
        >
          <Crown className="size-4" />
          TopCV Pro
        </Link>
        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          <Link
            href="/employer/messages"
            className="rounded-lg p-1.5 hover:bg-white/10"
            aria-label="Tin nhắn nhà tuyển dụng"
          >
            <MessageCircle className="size-5" />
          </Link>
          <span className="relative">
            <Bell className="size-5" />
            <i className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-red-500 text-[9px] not-italic">
              3
            </i>
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600">
            <Avatar>
              <AvatarImage
                src={`${company?.logoUrl}`}
                onError={refreshImage(company?.logoKey)}
              />
              <AvatarFallback>
                <UserRound className="size-5" />
              </AvatarFallback>
            </Avatar>
          </span>
          <span className="hidden xl:block">{company?.name}</span>
        </div>
      </div>
    </header>
  );
}
