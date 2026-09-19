"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAccountStore } from "@/stores/auth.store";
import { CandidateSavedJobs } from "@/components/candidate-saved-jobs";
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
              {candidate ? "Chào Nguyễn Văn A!" : "Chào mừng Công ty Onenet"}
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
                ? "Hồ sơ hoàn thiện 80%"
                : "Gói tiêu chuẩn · Còn 18 ngày"}
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
          {tab === "applications" && <List title="Việc đã ứng tuyển" />}{" "}
          {tab === "saved" && <CandidateSavedJobs />}{" "}
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
        ["12", "Việc phù hợp mới", "Cập nhật hôm nay"],
        ["04", "Tin đã lưu", "2 tin sắp hết hạn"],
        ["03", "Lượt ứng tuyển", "Trong 30 ngày gần nhất"],
        ["80%", "Hồ sơ hoàn thiện", "Còn 2 mục cần bổ sung"],
      ]
    : [
        ["12", "Tin đang hiển thị", "Đang hoạt động"],
        ["148", "Ứng viên mới", "Trong 30 ngày gần nhất"],
        ["24", "Lịch phỏng vấn", "5 lịch trong tuần"],
        ["78%", "Tỷ lệ phù hợp", "Tăng 6% so với tháng trước"],
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
            {[
              "Senior ReactJS Developer tại FPT Software",
              "Marketing Manager tại VNG Corporation",
              "Automation Tester tại Techcombank",
            ].map((x, i) => (
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
  const profile = useAccountStore(state => state.account?.candidate);
  const updateCandidate = useAccountStore(state => state.updateCandidate);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const fullName = profile?.fullName || "Nguyễn Văn A";
  const initials = fullName.trim().split(/\s+/).filter(Boolean).slice(-2).map(word => word[0]).join("").toUpperCase() || "UV";
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  useEffect(() => {
    if (!avatarFile) { setAvatarUrl(""); return; }
    const url = URL.createObjectURL(avatarFile);
    setAvatarUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);
  async function saveAvatar() {
    if (!avatarFile || !profile || isSavingAvatar) return;
    setIsSavingAvatar(true);
    try {
      const presigned = await uploadService.getPresignedUrl(avatarFile, "avatar");
      if (!presigned.success) throw new Error(presigned.message || "Không thể tải ảnh.");
      await uploadService.uploadFile(presigned.data.uploadUrl, avatarFile);
      const result = await uploadService.completeUploadFile("avatar", presigned.data.objectKey);
      if (!result.success) throw new Error(result.message || "Không thể lưu ảnh đại diện.");
      if (!result.data?.imageUrl || !result.data?.objectKey) {
        throw new Error("Máy chủ chưa xác nhận ảnh đã lưu. Vui lòng thử lại.");
      }
      updateCandidate({ avatarKey: result.data.objectKey, avatarUrl: result.data.imageUrl });
      setAvatarFile(null);
      setAvatarUrl("");
      toast.success(result.message || "Lưu ảnh đại diện thành công");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu ảnh đại diện.");
    } finally {
      setIsSavingAvatar(false);
    }
  }
  const cvs = [
    {
      id: "frontend",
      title: "CV Front-end Developer",
      template: "Modern",
      completion: 92,
      updated: "Hôm nay",
      status: "CV mặc định",
    },
    {
      id: "fullstack",
      title: "CV Full-stack Developer",
      template: "Chuyên nghiệp",
      completion: 78,
      updated: "18/08/2026",
      status: "Bản nháp",
    },
    {
      id: "english",
      title: "CV Front-end Developer · English",
      template: "Tối giản",
      completion: 64,
      updated: "03/08/2026",
      status: "Bản nháp",
    },
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <label className="relative block size-24 shrink-0 cursor-pointer rounded-full transition hover:opacity-80 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2" title="Đổi ảnh đại diện">
            <Avatar className="size-24 border-4 border-emerald-50">
              <AvatarImage src={avatarUrl || profile?.avatarUrl || undefined} alt={"Ảnh đại diện " + fullName} />
              <AvatarFallback className="bg-emerald-50 text-3xl font-bold text-emerald-700">{initials}</AvatarFallback>
            </Avatar>
            <input disabled={isSavingAvatar || !profile} type="file" aria-label="Đổi ảnh đại diện" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => {
              const file = event.target.files?.[0]; event.target.value = "";
              if (!file) return;
              if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > UPLOAD.IMAGE_SIZE) { toast.error("Chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB."); return; }
              setAvatarFile(file);
            }}/>
          </label>
          <div><h2 className="text-xl font-bold">{fullName}</h2><p className="mt-1 text-sm text-slate-500">{profile?.headline || "Front-end Developer"}</p>
            {avatarFile && <div className="mt-3 flex items-center gap-3">
              <button type="button" disabled={isSavingAvatar} onClick={saveAvatar} className="rounded-xl bg-[#00b14f] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                {isSavingAvatar ? "Đang lưu..." : "Lưu ảnh đại diện"}
              </button>
              <button type="button" disabled={isSavingAvatar} onClick={() => { setAvatarFile(null); setAvatarUrl(""); }} className="text-sm text-slate-500 disabled:opacity-50">Hủy</button>
            </div>}
          </div>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600">Tôi tập trung xây dựng trải nghiệm web hiệu quả, dễ dùng và có khả năng mở rộng.</p>
      </section>
      <Panel title="Hồ sơ & CV">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <p className="text-sm text-slate-500">Mức độ hoàn thiện hồ sơ</p>
            <div className="mt-3 h-2 w-64 rounded-full bg-slate-100">
              <div className="h-full w-4/5 rounded-full bg-[#00b14f]" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              80% · Bổ sung kinh nghiệm để tăng tỷ lệ phù hợp.
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
              <p className="mt-1 text-sm text-slate-500">
                3/6 CV đã tạo trong gói dùng thử
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Sắp xếp: Cập nhật gần nhất
            </span>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {cvs.map((cv) => (
              <article
                key={cv.id}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:shadow-sm"
              >
                <div className="flex gap-4">
                  <div className="grid h-24 w-20 shrink-0 place-items-center rounded-lg border bg-[linear-gradient(135deg,#e7f9ef_0_34%,white_34%)] text-[#00a84f]">
                    <FileText className="size-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-800">{cv.title}</h4>
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${cv.status === "CV mặc định" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {cv.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Mẫu {cv.template} · Cập nhật {cv.updated}
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#00b14f]"
                          style={{ width: `${cv.completion}%` }}
                        />
                      </div>
                      <b className="text-xs text-[#008f40]">{cv.completion}%</b>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Độ hoàn thiện CV
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <Link
                    href={`/cv-builder?cv=${cv.id}`}
                    className="rounded-lg bg-[#00b14f] px-3 py-2 text-xs font-bold text-white"
                  >
                    Chỉnh sửa CV
                  </Link>
                  <button
                    onClick={() =>
                      toast.info(`Đang mở bản xem trước “${cv.title}”.`)
                    }
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    Xem trước
                  </button>
                  <button
                    onClick={() => toast.success(`Đã nhân bản “${cv.title}”.`)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    Nhân bản
                  </button>
                </div>
              </article>
            ))}
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
        <p className="text-sm text-slate-500">Hiển thị 3 kết quả mới nhất</p>
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
            {[
              "Chuyên viên Kinh doanh B2B",
              "Senior ReactJS Developer",
              "Automation Tester",
            ].map((x, i) => (
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
  const [states, setStates] = useState([
    "Mới nhận",
    "Đang xem",
    "Mời phỏng vấn",
  ]);
  return (
    <Panel title="Mini ATS · Ứng viên">
      <p className="mb-5 text-sm text-slate-500">
        Cập nhật trạng thái, ghi chú nội bộ và mời phỏng vấn ngay trên danh
        sách.
      </p>
      <div className="space-y-3">
        {["Trần Minh Anh", "Lê Quốc Bảo", "Nguyễn Hoài Nam"].map((n, i) => (
          <div
            key={n}
            className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center"
          >
            <div className="grid size-10 place-items-center rounded-full bg-slate-100 font-bold">
              {n[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{n}</p>
              <p className="text-xs text-slate-500">
                ReactJS · {i + 2} năm kinh nghiệm · Điểm phù hợp {92 - i * 7}%
              </p>
            </div>
            <select
              value={states[i]}
              onChange={(e) =>
                setStates((s) =>
                  s.map((x, j) => (j === i ? e.target.value : x)),
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            >
              <option>Mới nhận</option>
              <option>Đang xem</option>
              <option>Mời phỏng vấn</option>
              <option>Từ chối</option>
            </select>
            <button className="rounded-lg bg-[#e7f9ef] px-3 py-2 text-sm font-bold text-[#008f40]">
              Xem CV
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
function Analytics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Panel title="Hiệu quả tuyển dụng">
        <div className="flex h-48 items-end gap-3 pt-8">
          {[42, 65, 48, 83, 57, 92, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-lg bg-[#00b14f]/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-slate-500">
          Lượt tiếp cận trong 7 ngày
        </p>
      </Panel>
      <Panel title="Kênh ứng viên">
        <div className="space-y-4">
          {["Tìm kiếm TopCV", "Gợi ý phù hợp", "Chia sẻ tin"].map((x, i) => (
            <div key={x}>
              <div className="flex justify-between text-sm">
                <span>{x}</span>
                <b>{[68, 22, 10][i]}%</b>
              </div>
              <div className="mt-2 h-2 rounded bg-slate-100">
                <div
                  className="h-full rounded bg-[#00b14f]"
                  style={{ width: `${[68, 22, 10][i]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
function ServicesOnly() {
  return (
    <Panel title="TopCV Pro">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-[#e7f9ef] p-5">
        <div>
          <p className="font-bold text-[#067a3d]">
            Gói TopCV Pro đang hoạt động
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Còn 18 ngày · Tối ưu CV và ẩn biểu tượng @topcv.dev.
          </p>
        </div>
        <Link
          href="/services"
          className="rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-bold text-white"
        >
          Nâng cấp gói
        </Link>
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
            {[
              [
                "TCV-2026-0810",
                "TopCV Pro 1 tháng",
                "699.000đ",
                "Đã thanh toán",
                "10/08/2026",
              ],
              [
                "TCV-2026-0624",
                "Đánh giá CV AI",
                "99.000đ",
                "Đã thanh toán",
                "24/06/2026",
              ],
              [
                "TCV-2026-0512",
                "TopCV Pro 1 tháng",
                "699.000đ",
                "Đã hoàn tiền",
                "12/05/2026",
              ],
            ].map(([code, plan, amount, status, date]) => (
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
  const [method, setMethod] = useState("vnpay");
  const [paid, setPaid] = useState(false);
  return (
    <Panel title="Thanh toán">
      <p className="text-sm text-slate-500">
        Chọn phương thức thanh toán cho đơn #TCV-2026-0810.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {[
          ["vnpay", "VNPay"],
          ["momo", "MoMo"],
          ["bank", "Chuyển khoản"],
          ["card", "Thẻ quốc tế"],
        ].map(([id, label]) => (
          <button
            onClick={() => setMethod(id)}
            key={id}
            className={`rounded-xl border p-4 text-left text-sm font-bold ${method === id ? "border-[#00b14f] bg-[#e7f9ef] text-[#087b43]" : "border-slate-200"}`}
          >
            {label}
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Thanh toán an toàn, xác nhận tức thì
            </span>
          </button>
        ))}
      </div>
      <button
        onClick={() => setPaid(true)}
        disabled={paid}
        className="mt-6 rounded-xl bg-[#00b14f] px-5 py-3 text-sm font-bold text-white disabled:bg-emerald-200"
      >
        {paid ? "✓ Thanh toán thành công" : "Thanh toán 699.000đ"}
      </button>
    </Panel>
  );
}
function Security() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [dialog, setDialog] = useState<"email" | "devices" | null>(null);
  const [email, setEmail] = useState("nguyenvana@email.com");
  const [draftEmail, setDraftEmail] = useState(email);
  return (
    <div className="space-y-6">
      <Panel title="Cá nhân & bảo mật">
        <div className="divide-y divide-slate-100">
          <Setting
            title="Email đăng nhập"
            detail={email}
            action="Thay đổi"
            onAction={() => setDialog("email")}
          />
          <Setting
            title="Mật khẩu"
            detail="Cập nhật lần cuối 02/08/2026"
            action="Đổi mật khẩu"
            href="/account/security"
          />
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <p className="font-bold">Xác thực hai lớp</p>
              <p className="mt-1 text-sm text-slate-500">
                Bảo vệ tài khoản bằng mã xác minh khi đăng nhập.
              </p>
            </div>
            <button
              onClick={() => {
                setTwoFactor(!twoFactor);
                toast.success(
                  twoFactor
                    ? "Đã tắt xác thực hai lớp."
                    : "Đã bật xác thực hai lớp.",
                );
              }}
              aria-label="Bật hoặc tắt xác thực hai lớp"
              className={`relative h-7 w-12 rounded-full ${twoFactor ? "bg-[#00b14f]" : "bg-slate-200"}`}
            >
              <span
                className={`absolute top-1 size-5 rounded-full bg-white transition ${twoFactor ? "left-6" : "left-1"}`}
              />
            </button>
          </div>
          <Setting
            title="Thiết bị đăng nhập"
            detail="Windows · Hà Nội · Hoạt động lúc này"
            action="Quản lý"
            onAction={() => setDialog("devices")}
          />
        </div>
      </Panel>
      {dialog && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {dialog === "email" ? (
              <>
                <h3 className="text-lg font-bold">Thay đổi email đăng nhập</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Mã xác minh sẽ được gửi tới email mới.
                </p>
                <label className="mt-5 block text-sm font-bold">
                  Email mới
                </label>
                <input
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  type="email"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setDialog(null)}
                    className="rounded-lg border px-4 py-2 text-sm font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      if (draftEmail.includes("@")) {
                        setEmail(draftEmail);
                        toast.success("Đã cập nhật email đăng nhập.");
                        setDialog(null);
                      } else toast.error("Email không hợp lệ.");
                    }}
                    className="rounded-lg bg-[#00b14f] px-4 py-2 text-sm font-bold text-white"
                  >
                    Lưu email
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">Thiết bị đăng nhập</h3>
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <b>Windows · Chrome</b>
                  <p className="mt-1 text-sm text-slate-600">
                    Hà Nội · Hoạt động lúc này · Thiết bị hiện tại
                  </p>
                </div>
                <div className="mt-3 rounded-xl border p-4">
                  <b>Android · Chrome</b>
                  <p className="mt-1 text-sm text-slate-500">
                    TP. Hồ Chí Minh · 2 ngày trước
                  </p>
                  <button
                    onClick={() =>
                      toast.success("Đã đăng xuất thiết bị Android.")
                    }
                    className="mt-3 text-sm font-bold text-red-600"
                  >
                    Đăng xuất thiết bị
                  </button>
                </div>
                <button
                  onClick={() => setDialog(null)}
                  className="mt-5 w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold"
                >
                  Đóng
                </button>
              </>
            )}
          </div>
        </div>
      )}
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
