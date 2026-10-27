"use client";
import { NotificationBell } from "./notification-bell";
import { MessageBadge } from "@/providers/chat-provider";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ChevronDown,
  Crown,
  FileText,
  MessageCircle,
  Menu,
  Search,
  Sparkles,
  UserRound,
  Landmark,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";
import authService from "@/services/auth.service";
import { Unauthorized } from "@/exceptions";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/auth.store";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useCandidateStore } from "@/stores/candidate.store";
type MenuItem = {
  label: string;
  description: string;
  href: string;
  icon: typeof Search;
};

const menus: { label: string; items?: MenuItem[] }[] = [
  {
    label: "Việc làm",
    items: [
      {
        label: "Tìm việc làm",
        description: "Khám phá tin tuyển dụng phù hợp",
        href: "/#jobs",
        icon: Search,
      },
      {
        label: "Việc làm đã lưu",
        description: "Quản lý cơ hội bạn quan tâm",
        href: "/candidate",
        icon: BookOpen,
      },
      {
        label: "Việc làm theo lĩnh vực",
        description: "Công nghệ, Marketing, Kinh doanh...",
        href: "/discover/jobs-by-field",
        icon: BriefcaseBusiness,
      },
      {
        label: "Danh sách công ty",
        description: "Tìm hiểu thương hiệu đang tuyển dụng",
        href: "/companies",
        icon: Building2,
      },
    ],
  },
  {
    label: "Tạo CV",
    items: [
      {
        label: "Tạo CV mới",
        description: "Chọn mẫu và bắt đầu trong vài phút",
        href: "/cv-builder",
        icon: FileText,
      },
      {
        label: "Mẫu CV theo phong cách",
        description: "Đơn giản, hiện đại, chuyên nghiệp",
        href: "/discover/cv-templates",
        icon: Sparkles,
      },
      {
        label: "Mẫu theo vị trí",
        description: "CV cho IT, Sales, Kế toán...",
        href: "/discover/cv-by-role",
        icon: BriefcaseBusiness,
      },
      {
        label: "Quản lý CV",
        description: "Chỉnh sửa và theo dõi phiên bản",
        href: "/candidate",
        icon: FileText,
      },
    ],
  },
  {
    label: "Công cụ",
    items: [
      {
        label: "Tính lương Gross - Net",
        description: "Ước tính thu nhập thực nhận",
        href: "/discover/gross-net",
        icon: Calculator,
      },
      {
        label: "Tính thuế thu nhập cá nhân",
        description: "Tách rõ giảm trừ và thuế tạm tính",
        href: "/discover/personal-income-tax",
        icon: Landmark,
      },
      {
        label: "Tính bảo hiểm thất nghiệp",
        description: "Ước tính mức và thời gian hưởng",
        href: "/discover/unemployment-benefit",
        icon: ShieldCheck,
      },
      {
        label: "Tra cứu mức lương",
        description: "Tham khảo lương theo vị trí, cấp bậc",
        href: "/discover/salary-lookup",
        icon: TrendingUp,
      },
    ],
  },
  {
    label: "Cẩm nang nghề nghiệp",
  },
];

