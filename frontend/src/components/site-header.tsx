"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ChevronDown,
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
}: { onMenuClick?: () => void; menuOpen?: boolean } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  useEffect(() => {
    const refeshToken = async () => {
      try {
        const profile = await authService.getProfile();
      } catch(error) {
        if(error instanceof Unauthorized) {
          router.replace("/auth")
        }
      }
    };
    refeshToken();
  }, []) 
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-[1280px] items-center gap-5 px-4 sm:px-6">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
          >
            <Menu className="size-5" />
          </button>
        )}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label="TopCV về trang chủ"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#e7f9ef] text-[#00b14f]">
            <BriefcaseBusiness className="size-5" />
          </span>
          <span className="text-[25px] font-extrabold tracking-[-1.5px] text-slate-800">
            top<span className="text-[#00b14f]">cv</span>
            <sup className="ml-0.5 text-[8px] text-[#00b14f]">®</sup>
          </span>
        </Link>
        <nav className="hidden h-full items-center gap-1 lg:flex">
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
                  className={`inline-flex h-full items-center gap-1 px-3 text-sm font-semibold transition ${open === menu.label ? "text-[#00b14f]" : "text-slate-700 hover:text-[#00b14f]"}`}
                >
                  {menu.label}
                  <ChevronDown
                    className={`size-3.5 transition ${open === menu.label ? "rotate-180" : ""}`}
                  />
                </button>
                {open === menu.label && (
                  <div className="absolute left-0 top-[68px] w-[560px] rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl">
                    <p className="px-3 pb-2 pt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                      Khám phá {menu.label.toLowerCase()}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {menu.items?.map((item) => {
                        if(!menu.items) return;
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
            className="inline-flex h-full items-center px-3 text-sm font-semibold text-slate-700 transition hover:text-[#00b14f]"
          >
            Cẩm nang nghề nghiệp
          </Link>
          <Link
            href="/services"
            className="ml-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700"
          >
            TopCV Pro
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            href="/messages"
            className="relative grid size-10 place-items-center rounded-full bg-slate-50 text-slate-600 transition hover:bg-[#e7f9ef] hover:text-[#00b14f]"
            aria-label="Tin nhắn"
          >
            <MessageCircle className="size-5" />
            <span className="absolute right-0.5 top-0.5 size-2 rounded-full bg-[#00b14f] ring-2 ring-white" />
          </Link>
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((value) => !value)}
              className="relative grid size-10 place-items-center rounded-full bg-slate-50 text-slate-600"
              aria-label="Thông báo"
              aria-expanded={notificationsOpen}
            >
              <Bell className="size-5" />
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                <div className="flex items-center justify-between px-2 py-2">
                  <b className="text-sm text-slate-900">Thông báo mới</b>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs font-semibold text-emerald-700"
                  >
                    Đánh dấu đã đọc
                  </button>
                </div>
                {[
                  ["Hồ sơ đã được xem", "Công ty Onenet vừa xem CV của bạn."],
                  ["3 việc làm phù hợp", "Các vị trí Frontend mới tại Hà Nội."],
                  [
                    "Nhắc lịch ứng tuyển",
                    "Hạn nộp Chuyên viên UI/UX còn 2 ngày.",
                  ],
                ].map(([title, detail], index) => (
                  <Link
                    href={index === 0 ? "/candidate" : "/#jobs"}
                    onClick={() => setNotificationsOpen(false)}
                    key={title}
                    className="block rounded-xl px-3 py-3 transition hover:bg-emerald-50"
                  >
                    <span className="flex items-start gap-2">
                      <i
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${index < 2 ? "bg-emerald-500" : "bg-amber-500"}`}
                      />
                      <span>
                        <b className="block text-sm text-slate-800">{title}</b>
                        <small className="mt-1 block leading-5 text-slate-500">
                          {detail}
                        </small>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/candidate"
            className="hidden items-center gap-2 border-l border-slate-200 pl-3 text-sm font-semibold text-slate-700 sm:flex"
          >
            <span className="grid size-9 place-items-center rounded-full bg-slate-100">
              <UserRound className="size-5 text-slate-500" />
            </span>
            <span className="hidden xl:block">Nguyễn Văn A</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
