"use client";
import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  Download,
  FileText,
  LayoutDashboard,
  MessageCircle,
  NotebookPen,
  Plus,
  ReceiptText,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { EmployerHeader as SiteHeader } from "@/components/employer-header";
import { RoleFooter } from "@/components/role-footer";
import { EmployerMobileSidebar } from "@/components/employer-mobile-sidebar";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useForm } from "react-hook-form";
import {
  COMPANY_SIZE_OPTIONS,
  CompanyProfile,
  companyProfileSchema,
} from "@/validators/company.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FieldError } from "./ui/field";

const tabs = [
  ["overview", "Tổng quan", LayoutDashboard],
  ["company", "Hồ sơ doanh nghiệp", Building2],
  ["jobs", "Tin tuyển dụng", BriefcaseBusiness],
  ["candidates", "Ứng viên ứng tuyển · Mini ATS", UsersRound],
  ["talent", "Tìm hồ sơ công khai", Search],
  ["analytics", "Báo cáo tuyển dụng", BarChart3],
  ["billing", "Dịch vụ, đơn hàng & thanh toán", ReceiptText],
  ["messages", "Tin nhắn", MessageCircle],
] as const;
const jobRows = [
  ["Senior Front-end Developer", "Đang hiển thị", "42", "30/09/2026"],
  ["Nhân viên Kinh doanh B2B", "Chờ duyệt", "0", "25/08/2026"],
  ["UI/UX Designer", "Tạm dừng", "18", "15/08/2026"],
];
const applicationSeed = [
  {
    id: "APP-001",
    name: "Trần Minh Anh",
    title: "Senior Front-end Developer",
    skills: "ReactJS · TypeScript · Next.js",
    experience: "2 năm",
    score: 92,
    status: "Mới nhận",
    appliedAt: "28/08/2026",
    note: "Ứng viên có portfolio tốt, cần kiểm tra khả năng giao tiếp.",
  },
  {
    id: "APP-002",
    name: "Lê Quốc Bảo",
    title: "Senior Front-end Developer",
    skills: "ReactJS · Redux · NodeJS",
    experience: "3 năm",
    score: 84,
    status: "Đang xem",
    appliedAt: "27/08/2026",
    note: "Đã xem CV, kinh nghiệm phù hợp với yêu cầu.",
  },
  {
    id: "APP-003",
    name: "Nguyễn Hoài Nam",
    title: "UI/UX Designer",
    skills: "Figma · UI Design · Research",
    experience: "4 năm",
    score: 76,
    status: "Mời phỏng vấn",
    appliedAt: "26/08/2026",
    note: "Mời phỏng vấn vòng 1, trao đổi thêm về case study.",
  },
  {
    id: "APP-004",
    name: "Phạm Thảo Vy",
    title: "Nhân viên Kinh doanh B2B",
    skills: "Sales · CRM · Đàm phán",
    experience: "2 năm",
    score: 88,
    status: "Đang xem",
    appliedAt: "25/08/2026",
    note: "Có kinh nghiệm bán hàng B2B.",
  },
];
const reportRows = [
  {
    title: "Senior Front-end Developer",
    applications: 64,
    reviewing: 31,
    interviews: 14,
    hired: 3,
    rejected: 7,
    averageFit: 86,
  },
  {
    title: "Nhân viên Kinh doanh B2B",
    applications: 51,
    reviewing: 24,
    interviews: 7,
    hired: 2,
    rejected: 8,
    averageFit: 79,
  },
  {
    title: "UI/UX Designer",
    applications: 33,
    reviewing: 16,
    interviews: 3,
    hired: 1,
    rejected: 4,
    averageFit: 82,
  },
];
export function EmployerDashboard() {
  const [tab, setTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab");
    if (requested && tabs.some(([id]) => id === requested)) setTab(requested);
  }, []);
  return (
    <main className="route-employer min-h-screen bg-slate-50">
      <SiteHeader
        menuOpen={mobileMenuOpen}
        onMenuClick={() => setMobileMenuOpen((open) => !open)}
      />
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-800 to-emerald-600">
        <div
          aria-hidden
          className="absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl"
        />
        <div className="relative mx-auto flex max-w-[1280px] flex-col items-start gap-5 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-9">
          <div className="text-white">
            <p className="text-sm text-emerald-100">
              Trung tâm Nhà tuyển dụng · Onenet
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Tuyển đúng người, nhanh hơn
            </h1>
          </div>
          <Link
            href="/employer/post-job"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50 sm:w-auto"
          >
            <Plus className="size-4" />
            Đăng tin mới
          </Link>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden h-fit rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm lg:sticky lg:top-24 lg:block">
          <div className="mb-3 border-b border-slate-100 px-3 pb-4">
            <p className="font-semibold text-slate-900">Công ty Onenet</p>
            <p className="mt-1 text-xs text-slate-500">
              Đã xác thực · Một tài khoản chung cho HR
            </p>
          </div>
          <nav>
            {tabs.map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-all ${tab === id ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
          <p className="mx-3 mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            Tài khoản công ty không có quyền duyệt tin, khóa tài khoản hay sửa
            danh mục hệ thống.
          </p>
        </aside>
        <section className="min-w-0">
          {tab === "overview" && <Overview open={setTab} />}{" "}
          {tab === "jobs" && <Jobs />} {tab === "candidates" && <Candidates />}{" "}
          {tab === "talent" && <TalentSearch />}{" "}
          {tab === "analytics" && <AnalyticsV2 />}{" "}
          {tab === "billing" && <Billing />} {tab === "company" && <Company />}{" "}
          {tab === "messages" && <Messages />}
        </section>
      </div>
      {mobileMenuOpen && (
        <EmployerMobileSidebar
          active={tab}
          onChange={(id) => {
            setTab(id);
            setMobileMenuOpen(false);
          }}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
      <RoleFooter variant="employer" />
    </main>
  );
}
function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Overview({ open }: { open: (id: string) => void }) {
  const total = reportRows.reduce((sum, row) => sum + row.applications, 0),
    reviewing = reportRows.reduce((sum, row) => sum + row.reviewing, 0),
    interviews = reportRows.reduce((sum, row) => sum + row.interviews, 0),
    hired = reportRows.reduce((sum, row) => sum + row.hired, 0),
    rejected = reportRows.reduce((sum, row) => sum + row.rejected, 0),
    unprocessed = Math.max(
      0,
      total - reviewing - interviews - hired - rejected,
    ),
    processed = total - unprocessed,
    processedRate = Math.round((processed / total) * 100),
    activeJobs = jobRows.filter((row) => row[1] === "Đang hiển thị").length,
    pendingJobs = jobRows.filter((row) => row[1] === "Chờ duyệt").length;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Tin đang hiển thị"
          value={activeJobs}
          note="Từ trạng thái job_posts"
        />
        <Metric
          label="Hồ sơ chưa xử lý"
          value={unprocessed}
          note="Trạng thái Mới nhận"
        />
        <Metric
          label="Hồ sơ đã xử lý"
          value={processed}
          note={`${processedRate}% tổng hồ sơ`}
        />
        <Metric
          label="Ứng viên đã tuyển"
          value={hired}
          note={`${Math.round((hired / total) * 100)}% tổng hồ sơ`}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.35fr_.8fr]">
        <Panel title="Tình hình tuyển dụng">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusSummary
              label="Tổng hồ sơ"
              value={total}
              tone="bg-slate-100 text-slate-700"
            />
            <StatusSummary
              label="Đang xem xét"
              value={reviewing}
              tone="bg-blue-50 text-blue-700"
            />
            <StatusSummary
              label="Mời phỏng vấn"
              value={interviews}
              tone="bg-amber-50 text-amber-700"
            />
            <StatusSummary
              label="Đã tuyển"
              value={hired}
              tone="bg-emerald-50 text-emerald-700"
            />
          </div>
          <button
            onClick={() => open("analytics")}
            className="mt-5 text-sm font-bold text-[#008f40]"
          >
            Xem báo cáo chi tiết →
          </button>
        </Panel>
        <Panel title="Cần xử lý">
          <div className="space-y-3">
            <button
              onClick={() => open("candidates")}
              className="flex w-full items-center justify-between rounded-xl bg-rose-50 p-4 text-left"
            >
              <span className="text-sm font-semibold">Hồ sơ mới chưa xem</span>
              <b className="text-rose-700">{unprocessed}</b>
            </button>
            <button
              onClick={() => open("jobs")}
              className="flex w-full items-center justify-between rounded-xl bg-amber-50 p-4 text-left"
            >
              <span className="text-sm font-semibold">Tin đang chờ duyệt</span>
              <b className="text-amber-700">{pendingJobs}</b>
            </button>
            <button
              onClick={() => open("candidates")}
              className="flex w-full items-center justify-between rounded-xl bg-blue-50 p-4 text-left"
            >
              <span className="text-sm font-semibold">Hồ sơ đang xem xét</span>
              <b className="text-blue-700">{reviewing}</b>
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Các mục dẫn tới màn hình quản lý tương ứng và được tổng hợp từ trạng
            thái hiện tại.
          </p>
        </Panel>
      </div>
    </div>
  );
}
function Jobs() {
  const [status, setStatus] = useState("Tất cả trạng thái");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<(typeof jobRows)[number] | null>(
    null,
  );
  const rows = jobRows.filter(
    (x) =>
      (status === "Tất cả trạng thái" || x[1] === status) &&
      x[0].toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Panel
        title="Tin tuyển dụng"
        action={
          <Link
            href="/employer/post-job"
            className="rounded-xl bg-[#00b14f] px-3 py-2 text-sm font-bold text-white"
          >
            + Đăng tin
          </Link>
        }
      >
        <div className="mb-5 flex flex-wrap gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm"
            placeholder="Tìm theo tiêu đề"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm"
          >
            <option>Tất cả trạng thái</option>
            <option>Đang hiển thị</option>
            <option>Chờ duyệt</option>
            <option>Tạm dừng</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="p-3">Vị trí</th>
                <th>Trạng thái</th>
                <th>Ứng viên</th>
                <th>Hạn nộp</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-b">
                  <td className="p-3 font-bold">
                    {row[0]}
                    <p className="mt-1 text-xs font-normal text-slate-500">
                      Công nghệ thông tin · Hà Nội
                    </p>
                  </td>
                  <td>
                    <span className="rounded-full bg-[#e7f9ef] px-2 py-1 text-xs font-bold text-[#008f40]">
                      {row[1]}
                    </span>
                  </td>
                  <td>{row[2]}</td>
                  <td>{row[3]}</td>
                  <td>
                    <button
                      onClick={() => setSelected(row)}
                      className="font-bold text-[#008f40]"
                    >
                      Quản lý
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <p className="p-8 text-center text-sm text-slate-500">
              Không tìm thấy tin tuyển dụng.
            </p>
          )}
        </div>
      </Panel>
      {selected && (
        <Modal
          title={`Quản lý · ${selected[0]}`}
          onClose={() => setSelected(null)}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <CvField label="Trạng thái" value={selected[1]} />
            <CvField label="Ứng viên" value={selected[2]} />
            <CvField label="Hạn nộp" value={selected[3]} />
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Link
              href="/employer/post-job"
              className="rounded-xl border px-4 py-2 text-sm font-bold"
            >
              Chỉnh sửa tin
            </Link>
            <button
              onClick={() => setSelected(null)}
              className="rounded-xl bg-[#00b14f] px-4 py-2 text-sm font-bold text-white"
            >
              Đóng
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Candidates() {
  const [applications, setApplications] = useState(applicationSeed);
  const [query, setQuery] = useState("");
  const [job, setJob] = useState("Tất cả tin");
  const [status, setStatus] = useState("Tất cả trạng thái");
  const [noteTarget, setNoteTarget] = useState<
    (typeof applicationSeed)[number] | null
  >(null);
  const [cvTarget, setCvTarget] = useState<
    (typeof applicationSeed)[number] | null
  >(null);
  const [draftNote, setDraftNote] = useState("");
  const [notice, setNotice] = useState("");
  const filtered = applications.filter(
    (item) =>
      (job === "Tất cả tin" || item.title === job) &&
      (status === "Tất cả trạng thái" || item.status === status) &&
      item.name.toLowerCase().includes(query.toLowerCase()),
  );
  const changeStatus = (id: string, nextStatus: string) => {
    setApplications((items) =>
      items.map((item) =>
        item.id === id ? { ...item, status: nextStatus } : item,
      ),
    );
    setNotice(`Đã cập nhật trạng thái thành “${nextStatus}”.`);
  };
  const openNote = (item: (typeof applicationSeed)[number]) => {
    setNoteTarget(item);
    setDraftNote(item.note);
  };
  const saveNote = () => {
    if (!noteTarget) return;
    setApplications((items) =>
      items.map((item) =>
        item.id === noteTarget.id ? { ...item, note: draftNote } : item,
      ),
    );
    setNoteTarget(null);
    setNotice("Đã lưu ghi chú nội bộ.");
  };
  return (
    <>
      <Panel title="Mini ATS nâng cao · Ứng viên">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            Dữ liệu tương ứng bảng applications: trạng thái, điểm phù hợp, CV và
            ghi chú nội bộ.
          </p>
          <span className="rounded-full bg-[#e7f9ef] px-3 py-1 text-xs font-bold text-[#008f40]">
            Tuyển dụng Pro
          </span>
        </div>
        {notice && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <span>✓ {notice}</span>
            <button onClick={() => setNotice("")} aria-label="Đóng thông báo">
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <label className="relative">
            <Search className="absolute left-3 top-3 size-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên ứng viên"
              className="w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm"
            />
          </label>
          <select
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm"
          >
            <option>Tất cả tin</option>
            {jobRows.map((row) => (
              <option key={row[0]}>{row[0]}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border px-3 py-2.5 text-sm"
          >
            <option>Tất cả trạng thái</option>
            <option>Mới nhận</option>
            <option>Đang xem</option>
            <option>Mời phỏng vấn</option>
            <option>Đã tuyển</option>
            <option>Từ chối</option>
          </select>
        </div>
        <div className="space-y-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="grid size-10 place-items-center rounded-full bg-[#e7f9ef] font-bold text-[#008f40]">
                  {item.name[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <b>{item.name}</b>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.title} · Nộp {item.appliedAt}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.skills} · {item.experience} · Phù hợp {item.score}%
                  </p>
                </div>
                <select
                  value={item.status}
                  onChange={(e) => changeStatus(item.id, e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option>Mới nhận</option>
                  <option>Đang xem</option>
                  <option>Mời phỏng vấn</option>
                  <option>Đã tuyển</option>
                  <option>Từ chối</option>
                </select>
                <button
                  onClick={() => setCvTarget(item)}
                  className="rounded-lg bg-[#e7f9ef] px-3 py-2 text-sm font-bold text-[#008f40]"
                >
                  Xem CV
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                <button
                  onClick={() => openNote(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  <NotebookPen className="size-3.5" />
                  Ghi chú nội bộ
                </button>
                <p className="min-w-0 flex-1 truncate text-xs text-slate-400">
                  {item.note || "Chưa có ghi chú"}
                </p>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
              Không tìm thấy hồ sơ phù hợp bộ lọc.
            </div>
          )}
        </div>
      </Panel>
      {noteTarget && (
        <Modal
          title={`Ghi chú · ${noteTarget.name}`}
          onClose={() => setNoteTarget(null)}
        >
          <p className="mb-3 text-sm text-slate-500">
            Ghi chú chỉ nhà tuyển dụng nhìn thấy, lưu vào{" "}
            <code>applications.internal_note</code>.
          </p>
          <textarea
            autoFocus
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            className="h-32 w-full rounded-xl border p-3 text-sm"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setNoteTarget(null)}
              className="rounded-xl border px-4 py-2 text-sm font-bold"
            >
              Hủy
            </button>
            <button
              onClick={saveNote}
              className="rounded-xl bg-[#00b14f] px-4 py-2 text-sm font-bold text-white"
            >
              Lưu ghi chú
            </button>
          </div>
        </Modal>
      )}
      {cvTarget && (
        <Modal
          title={`CV · ${cvTarget.name}`}
          onClose={() => setCvTarget(null)}
        >
          <div className="rounded-xl border bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl bg-[#e7f9ef] text-[#008f40]">
                <FileText />
              </span>
              <div>
                <b>CV_{cvTarget.name.replaceAll(" ", "_")}.pdf</b>
                <p className="mt-1 text-xs text-slate-500">
                  CV được chọn khi ứng tuyển · {cvTarget.id}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <CvField label="Vị trí ứng tuyển" value={cvTarget.title} />
              <CvField label="Kinh nghiệm" value={cvTarget.experience} />
              <CvField label="Kỹ năng" value={cvTarget.skills} />
              <CvField label="Điểm phù hợp" value={`${cvTarget.score}%`} />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setCvTarget(null)}
              className="rounded-xl bg-[#00b14f] px-4 py-2 text-sm font-bold text-white"
            >
              Đóng
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
      onMouseDown={onClose}
    >
      <section
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full hover:bg-slate-100"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function CvField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
function TalentSearch() {
  const jobTitles: Record<string, string[]> = {
    "Công nghệ thông tin": [
      "Tất cả vị trí",
      "Lập trình Front-end",
      "Lập trình Back-end",
      "Kiểm thử phần mềm",
    ],
    "Kinh doanh / Bán hàng": [
      "Tất cả vị trí",
      "Chuyên viên kinh doanh",
      "Quản lý bán hàng",
    ],
    "Marketing / Truyền thông": [
      "Tất cả vị trí",
      "Digital Marketing",
      "Content Marketing",
    ],
  };
  const profiles = [
    {
      name: "Phạm Quốc Huy",
      category: "Công nghệ thông tin",
      title: "Lập trình Front-end",
      skills: "ReactJS · TypeScript · Next.js",
      years: 3,
      location: "Hà Nội",
      score: 94,
    },
    {
      name: "Nguyễn Thảo Vy",
      category: "Marketing / Truyền thông",
      title: "Digital Marketing",
      skills: "SEO · Google Ads · Content",
      years: 2,
      location: "Hồ Chí Minh",
      score: 88,
    },
    {
      name: "Trần Minh Anh",
      category: "Công nghệ thông tin",
      title: "Lập trình Back-end",
      skills: "NodeJS · PostgreSQL · Redis",
      years: 4,
      location: "Hà Nội",
      score: 91,
    },
    {
      name: "Lê Quốc Bảo",
      category: "Kinh doanh / Bán hàng",
      title: "Chuyên viên kinh doanh",
      skills: "B2B · CRM · Đàm phán",
      years: 5,
      location: "Đà Nẵng",
      score: 86,
    },
  ];
  const [category, setCategory] = useState("Công nghệ thông tin");
  const [jobTitle, setJobTitle] = useState("Tất cả vị trí");
  const [experience, setExperience] = useState("0");
  const [location, setLocation] = useState("Tất cả tỉnh/thành");
  const [filters, setFilters] = useState({
    category,
    jobTitle,
    experience,
    location,
  });
  const [selected, setSelected] = useState<string | null>(null);
  const result = profiles.filter(
    (profile) =>
      profile.category === filters.category &&
      (filters.jobTitle === "Tất cả vị trí" ||
        profile.title === filters.jobTitle) &&
      profile.years >= Number(filters.experience) &&
      (filters.location === "Tất cả tỉnh/thành" ||
        profile.location === filters.location),
  );
  const changeCategory = (value: string) => {
    setCategory(value);
    setJobTitle("Tất cả vị trí");
  };
  return (
    <Panel title="Tìm kiếm hồ sơ ứng viên">
      <p className="mb-5 text-sm text-slate-500">
        Lọc hồ sơ công khai theo danh mục nghề, vị trí chuyên môn, kinh nghiệm
        và tỉnh/thành phố.
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs font-bold text-slate-600">
          Danh mục nghề
          <select
            aria-label="Danh mục nghề"
            value={category}
            onChange={(e) => changeCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white p-3 text-sm font-normal"
          >
            <option>Công nghệ thông tin</option>
            <option>Kinh doanh / Bán hàng</option>
            <option>Marketing / Truyền thông</option>
          </select>
        </label>
        <label className="text-xs font-bold text-slate-600">
          Vị trí chuyên môn
          <select
            aria-label="Vị trí chuyên môn"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white p-3 text-sm font-normal"
          >
            {jobTitles[category].map((title) => (
              <option key={title}>{title}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-600">
          Kinh nghiệm
          <select
            aria-label="Kinh nghiệm"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white p-3 text-sm font-normal"
          >
            <option value="0">Tất cả kinh nghiệm</option>
            <option value="1">Từ 1 năm</option>
            <option value="2">Từ 2 năm</option>
            <option value="3">Từ 3 năm</option>
            <option value="5">Từ 5 năm</option>
          </select>
        </label>
        <label className="text-xs font-bold text-slate-600">
          Tỉnh/thành phố
          <select
            aria-label="Tỉnh/thành phố"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-white p-3 text-sm font-normal"
          >
            <option>Tất cả tỉnh/thành</option>
            <option>Hà Nội</option>
            <option>Hồ Chí Minh</option>
            <option>Đà Nẵng</option>
          </select>
        </label>
        <button
          onClick={() =>
            setFilters({ category, jobTitle, experience, location })
          }
          className="self-end rounded-xl bg-[#00b14f] px-4 py-3 text-sm font-bold text-white"
        >
          Tìm hồ sơ
        </button>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Tìm thấy <b className="text-slate-800">{result.length}</b> hồ sơ phù
          hợp
        </p>
        {(filters.jobTitle !== "Tất cả vị trí" ||
          filters.experience !== "0" ||
          filters.location !== "Tất cả tỉnh/thành") && (
          <button
            onClick={() => {
              setJobTitle("Tất cả vị trí");
              setExperience("0");
              setLocation("Tất cả tỉnh/thành");
              setFilters({
                category,
                jobTitle: "Tất cả vị trí",
                experience: "0",
                location: "Tất cả tỉnh/thành",
              });
            }}
            className="text-xs font-bold text-[#008f40]"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {result.map((profile) => (
          <article
            key={profile.name}
            className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center"
          >
            <span className="grid size-11 place-items-center rounded-full bg-[#e7f9ef] font-bold text-[#008f40]">
              {profile.name[0]}
            </span>
            <div className="flex-1">
              <b>{profile.name}</b>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {profile.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{profile.skills}</p>
              <p className="mt-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  {profile.years} năm
                </span>
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-1">
                  {profile.location}
                </span>
              </p>
            </div>
            <b className="text-[#008f40]">{profile.score}% phù hợp</b>
            <button
              onClick={() => setSelected(profile.name)}
              className="rounded-lg bg-[#e7f9ef] px-3 py-2 text-sm font-bold text-[#008f40]"
            >
              Xem hồ sơ
            </button>
          </article>
        ))}
        {result.length === 0 && (
          <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
            Chưa có hồ sơ công khai phù hợp với bộ lọc này.
          </div>
        )}
      </div>
      {selected && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
          <div>
            <b>Hồ sơ {selected}</b>
            <p className="mt-1 text-slate-600">
              Thông tin liên hệ sẽ sử dụng một lượt mở CV trong gói hiện tại.
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
function Messages() {
  return (
    <Panel title="Tin nhắn với ứng viên">
      <p className="text-sm text-slate-500">
        Chỉ hiển thị các cuộc trò chuyện mà công ty đã tạo với ứng viên hoặc từ
        một hồ sơ ứng tuyển.
      </p>
      <Link
        href="/employer/messages"
        className="mt-5 inline-flex rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-bold text-white"
      >
        Mở hộp thư
      </Link>
    </Panel>
  );
}
function AnalyticsV2() {
  const reportCatalog = [
    {
      title: "Senior Front-end Developer",
      category: "Công nghệ thông tin",
      position: "Lập trình Front-end",
    },
    {
      title: "UI/UX Designer",
      category: "Công nghệ thông tin",
      position: "Thiết kế UI/UX",
    },
    {
      title: "Nhân viên Kinh doanh B2B",
      category: "Kinh doanh / Bán hàng",
      position: "Chuyên viên kinh doanh",
    },
  ];
  const [job, setJob] = useState("Tất cả tin tuyển dụng");
  const [jobMenuOpen, setJobMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(
    reportCatalog[0].category,
  );
  const [activePosition, setActivePosition] = useState(
    reportCatalog[0].position,
  );
  const [period, setPeriod] = useState("30 ngày gần nhất");
  const periodFactor =
    period === "7 ngày gần nhất"
      ? 0.34
      : period === "Trong thời hạn gói"
        ? 1.18
        : 1;
  const baseRows =
    job === "Tất cả tin tuyển dụng"
      ? reportRows
      : reportRows.filter((row) => row.title === job);
  const rows = baseRows.map((row) => ({
    ...row,
    applications: Math.round(row.applications * periodFactor),
    reviewing: Math.round(row.reviewing * periodFactor),
    interviews: Math.round(row.interviews * periodFactor),
    hired: Math.round(row.hired * periodFactor),
    rejected: Math.round(row.rejected * periodFactor),
  }));
  const totals = rows.reduce(
    (sum, row) => ({
      applications: sum.applications + row.applications,
      reviewing: sum.reviewing + row.reviewing,
      interviews: sum.interviews + row.interviews,
      hired: sum.hired + row.hired,
      rejected: sum.rejected + row.rejected,
      weightedFit: sum.weightedFit + row.averageFit * row.applications,
    }),
    {
      applications: 0,
      reviewing: 0,
      interviews: 0,
      hired: 0,
      rejected: 0,
      weightedFit: 0,
    },
  );
  const fresh = Math.max(
    0,
    totals.applications -
      totals.reviewing -
      totals.interviews -
      totals.hired -
      totals.rejected,
  );
  const processed = totals.applications - fresh;
  const processedRate = totals.applications
    ? Math.round((processed / totals.applications) * 100)
    : 0;
  const averageFit = totals.applications
    ? Math.round(totals.weightedFit / totals.applications)
    : 0;
  const hireRate = totals.applications
    ? Math.round((totals.hired / totals.applications) * 100)
    : 0;
  const trendBase =
    period === "7 ngày gần nhất"
      ? [4, 7, 5, 11, 8, 12, 9]
      : period === "Trong thời hạn gói"
        ? [18, 26, 31, 29, 37, 34]
        : [22, 31, 28, 36, 31];
  const trendScale = totals.applications ? totals.applications / 148 : 0;
  const trendValues = trendBase.map((value) =>
    Math.max(1, Math.round(value * trendScale)),
  );
  const processedTrend = trendValues.map((value, index) =>
    Math.max(0, Math.round(value * (0.72 + index * 0.025))),
  );
  const trendLabels =
    period === "7 ngày gần nhất"
      ? ["23/08", "24/08", "25/08", "26/08", "27/08", "28/08", "29/08"]
      : period === "Trong thời hạn gói"
        ? ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4", "Tuần 5", "Tuần 6"]
        : ["01–07", "08–14", "15–21", "22–28", "29–30"];
  const trendData = trendLabels.map((label, index) => ({
    label,
    applications: trendValues[index],
    processed: processedTrend[index],
  }));
  const chartConfig = {
    applications: { label: "Hồ sơ nhận được", color: "#00a84f" },
    processed: { label: "Hồ sơ đã xử lý", color: "#2563eb" },
  } satisfies ChartConfig;
  const trendTotal = trendValues.reduce((sum, value) => sum + value, 0);
  const trendAverage = Math.round(trendTotal / trendValues.length);
  const trendChange =
    trendValues.length > 1 && trendValues[trendValues.length - 2]
      ? Math.round(
          ((trendValues.at(-1)! - trendValues.at(-2)!) / trendValues.at(-2)!) *
            100,
        )
      : 0;
  const exportCsv = () => {
    const lines = [
      [
        "Tin tuyển dụng",
        "Tổng hồ sơ",
        "Mới nhận",
        "Đang xem",
        "Mời phỏng vấn",
        "Đã tuyển",
        "Từ chối",
        "Điểm phù hợp TB",
      ],
      ...rows.map((row) => [
        row.title,
        row.applications,
        Math.max(
          0,
          row.applications -
            row.reviewing -
            row.interviews -
            row.hired -
            row.rejected,
        ),
        row.reviewing,
        row.interviews,
        row.hired,
        row.rejected,
        row.averageFit,
      ]),
    ];
    const csv = lines
      .map((line) => line.map((value) => `"${value}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download =
      job === "Tất cả tin tuyển dụng"
        ? "bao-cao-tuyen-dung.csv"
        : `bao-cao-${job.toLowerCase().replaceAll(" ", "-")}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-[#e7f9ef] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <b className="text-[#087b43]">Báo cáo tuyển dụng</b>
            <p className="mt-1 text-xs text-slate-600">
              Chọn một tin để xem báo cáo riêng, hoặc tổng hợp toàn bộ tin tuyển
              dụng.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(320px,1fr)_190px_auto]">
            <div className="relative text-xs font-bold text-slate-600">
              <span>Tin tuyển dụng</span>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={jobMenuOpen}
                onClick={() => setJobMenuOpen((open) => !open)}
                className="mt-1.5 flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 text-left text-sm font-normal text-slate-800"
              >
                <span className="truncate">{job}</span>
                <span
                  className={`transition ${jobMenuOpen ? "rotate-180" : ""}`}
                >
                  ⌄
                </span>
              </button>
              {jobMenuOpen && (
                <div className="absolute left-0 top-full z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl">
                  <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    Danh mục nghề
                  </p>
                  <button
                    onClick={() => {
                      setJob("Tất cả tin tuyển dụng");
                      setJobMenuOpen(false);
                    }}
                    className="mb-1 flex w-full items-center justify-between rounded-lg bg-emerald-50 px-3 py-2.5 text-left text-sm font-bold text-[#008f40]"
                  >
                    <span>Tất cả tin tuyển dụng</span>
                    <span>{reportCatalog.length}</span>
                  </button>
                  {Array.from(
                    new Set(reportCatalog.map((item) => item.category)),
                  ).map((category) => (
                    <div
                      key={category}
                      className="group/category relative"
                      onMouseEnter={() => {
                        setActiveCategory(category);
                        const first = reportCatalog.find(
                          (item) => item.category === category,
                        );
                        if (first) setActivePosition(first.position);
                      }}
                    >
                      <button
                        onClick={() => {
                          setActiveCategory(category);
                          const first = reportCatalog.find(
                            (item) => item.category === category,
                          );
                          if (first) setActivePosition(first.position);
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-[#008f40]"
                      >
                        <span>{category}</span>
                        <span className="text-lg text-slate-400">›</span>
                      </button>
                      <div
                        className={`absolute left-full top-0 ml-1 hidden w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl group-hover/category:block ${activeCategory === category ? "max-sm:block" : ""}`}
                      >
                        <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Vị trí chuyên môn
                        </p>
                        {Array.from(
                          new Set(
                            reportCatalog
                              .filter((item) => item.category === category)
                              .map((item) => item.position),
                          ),
                        ).map((position) => (
                          <div
                            key={position}
                            className="group/position relative"
                            onMouseEnter={() => setActivePosition(position)}
                          >
                            <button
                              onClick={() => setActivePosition(position)}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-[#008f40]"
                            >
                              <span>{position}</span>
                              <span className="text-lg text-slate-400">›</span>
                            </button>
                            <div
                              className={`absolute left-full top-0 ml-1 hidden w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl group-hover/position:block ${activeCategory === category && activePosition === position ? "max-sm:block" : ""}`}
                            >
                              <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Tin tuyển dụng
                              </p>
                              {reportCatalog
                                .filter(
                                  (item) =>
                                    item.category === category &&
                                    item.position === position,
                                )
                                .map((item) => (
                                  <button
                                    key={item.title}
                                    onClick={() => {
                                      setJob(item.title);
                                      setJobMenuOpen(false);
                                    }}
                                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm hover:bg-emerald-50 ${job === item.title ? "bg-emerald-50 font-bold text-[#008f40]" : "font-medium text-slate-700"}`}
                                  >
                                    {item.title}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="mt-2 border-t px-3 pt-3 text-[11px] font-normal leading-4 text-slate-400">
                    Rê chuột hoặc nhấn vào từng mục để mở menu cấp tiếp theo.
                  </p>
                </div>
              )}
            </div>
            <label className="text-xs font-bold text-slate-600">
              Thời gian
              <select
                aria-label="Thời gian báo cáo"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="mt-1.5 w-full rounded-xl border bg-white px-3 py-2.5 text-sm font-normal"
              >
                <option>7 ngày gần nhất</option>
                <option>30 ngày gần nhất</option>
                <option>Trong thời hạn gói</option>
              </select>
            </label>
            <button
              onClick={exportCsv}
              className="self-end inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Download className="size-4 shrink-0" />
              Xuất CSV
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-200 pt-4 text-xs text-slate-600">
          <span>
            Đang xem: <b className="text-[#087b43]">{job}</b> · {period}
          </span>
          {job !== "Tất cả tin tuyển dụng" && (
            <button
              onClick={() => setJob("Tất cả tin tuyển dụng")}
              className="font-bold text-[#008f40]"
            >
              Xem tất cả tin
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Tổng hồ sơ" value={totals.applications} note={period} />
        <Metric label="Mới nhận" value={fresh} note="Chưa được xem" />
        <Metric
          label="Đã xử lý"
          value={processed}
          note={`${processedRate}% tổng hồ sơ`}
        />
        <Metric
          label="Đã tuyển"
          value={totals.hired}
          note={`${hireRate}% tổng hồ sơ`}
        />
        <Metric
          label="Phản hồi trung bình"
          value={18}
          note="Từ lúc ứng tuyển"
          suffix=" giờ"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel title="Xu hướng hồ sơ theo thời gian">
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Tổng trong kỳ</p>
              <b className="mt-1 block text-xl text-slate-800">
                {trendTotal} hồ sơ
              </b>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Trung bình mỗi mốc</p>
              <b className="mt-1 block text-xl text-slate-800">
                {trendAverage} hồ sơ
              </b>
            </div>
            <div
              className={`rounded-xl p-3 ${trendChange >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}
            >
              <p className="text-xs text-slate-500">So với mốc trước</p>
              <b
                className={`mt-1 block text-xl ${trendChange >= 0 ? "text-[#008f40]" : "text-rose-600"}`}
              >
                {trendChange >= 0 ? "+" : ""}
                {trendChange}%
              </b>
            </div>
          </div>
          <ChartContainer
            config={chartConfig}
            className="h-[300px] w-full aspect-auto"
          >
            <AreaChart
              data={trendData}
              margin={{ left: 4, right: 12, top: 12, bottom: 4 }}
            >
              <defs>
                <linearGradient
                  id="fillApplications"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-applications)"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-applications)"
                    stopOpacity={0.03}
                  />
                </linearGradient>
                <linearGradient id="fillProcessed" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-processed)"
                    stopOpacity={0.22}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-processed)"
                    stopOpacity={0.02}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={30}
              />
              <ChartTooltip
                cursor={{ stroke: "#94a3b8", strokeDasharray: "4 4" }}
                content={<ChartTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="applications"
                type="monotone"
                fill="url(#fillApplications)"
                stroke="var(--color-applications)"
                strokeWidth={3}
                dot={{ r: 4, fill: "white", strokeWidth: 3 }}
                activeDot={{ r: 6 }}
              />
              <Area
                dataKey="processed"
                type="monotone"
                fill="url(#fillProcessed)"
                stroke="var(--color-processed)"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "white", strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ChartContainer>
        </Panel>
        <Panel title="Phân bố trạng thái hiện tại">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusSummary
              label="Mới nhận"
              value={fresh}
              tone="bg-slate-100 text-slate-700"
            />
            <StatusSummary
              label="Đang xem"
              value={totals.reviewing}
              tone="bg-blue-50 text-blue-700"
            />
            <StatusSummary
              label="Mời phỏng vấn"
              value={totals.interviews}
              tone="bg-amber-50 text-amber-700"
            />
            <StatusSummary
              label="Đã tuyển"
              value={totals.hired}
              tone="bg-emerald-50 text-emerald-700"
            />
            <StatusSummary
              label="Từ chối"
              value={totals.rejected}
              tone="bg-rose-50 text-rose-700"
            />
            <StatusSummary
              label="Phù hợp trung bình"
              value={averageFit}
              tone="bg-violet-50 text-violet-700"
            />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Mỗi hồ sơ chỉ được tính ở trạng thái hiện tại, không phải số lượt
            từng đi qua mỗi bước.
          </p>
        </Panel>
      </div>
      <Panel
        title={
          job === "Tất cả tin tuyển dụng"
            ? "Hiệu quả theo tin tuyển dụng"
            : `Hiệu quả · ${job}`
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Tin tuyển dụng</th>
                <th>Tổng</th>
                <th>Mới nhận</th>
                <th>Đang xem</th>
                <th>Mời phỏng vấn</th>
                <th>Đã tuyển</th>
                <th>Từ chối</th>
                <th>Phù hợp TB</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const rowFresh = Math.max(
                  0,
                  row.applications -
                    row.reviewing -
                    row.interviews -
                    row.hired -
                    row.rejected,
                );
                return (
                  <tr key={row.title} className="border-t">
                    <td className="p-3 font-bold">{row.title}</td>
                    <td>{row.applications}</td>
                    <td>{rowFresh}</td>
                    <td>{row.reviewing}</td>
                    <td>{row.interviews}</td>
                    <td>{row.hired}</td>
                    <td>{row.rejected}</td>
                    <td>
                      <span className="rounded-full bg-[#e7f9ef] px-2.5 py-1 font-bold text-[#008f40]">
                        {row.averageFit}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
function Analytics() {
  const [job, setJob] = useState("Tất cả tin");
  const [period, setPeriod] = useState("30 ngày gần nhất");
  const rows =
    job === "Tất cả tin"
      ? reportRows
      : reportRows.filter((row) => row.title === job);
  const totals = rows.reduce(
    (sum, row) => ({
      applications: sum.applications + row.applications,
      reviewing: sum.reviewing + row.reviewing,
      interviews: sum.interviews + row.interviews,
      hired: sum.hired + row.hired,
      rejected: sum.rejected + row.rejected,
      weightedFit: sum.weightedFit + row.averageFit * row.applications,
    }),
    {
      applications: 0,
      reviewing: 0,
      interviews: 0,
      hired: 0,
      rejected: 0,
      weightedFit: 0,
    },
  );
  const newCount = Math.max(
    0,
    totals.applications -
      totals.reviewing -
      totals.interviews -
      totals.hired -
      totals.rejected,
  );
  const averageFit = totals.applications
    ? Math.round(totals.weightedFit / totals.applications)
    : 0;
  const processed = totals.applications - newCount;
  const processedRate = totals.applications
    ? Math.round((processed / totals.applications) * 100)
    : 0;
  const hireRate = totals.applications
    ? Math.round((totals.hired / totals.applications) * 100)
    : 0;
  const exportCsv = () => {
    const lines = [
      [
        "Tin tuyển dụng",
        "Tổng hồ sơ",
        "Mới nhận",
        "Đang xem",
        "Mời phỏng vấn",
        "Đã tuyển",
        "Từ chối",
        "Điểm phù hợp TB",
      ],
      ...rows.map((row) => [
        row.title,
        row.applications,
        Math.max(
          0,
          row.applications -
            row.reviewing -
            row.interviews -
            row.hired -
            row.rejected,
        ),
        row.reviewing,
        row.interviews,
        row.hired,
        row.rejected,
        row.averageFit,
      ]),
    ];
    const csv = lines
      .map((line) => line.map((value) => `"${value}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "bao-cao-tuyen-dung.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-[#e7f9ef] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <b className="text-[#087b43]">Báo cáo tuyển dụng</b>
            <p className="mt-1 text-xs text-slate-600">
              Theo dõi hiệu quả xử lý hồ sơ từ <code>job_posts</code> và{" "}
              <code>applications</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="rounded-xl border bg-white px-3 py-2 text-sm"
            >
              <option>Tất cả tin</option>
              {reportRows.map((row) => (
                <option key={row.title}>{row.title}</option>
              ))}
            </select>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="rounded-xl border bg-white px-3 py-2 text-sm"
            >
              <option>7 ngày gần nhất</option>
              <option>30 ngày gần nhất</option>
              <option>Trong thời hạn gói</option>
            </select>
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00b14f] px-4 py-2 text-sm font-bold text-white"
            >
              <Download className="size-4" />
              Xuất CSV
            </button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Tổng hồ sơ" value={totals.applications} note={period} />
        <Metric
          label="Hồ sơ chưa xử lý"
          value={newCount}
          note="Cần nhà tuyển dụng xem"
        />
        <Metric
          label="Tỷ lệ đã xử lý"
          value={processedRate}
          note={`${processed}/${totals.applications} hồ sơ`}
          suffix="%"
        />
        <Metric
          label="Điểm phù hợp TB"
          value={averageFit}
          note="Từ applications.fit_score"
          suffix="%"
        />
      </div>
      <Panel title="Trạng thái hồ sơ">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatusSummary
            label="Mới nhận"
            value={newCount}
            tone="bg-slate-100 text-slate-700"
          />
          <StatusSummary
            label="Đang xem"
            value={totals.reviewing}
            tone="bg-blue-50 text-blue-700"
          />
          <StatusSummary
            label="Mời phỏng vấn"
            value={totals.interviews}
            tone="bg-amber-50 text-amber-700"
          />
          <StatusSummary
            label="Đã tuyển"
            value={totals.hired}
            tone="bg-emerald-50 text-emerald-700"
          />
          <StatusSummary
            label="Từ chối"
            value={totals.rejected}
            tone="bg-rose-50 text-rose-700"
          />
        </div>
        <p className="mt-4 text-xs text-slate-500">
          Tỷ lệ tuyển thành công hiện tại: <b>{hireRate}%</b>. Các trạng thái
          được lấy trực tiếp từ <code>applications.status</code>.
        </p>
      </Panel>
      <Panel title="Hiệu quả theo tin tuyển dụng">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-3">Tin tuyển dụng</th>
                <th>Tổng</th>
                <th>Mới nhận</th>
                <th>Đang xem</th>
                <th>Phỏng vấn</th>
                <th>Đã tuyển</th>
                <th>Từ chối</th>
                <th>Phù hợp TB</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const fresh = Math.max(
                  0,
                  row.applications -
                    row.reviewing -
                    row.interviews -
                    row.hired -
                    row.rejected,
                );
                return (
                  <tr key={row.title} className="border-t">
                    <td className="p-3 font-bold">{row.title}</td>
                    <td>{row.applications}</td>
                    <td>{fresh}</td>
                    <td>{row.reviewing}</td>
                    <td>{row.interviews}</td>
                    <td>{row.hired}</td>
                    <td>{row.rejected}</td>
                    <td>
                      <span className="rounded-full bg-[#e7f9ef] px-2.5 py-1 font-bold text-[#008f40]">
                        {row.averageFit}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
function Metric({
  label,
  value,
  note,
  suffix = "",
}: {
  label: string;
  value: number;
  note: string;
  suffix?: string;
}) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <span className="size-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
        {value}
        {suffix}
      </p>
      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </div>
  );
}
function StatusSummary({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`rounded-xl p-4 ${tone}`}>
      <p className="text-xs font-semibold">{label}</p>
      <b className="mt-2 block text-2xl">{value}</b>
    </div>
  );
}
function FunnelRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage = max ? Math.max(3, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className="h-9 overflow-hidden rounded-lg bg-slate-100">
        <div
          style={{ width: `${percentage}%` }}
          className="flex h-full min-w-10 items-center justify-end rounded-lg bg-gradient-to-r from-[#00b14f] to-[#48d989] pr-3 text-xs font-bold text-white"
        >
          {percentage}%
        </div>
      </div>
    </div>
  );
}
function Billing() {
  const [payment, setPayment] = useState("VNPay");
  return (
    <div className="space-y-6">
      <Panel title="Gói dịch vụ đang dùng">
        <div className="rounded-xl bg-[#e7f9ef] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <b className="text-[#087b43]">Gói Tuyển dụng Pro</b>
              <p className="mt-1 text-sm text-slate-600">
                Còn 18 ngày · hết hạn 15/09/2026
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#008f40]">
              Đang hoạt động
            </span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Quota label="Tin đã đăng hôm nay" value="2/5" />
            <Quota label="Lượt đẩy tin còn lại" value="4/5" />
            <Quota label="CV đã mở liên hệ" value="28/100" />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Giới hạn đăng tin được làm mới lúc 00:00 mỗi ngày. Hiện có 12/15 tin
            đang hiển thị.
          </p>
          <button className="mt-4 rounded-xl bg-[#00b14f] px-4 py-2.5 text-sm font-bold text-white">
            Gia hạn gói
          </button>
        </div>
      </Panel>
      <Panel title="Hóa đơn & thanh toán">
        <div className="flex flex-wrap gap-3">
          {["VNPay", "MoMo", "Chuyển khoản"].map((x) => (
            <button
              key={x}
              onClick={() => setPayment(x)}
              className={`rounded-xl border px-4 py-3 text-sm font-bold ${payment === x ? "border-[#00b14f] bg-[#e7f9ef] text-[#087b43]" : ""}`}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
          <b>Hóa đơn #ON-0826</b>
          <p className="mt-1 text-slate-500">
            Gia hạn Tuyển dụng Pro 30 ngày · 1.990.000đ · Chờ thanh toán bằng{" "}
            {payment}
          </p>
          <button className="mt-3 text-sm font-bold text-[#008f40]">
            Thanh toán ngay →
          </button>
        </div>
      </Panel>
    </div>
  );
}
function Quota({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#008f40]">{value}</p>
    </div>
  );
}
function Company() {
  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const { register, control, handleSubmit, setError, formState: {errors, isSubmitting} } = useForm<CompanyProfile>({
    mode: "onChange",
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {},
  });
  useEffect(() => {}, []);
  const submit = () => {

  }
  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      onChange={() => {}}
    >
      <fieldset
        disabled={isSubmitting}
        className="min-w-0 space-y-6 disabled:opacity-70"
      >
        <Panel title="Hồ sơ doanh nghiệp">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div
              className="relative h-36 bg-[linear-gradient(110deg,#064e2d,#00b14f,#48d597)] bg-cover bg-center"
              style={
                bannerUrl
                  ? { backgroundImage: `url(${JSON.stringify(bannerUrl)})` }
                  : undefined
              }
            >
            </div>
            <div className="flex flex-wrap items-end gap-4 bg-white px-5 pb-5">
              <div className="relative -mt-10">
                <Avatar className="size-24 rounded-2xl border-4 border-white bg-emerald-50">
                  <AvatarImage
                    src={logoUrl || undefined}
                    // alt={`Logo ${companyName || "công ty"}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-xl bg-emerald-50 text-2xl font-black text-[#008f40]">
                    {/* {initials} */}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pb-1">
                <h3 className="font-bold text-slate-800">
                  {/* {companyName || "Tên công ty"} */}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {/* Mã công ty: {systemInfo?.companyCode || "—"} ·{" "}
                  {systemInfo?.verificationStatus ||
                    "Chưa có thông tin xác minh"} */}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Logo tối đa 2 MB, ảnh bìa tối đa 5 MB. Hỗ trợ JPG, PNG, WebP.
          </p>
          <FieldError
            // id={`${id}-logoFile-error`}
            // message={errors.logoFile?.message}
          />
          <FieldError
            // id={`${id}-coverFile-error`}
            // message={errors.coverFile?.message}
          />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {/* {textFields.map(({ name, label, type, required }) => (
              <div key={name}>
                <label htmlFor={`${id}-${name}`} className="text-sm font-bold">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  id={`${id}-${name}`}
                  type={type}
                  required={required}
                  {...register(name)}
                  className={inputClass}
                  aria-invalid={!!errors[name]}
                  aria-describedby={
                    errors[name] ? `${id}-${name}-error` : undefined
                  }
                />
                <FieldError
                  id={`${id}-${name}-error`}
                  message={errors[name]?.message}
                />
              </div>
            ))} */}
            <div>
              <label
                // htmlFor={`${id}-companySize`}
                className="text-sm font-bold"
              >
                Quy mô doanh nghiệp
              </label>
              <select
                // id={`${id}-companySize`}
                {...register("size")}
                // className={inputClass}
                // aria-invalid={!!errors.companySize}
                // aria-describedby={
                //   errors.companySize ? `${id}-companySize-error` : undefined
                // }
              >
                <option value="">Chọn quy mô</option>
                {COMPANY_SIZE_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <FieldError
                // id={`${id}-companySize-error`}
                // message={errors.companySize?.message}
              />
            </div>
            <div>
              <label htmlFor={`${id}-city`} className="text-sm font-bold">
                Tỉnh/thành phố
              </label>
              <select
                id={`${id}-city`}
                {...register("city")}
                className={inputClass}
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? `${id}-city-error` : undefined}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {CITY_OPTIONS.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <FieldError
                id={`${id}-city-error`}
                message={errors.city?.message}
              />
            </div>
            <div>
              <label htmlFor={`${id}-address`} className="text-sm font-bold">
                Địa chỉ chi tiết
              </label>
              <input
                id={`${id}-address`}
                {...register("address")}
                className={inputClass}
                aria-invalid={!!errors.address}
                aria-describedby={
                  errors.address ? `${id}-address-error` : undefined
                }
              />
              <FieldError
                id={`${id}-address-error`}
                message={errors.address?.message}
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor={`${id}-description`}
                className="text-sm font-bold"
              >
                Giới thiệu doanh nghiệp
              </label>
              <textarea
                id={`${id}-description`}
                {...register("description")}
                maxLength={2000}
                className={`${inputClass} h-32 resize-y leading-6`}
                aria-invalid={!!errors.description}
                aria-describedby={
                  errors.description ? `${id}-description-error` : undefined
                }
              />
              <span className="mt-1 block text-right text-xs text-slate-400">
                {description.length}/2000 ký tự
              </span>
              <FieldError
                id={`${id}-description-error`}
                message={errors.description?.message}
              />
            </div>
          </div>
        </Panel>
        <Panel title="Thông tin hệ thống">
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Mã công ty", systemInfo?.companyCode],
              ["Tài khoản sở hữu", systemInfo?.ownerEmail],
              ["Gói dịch vụ", systemInfo?.servicePlan],
              ["Trạng thái xác minh", systemInfo?.verificationStatus],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="mt-1 text-sm font-semibold">{value || "—"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-slate-500">
            Mã công ty, tài khoản sở hữu, gói dịch vụ và trạng thái xác minh
            được hệ thống quản lý nên không thể sửa tại đây.
          </p>
        </Panel>
        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-slate-200 pt-5">
          {errors.root?.server?.message && (
            <p role="alert" className="text-sm text-red-600">
              {errors.root.server.message}
            </p>
          )}
          {saved && (
            <p role="status" className="text-sm text-emerald-700">
              Đã lưu thay đổi.
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#00b14f] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#009b45] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
function CompanyInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border p-3 font-normal"
        required={required}
      />
    </label>
  );
}
function SystemField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-700">{value}</p>
    </div>
  );
}