export function SiteHeader({
  onMenuClick,
  menuOpen = false,
  mobileMenu = true,
}: {
  onMenuClick?: () => void;
  menuOpen?: boolean;
  mobileMenu?: boolean;
} = {}) {
  const account = useAccountStore((state) => state.account);
  const { candidate } = useCandidateStore((state) => state);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const isMenuOpen = onMenuClick ? menuOpen : mobileDrawerOpen;
  const toggleMenu = onMenuClick
    ? onMenuClick
    : () => setMobileDrawerOpen((current) => !current);
  const closeMobileMenu = () => {
    setMobileDrawerOpen(false);
    setMobileSection(null);
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center gap-2 px-3 sm:px-4 xl:gap-5 xl:px-6">
        {(onMenuClick || mobileMenu) && (
          <button
            onClick={toggleMenu}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        )}
        <Link
          href="/"
          className="hidden shrink-0 items-center gap-2.5 sm:flex"
          aria-label="TopCV về trang chủ"
        >
          <img src="/topcv-logo-7.png" alt="topcv-logo" className="h-14 xl:h-[76px]" />
        </Link>
        <nav
          className="hidden h-full items-center gap-0 lg:flex xl:gap-1"
        >
          {menus
            .filter((menu) => menu.label !== "Cẩm nang nghề nghiệp")
            .map((menu) => (
              <div
                key={menu.label}
                className="relative h-full"
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  onClick={() =>
                    setOpen(open === menu.label ? null : menu.label)
                  }
                  onMouseEnter={() => setOpen(menu.label)}
                  className={`inline-flex h-full items-center gap-1 px-1.5 text-sm font-semibold transition xl:px-3 ${open === menu.label ? "text-[#00b14f]" : "text-slate-700 hover:text-[#00b14f]"}`}
                >
                  {menu.label}
                  <ChevronDown
                    className={`size-3.5 transition ${open === menu.label ? "rotate-180" : ""}`}
                  />
                </button>
                {open === menu.label && (
                  <div className="absolute left-0 top-17 w-140 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl">
                    <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Khám phá {menu.label.toLowerCase()}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {menu.items?.map((item) => {
                        if (!menu.items) return;
                        const Icon = item.icon;
                        return (
                          <Link
                            onClick={() => setOpen(null)}
                            key={item.label}
                            href={item.href}
                            className="flex gap-3 rounded-xl p-3 transition hover:bg-[#e7f9ef]"
                          >
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-[#00a64f]">
                              <Icon className="size-4" />
                            </span>
                            <span>
                              <b className="text-sm text-slate-800">
                                {item.label}
                              </b>
                              <small className="mt-0.5 block text-xs leading-5 text-slate-500">
                                {item.description}
                              </small>
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          <Link
            href="/career-guide"
            className="inline-flex h-full items-center px-1.5 text-sm font-semibold text-slate-700 transition hover:text-[#00b14f] xl:px-3"
          >
            Cẩm nang nghề nghiệp
          </Link>
          <Link
            href="/services"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-700 xl:ml-2 xl:gap-2 xl:px-3"
          >
            <Crown aria-hidden="true" className="size-4 shrink-0" />
            TopCV Pro
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {account ? (
            <>
              <Link
                href="/messages"
                className="relative grid size-10 place-items-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-[#e7f9ef] hover:text-[#00b14f]"
                aria-label="Tin nhắn"
              >
                <span className="relative">
                  <MessageCircle className="size-5" />
                  <MessageBadge />
                </span>
              </Link>
              <NotificationBell />
              <Link
                href={
                  account.role === "admin"
                    ? "/admin"
                    : account.role === "company"
                      ? "/employer"
                      : "/candidate"
                }
                className="flex items-center gap-2 border-l border-slate-200 pl-3 text-sm font-semibold text-slate-700"
              >
                <span className="grid size-9 place-items-center rounded-full bg-slate-100">
                  <Avatar>
                    <AvatarImage src={candidate?.avatarUrl ?? ""} />
                    <AvatarFallback>
                      <UserRound className="size-5 text-slate-500" />
                    </AvatarFallback>
                  </Avatar>
                </span>
                <span className="hidden xl:block">
                  {account.role === "admin"
                    ? "Quản trị viên"
                    : account.role === "company"
                      ? account.company?.name
                      : candidate?.fullName}
                </span>
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[#00b14f] px-4 py-2 text-sm font-semibold text-white"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
      {mobileMenu && !onMenuClick && mobileDrawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]"
            onClick={closeMobileMenu}
            aria-label="Đóng menu"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng TopCV"
            className="absolute inset-y-0 left-0 flex w-[min(67vw,420px)] animate-in slide-in-from-left flex-col bg-white shadow-2xl duration-200"
          >
            <div className="flex h-[76px] shrink-0 items-center justify-between border-b px-4">
              <Link href="/" onClick={closeMobileMenu} aria-label="TopCV trang chủ">
                <img src="/topcv-logo-7.png" alt="TopCV" className="h-[60px]" />
              </Link>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="grid size-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100"
                aria-label="Đóng menu"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {menus
                .filter((menu) => menu.items?.length)
                .map((menu) => (
                  <div key={menu.label} className="mb-1">
                    <button
                      type="button"
                      onClick={() =>
                        setMobileSection((current) =>
                          current === menu.label ? null : menu.label,
                        )
                      }
                      aria-expanded={mobileSection === menu.label}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {menu.label}
                      <ChevronDown
                        className={`size-4 transition-transform ${mobileSection === menu.label ? "rotate-180" : ""}`}
                      />
                    </button>
                    {mobileSection === menu.label && (
                      <div className="mb-2 ml-3 border-l border-emerald-100 pl-2">
                        {menu.items?.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={closeMobileMenu}
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <Icon className="size-4 shrink-0" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              <Link
                href="/career-guide"
                onClick={closeMobileMenu}
                className="flex items-center rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cẩm nang nghề nghiệp
              </Link>
              <Link
                href="/services"
                onClick={closeMobileMenu}
                className="mt-2 flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-sm font-bold text-amber-700"
              >
                <Crown className="size-4" />
                TopCV Pro
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
