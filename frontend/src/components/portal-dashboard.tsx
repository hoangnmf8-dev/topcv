"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/auth.store";
import { CandidateRecords } from "@/components/candidate-records";
import { CandidateProfileForm } from "@/components/candidate-profile-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import uploadService from "@/services/upload.service";
import { UPLOAD } from "@/constants/upload.constant";
import {
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  LayoutDashboard,
  PackageCheck,
  Plus,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { RoleFooter } from "@/components/role-footer";
import { CandidateMobileSidebar } from "@/components/candidate-mobile-sidebar";
import { useCandidateStore } from "@/stores/candidate.store";

type Mode = "candidate" | "employer";
const candidateTabs = [
  ["overview", "Tổng quan", LayoutDashboard],
  ["profile", "Hồ sơ & CV", UserRound],
  ["applications", "Việc đã ứng tuyển", ClipboardList],
  ["saved", "Việc đã lưu", Heart],
  ["services", "TopCV Pro", PackageCheck],
  ["orders", "Đơn hàng", ReceiptText],
  ["payments", "Thanh toán", CreditCard],
  ["security", "Cá nhân & bảo mật", ShieldCheck],
] as const;
const employerTabs = [
  ["overview", "Tổng quan", LayoutDashboard],
  ["jobs", "Tin tuyển dụng", BriefcaseBusiness],
  ["candidates", "Ứng viên · Mini ATS", UsersRound],
  ["analytics", "Báo cáo", BarChart3],
  ["services", "Dịch vụ & đơn hàng", PackageCheck],
] as const;

export function PortalDashboard({ mode }: { mode: Mode }) {
  const [tab, setTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const candidate = mode === "candidate";
  const tabs = candidate ? candidateTabs : employerTabs;
  const { candidate: candidateStore } = useCandidateStore((state) => state);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested && tabs.some(([id]) => id === requested)) setTab(requested);
  }, [tabs]);
  return (
    <main className="route-home min-h-screen bg-slate-50">
      <SiteHeader
        menuOpen={mobileMenuOpen}
        onMenuClick={() => setMobileMenuOpen((open) => !open)}
      />
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600">
        <div
          aria-hidden
          className="absolute -right-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-[1280px] items-center justify-between px-4 py-9 sm:px-6">
          <div>
            <p className="text-sm text-emerald-100">
              {candidate
                ? "Trang cá nhân · Không gian sự nghiệp"
                : "Trung tâm nhà tuyển dụng"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {candidate
                ? `Chào ${candidateStore?.fullName ?? "bạn"}`
                : `Chào mừng nhà tuyển dụng`}
            </h1>
          </div>
          <Link
            href={candidate ? "/cv-builder" : "/employer/post-job"}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50"
          >
            {candidate ? (
              <FileText className="size-4" />
            ) : (
              <Plus className="size-4" />
            )}
            {candidate ? "Tạo CV mới" : "Đăng tin mới"}
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[245px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:block">
          <div className="mb-3 border-b border-slate-100 px-3 pb-3">
            <p className="font-bold">
              {candidate ? "Tài khoản ứng viên" : "Tài khoản doanh nghiệp"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {candidate
                ? `Hồ sơ hoàn thiện ${candidateStore?.profileCompletion ?? 0}%`
                : "Chưa có thông tin gói dịch vụ"}
            </p>
          </div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {tabs.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all ${tab === id ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>
        <section>
          {tab === "overview" && <Overview candidate={candidate} />}{" "}
          {tab === "profile" && <Profile />}{" "}
          {tab === "applications" && <CandidateRecords kind="applications" />}{" "}
          {tab === "saved" && <CandidateRecords kind="saved" />}{" "}
          {tab === "jobs" && <List title="Tin tuyển dụng của bạn" />}{" "}
          {tab === "candidates" && <MiniAts />}{" "}
          {tab === "analytics" && <Analytics />}{" "}
          {tab === "services" && <ServicesOnly />}{" "}
          {tab === "orders" && <Orders />}
          {tab === "payments" && <Payments />}{" "}
          {tab === "security" && <Security />}
        </section>
      </div>
      {candidate && mobileMenuOpen && (
        <CandidateMobileSidebar
          active={tab}
          onChange={(id) => {
            setTab(id);
            setMobileMenuOpen(false);
          }}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
      <RoleFooter variant="candidate" />
    </main>
  );
}
function Overview({ candidate }: { candidate: boolean }) {
  const stats = candidate
    ? [
        ["—", "Việc phù hợp mới", "Cập nhật hôm nay"],
        ["—", "Tin đã lưu", "Chưa có dữ liệu"],
        ["—", "Lượt ứng tuyển", "Trong 30 ngày gần nhất"],
        ["—", "Hồ sơ hoàn thiện", "Chưa có dữ liệu"],
      ]
    : [
        ["—", "Tin đang hiển thị", "Đang hoạt động"],
        ["—", "Ứng viên mới", "Trong 30 ngày gần nhất"],
        ["—", "Lịch phỏng vấn", "Chưa có dữ liệu"],
        ["—", "Tỷ lệ phù hợp", "Chưa có dữ liệu"],
      ];
  const statIcons = [Search, Heart, ClipboardList, UserRound];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([n, l, note], index) => {
          const Icon = statIcons[index];
          return (
            <div
              key={l}
              className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon className="size-5" />
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  + mới
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
                {n}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">{l}</p>
              <p className="mt-2 text-xs text-slate-400">{note}</p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <Panel
          title={candidate ? "Việc làm dành cho bạn" : "Hoạt động tuyển dụng"}
        >
          <div className="space-y-3">
            {([] as string[]).map((x, i) => (
              <div
                key={x}
                className="group flex flex-col gap-3 rounded-xl border border-slate-200/80 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{x}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {i === 0 ? "25 – 40 triệu" : "Hà Nội · Toàn thời gian"}
                  </p>
                </div>
                <Link
                  href={`/jobs/${i + 1}`}
                  className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white"
                >
                  Xem chi tiết
                </Link>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Cần làm hôm nay">
          <div className="space-y-3 text-sm">
            {[
              "Cập nhật thông tin hồ sơ",
              "Hoàn thành CV chuyên nghiệp",
              "Bật thông báo việc làm",
            ].map((x, i) => (
              <p
                key={x}
                className="flex gap-3 rounded-xl border border-slate-100 p-3.5 text-slate-700"
              >
                <CheckCircle2
                  className={`size-5 ${i === 0 ? "text-[#00b14f]" : "text-slate-300"}`}
                />
                {x}
              </p>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
function Profile() {
  const profile = useCandidateStore((state) => state.candidate);
  console.log("🚀 ~ Profile ~ profile:", profile)
  const updateCandidate = useAccountStore((state) => state.updateCandidate);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fullName = profile?.fullName || "Chưa cập nhật họ tên";
  const initials =
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "UV";
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  useEffect(() => {
    if (!avatarFile) {
      setAvatarUrl("");
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);
  async function saveAvatar() {
    if (!avatarFile || !profile || isSavingAvatar) return;
    setIsSavingAvatar(true);
    try {
      const presigned = await uploadService.getPresignedUrl(
        avatarFile,
        "avatar",
      );
      if (!presigned.success)
        throw new Error(presigned.message || "Không thể tải ảnh.");
      await uploadService.uploadFile(presigned.data.uploadUrl, avatarFile);
      const result = await uploadService.completeUploadFile(
        "avatar",
        presigned.data.objectKey,
      );
      if (!result.success)
        throw new Error(result.message || "Không thể lưu ảnh đại diện.");
      if (!result.data?.imageUrl || !result.data?.objectKey) {
        throw new Error("Máy chủ chưa xác nhận ảnh đã lưu. Vui lòng thử lại.");
      }
      updateCandidate({
        avatarKey: result.data.objectKey,
        avatarUrl: result.data.imageUrl,
      });
      useCandidateStore.getState().updateCandidate({
        ...profile,
        avatarKey: result.data.objectKey,
        avatarUrl: result.data.imageUrl,
      });
      setAvatarFile(null);
      setAvatarUrl("");
      toast.success(result.message || "Lưu ảnh đại diện thành công");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Không thể lưu ảnh đại diện.",
      );
    } finally {
      setIsSavingAvatar(false);
    }
  }
  const cvs = [] as {
    id: string;
    title: string;
    template: string;
    completion: number;
    updated: string;
    status: string;
  }[];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <label
            className="relative block size-24 shrink-0 cursor-pointer rounded-full transition hover:opacity-80 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2"
            title="Đổi ảnh đại diện"
          >
            <Avatar className="size-24 border-4 border-emerald-50">
              <AvatarImage
                src={avatarUrl || profile?.avatarUrl || undefined}
                alt={"Ảnh đại diện " + fullName}
              />
              <AvatarFallback className="bg-emerald-50 text-3xl font-bold text-emerald-700">
                {initials}
              </AvatarFallback>
            </Avatar>
            <input
              disabled={isSavingAvatar || !profile}
              type="file"
              aria-label="Đổi ảnh đại diện"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                if (
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                  ) ||
                  file.size > UPLOAD.IMAGE_SIZE
                ) {
                  toast.error("Chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB.");
                  return;
                }
                setAvatarFile(file);
              }}
            />
          </label>
          <div>
            <h2 className="text-xl font-bold">{fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {profile?.headline || "Chưa cập nhật chức danh"}
            </p>
            {avatarFile && (
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  disabled={isSavingAvatar}
                  onClick={saveAvatar}
                  className="rounded-xl bg-[#00b14f] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {isSavingAvatar ? "Đang lưu..." : "Lưu ảnh đại diện"}
                </button>
                <button
                  type="button"
                  disabled={isSavingAvatar}
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarUrl("");
                  }}
                  className="text-sm text-slate-500 disabled:opacity-50"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">
          {profile?.careerGoal || "Chưa cập nhật mục tiêu nghề nghiệp."}
        </p>
      </section>
      <CandidateProfileForm />
      <Panel title="Hồ sơ & CV">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-sm text-slate-500">Mức độ hoàn thiện hồ sơ</p>
            <div className="mt-3 h-2 w-64 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#00b14f]"
                style={{ width: `${profile?.profileCompletion ?? 0}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {profile?.profileCompletion ?? 0}% · Cập nhật thông tin để hoàn
              thiện hồ sơ.
            </p>
          </div>
          <Link
            href="/cv-builder?new=1"
            className="rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-bold text-white"
          >
            <span className="inline-flex items-center gap-2">
              <Plus className="size-4" />
              Tạo CV mới
            </span>
          </Link>
        </div>
        <div className="mt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-800">Danh sách CV</h3>
              <p className="mt-1 text-sm text-slate-500">Chưa có dữ liệu CV</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Sắp xếp: Cập nhật gần nhất
            </span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <p className="text-sm text-slate-500">Chưa có CV.</p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
function List({ title }: { title: string }) {
  return (
    <Panel title={title}>
      <div className="mb-4 flex justify-between">
        <p className="text-sm text-slate-500">Chưa có dữ liệu</p>
        <Link href="/" className="flex gap-1 text-sm font-bold text-[#008f40]">
          <Search className="size-4" />
          Tìm kiếm
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Tên</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {([] as string[]).map((x, i) => (
              <tr key={x} className="border-b border-slate-100">
                <td className="p-3 font-semibold">
                  {x}
                  <p className="mt-1 text-xs font-normal text-slate-500">
                    Công ty đối tác
                  </p>
                </td>
                <td>
                  <span className="rounded-full bg-[#e7f9ef] px-2.5 py-1 text-xs font-bold text-[#008f40]">
                    {i === 0 ? "Đang xử lý" : "Mới cập nhật"}
                  </span>
                </td>
                <td className="text-slate-500">Hôm nay</td>
                <td>
                  <ChevronRight className="size-4 text-slate-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
function MiniAts() {
  return (
    <Panel title="Ứng viên · Mini ATS">
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        Chưa có dữ liệu.
      </div>
    </Panel>
  );
}
function Analytics() {
  return (
    <Panel title="Báo cáo tuyển dụng">
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        Chưa có dữ liệu.
      </div>
    </Panel>
  );
}
function ServicesOnly() {
  return (
    <Panel title="TopCV Pro">
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        Chưa có thông tin gói dịch vụ.
      </div>
    </Panel>
  );
}
function Orders() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <Panel title="Đơn hàng">
      <p className="mb-5 text-sm text-slate-500">
        Lịch sử các gói dịch vụ đã mua bằng tài khoản ứng viên.
      </p>
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="p-3">Mã đơn</th>
              <th>Gói dịch vụ</th>
              <th>Thành tiền</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {([] as string[][]).map(([code, plan, amount, status, date]) => (
              <tr key={code} className="border-t border-slate-100">
                <td className="p-3 font-bold text-[#008f40]">#{code}</td>
                <td>
                  <b>{plan}</b>
                  <p className="mt-1 text-xs text-slate-500">
                    Đơn thuộc tài khoản ứng viên
                  </p>
                </td>
                <td className="font-semibold">{amount}</td>
                <td>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${status === "Đã hoàn tiền" ? "bg-amber-50 text-amber-700" : "bg-[#e7f9ef] text-[#008f40]"}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="text-slate-500">{date}</td>
                <td>
                  <button
                    onClick={() => setSelected(code)}
                    className="font-bold text-[#008f40]"
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#e7f9ef] p-4 text-sm">
          <div>
            <b>Đơn #{selected}</b>
            <p className="mt-1 text-slate-600">
              Hóa đơn điện tử và lịch sử thanh toán của đơn hàng.
            </p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="rounded-lg bg-white px-3 py-2 font-bold text-[#008f40]"
          >
            Đóng
          </button>
        </div>
      )}
    </Panel>
  );
}
function Payments() {
  return (
    <Panel title="Thanh toán">
      <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
        Chưa có đơn hàng để thanh toán.
      </div>
    </Panel>
  );
}
function Security() {
  const account = useAccountStore((s) => s.account);
  return (
    <div className="space-y-6">
      <Panel title="Cá nhân & bảo mật">
        <Setting
          title="Email đăng nhập"
          detail={account?.email ?? "Chưa có thông tin"}
          action="Thay đổi"
          onAction={() => toast.info("Chức năng này hiện chưa khả dụng.")}
        />
        <Setting
          title="Mật khẩu"
          detail="Bảo mật tài khoản"
          action="Đổi mật khẩu"
          href="/account/security"
        />
        <Setting
          title="Xác thực hai lớp"
          detail="Chưa có thông tin"
          action="Thiết lập"
          onAction={() => toast.info("Chức năng này hiện chưa khả dụng.")}
        />
        <Setting
          title="Thiết bị đăng nhập"
          detail="Chưa có dữ liệu thiết bị"
          action="Quản lý"
          onAction={() => toast.info("Chức năng này hiện chưa khả dụng.")}
        />
      </Panel>
    </div>
  );
}
function Setting({
  title,
  detail,
  action,
  href,
  onAction,
}: {
  title: string;
  detail: string;
  action: string;
  href?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{detail}</p>
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-sm font-bold text-[#008f40]">
          {action}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="shrink-0 text-sm font-bold text-[#008f40]"
        >
          {action}
        </button>
      )}
    </div>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="mb-5 text-lg font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
