"use client";
import { Children, isValidElement, useEffect, useState, type ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccountStore } from "@/stores/auth.store";
import { httpRequest } from "@/lib/utils";
import { logoutAction } from "@/actions/auth.action";
import { RoleFooter } from "./role-footer";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const adminQueryRefresh = {
  staleTime: 60_000,
  refetchInterval: 120_000,
  refetchOnWindowFocus: true,
  refetchIntervalInBackground: false,
} as const;

function AdminSelect({value,onChange,children,className,required,"aria-label":ariaLabel}: {
  value:string|number;
  onChange:(event:{target:{value:string}})=>void;
  children:ReactNode;
  className?:string;
  required?:boolean;
  "aria-label"?:string;
}) {
  const options = Children.toArray(children).filter(isValidElement<{value:string|number;children:ReactNode}>).map(option=>({value:String(option.props.value),label:option.props.children}));
  const selected=options.find(option=>option.value===String(value));
  return <Select value={String(value)} required={required} onValueChange={next=>{if(next!==null)onChange({target:{value:next}});}}>
    <SelectTrigger aria-label={ariaLabel} className={className+" h-auto min-h-10 gap-3 rounded-xl bg-white px-3 py-2"}>
      <SelectValue>{selected?.label ?? "Chọn…"}</SelectValue>
    </SelectTrigger>
    <SelectContent align="start" alignItemWithTrigger={false} className="max-w-[calc(100vw-2rem)]">
      {options.map(option=><SelectItem key={option.value} value={option.value} className="whitespace-normal break-words">{option.label}</SelectItem>)}
    </SelectContent>
  </Select>;
}

function useAdminTab(key: string, allowed: readonly string[], fallback: string) {
  const params = useSearchParams();
  const value = params.get(key) ?? fallback;
  const selected = allowed.includes(value) ? value : fallback;
  const select = (next: string) => {
    if (!allowed.includes(next)) return;
    const url = new URL(window.location.href);
    url.searchParams.set(key, next);
    if (key === "tab") url.searchParams.delete("subtab");
    window.history.pushState(null, "", url.pathname + url.search + url.hash);
  };
  return [selected, select] as const;
}

const nav = [
  ["overview", "Tổng quan", LayoutDashboard],
  ["jobs", "Tin tuyển dụng", BriefcaseBusiness],
  ["companies", "Doanh nghiệp", Building2],
  ["approvals", "Duyệt nội dung", ShieldCheck],
  ["accounts", "Tài khoản", Users],
  ["revenue", "Đơn hàng & thanh toán", BarChart3],
  ["revenue-report", "Doanh thu", BarChart3],
  ["plans", "Gói dịch vụ", Package],
  ["notifications", "Thông báo hệ thống", Bell],
  ["data", "Danh mục hệ thống", Tags],
] as const;
const labels: Record<string, string> = {
  PENDING: "Chờ duyệt",
  PUBLISHED: "Đang hiển thị",
  PAUSED: "Tạm dừng",
  REJECTED: "Bị từ chối",
  CLOSED: "Đã đóng",
  EXPIRED: "Hết hạn",
  active: "Hoạt động",
  blocked: "Đã khóa",
  pending: "Chờ xác minh",
  verified: "Đã xác minh",
  rejected: "Bị từ chối",
  candidate: "Ứng viên",
  company: "Nhà tuyển dụng",
  admin: "Quản trị viên",
  available: "Khả dụng",
  coming_soon: "Đang phát triển",
  disabled: "Ngừng cung cấp",
};
const fieldLabels: Record<string, string> = {
  id: "ID",
  email: "Email",
  role: "Vai trò",
  status: "Trạng thái",
  title: "Tiêu đề",
  name: "Tên",
  fullName: "Họ tên",
  description: "Mô tả",
  requirements: "Yêu cầu",
  benefits: "Quyền lợi",
  createdAt: "Ngày tạo",
  deadlineAt: "Hạn nộp",
  website: "Website",
  taxCode: "Mã số thuế",
  verificationStatus: "Xác minh",
  actor: "Người thực hiện",
  entityType: "Đối tượng",
  entityId: "ID đối tượng",
  action: "Hành động",
  beforeData: "Trước thay đổi",
  afterData: "Sau thay đổi",
  company: "Doanh nghiệp",
  candidate: "Ứng viên",
  account: "Tài khoản",
  location: "Địa điểm",
  price: "Giá",
  code: "Mã",
  audience: "Đối tượng",
  availability: "Khả dụng",
  isActive: "Đang hoạt động",
  isFree: "Miễn phí",
  durationDays: "Thời hạn (ngày)",
  readAt: "Ngày đọc",
  recipient: "Người nhận",
  category: "Ngành nghề",
  province: "Tỉnh/thành",
  provinceId: "ID tỉnh/thành",
  jobCategoryId: "ID ngành nghề",
  verifyEmail: "Đã xác minh email",
  lastLoginAt: "Đăng nhập gần nhất",
  _count: "Số lượng",
  applications: "Hồ sơ ứng tuyển",
  jobPosts: "Tin tuyển dụng",
};
const input = "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm";
const button =
  "rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
type Row = Record<string, unknown> & { id: string };
type Page = { items: Row[]; total: number; pages: number };
type Benefit = {
  entitlementId: string;
  value: number | string | boolean;
  entitlement: { code: string; name: string };
};
async function get<T>(path: string, params?: object): Promise<T> {
  return (await httpRequest.get("/admin/" + path, { params })).data.data;
}
function str(value: unknown) {
  return value == null ? "" : String(value);
}
function nested(row: Row, key: string, field: string) {
  return str((row[key] as Record<string, unknown> | undefined)?.[field]);
}
function errorText(error: unknown) {
  const e = error as {
    response?: { data?: { errors?: { message?: string }; message?: string } };
  };
  return (
    e?.response?.data?.errors?.message ??
    e?.response?.data?.message ??
    "Không thể thực hiện. Vui lòng thử lại."
  );
}
function date(value: unknown) {
  return value ? new Date(String(value)).toLocaleString("vi-VN") : "—";
}
function money(value: unknown) {
  return Number(value ?? 0).toLocaleString("vi-VN") + " đ";
}
function Status({ value }: { value: unknown }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs">
      {labels[str(value)] ?? (str(value) || "—")}
    </span>
  );
}
function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {children}
    </section>
  );
}
function Failure({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
      {errorText(error)}{" "}
      <button className="underline" onClick={retry}>
        Thử lại
      </button>
    </div>
  );
}

export function AdminDashboard() {
  const account = useAccountStore((s) => s.account),
    router = useRouter();
  const [tab, setTab] = useAdminTab("tab", nav.map(([id]) => id), "overview");
  const [mobile, setMobile] = useState(false);
  const session = useQuery({
    ...adminQueryRefresh,
    queryKey: ["admin-session"],
    queryFn: () => useAccountStore.getState().setAccount(),
    retry: false,
  });
  const logout = useMutation({
    mutationFn: logoutAction,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      useAccountStore.getState().reset();
      router.replace("/login");
    },
    onError: () => toast.error("Không thể đăng xuất"),
  });
  useEffect(() => {
    if (session.isSuccess && session.data.role !== "admin")
      router.replace(session.data.role === "company" ? "/employer" : "/");
    if (session.isError) router.replace("/login");
  }, [session.isSuccess, session.isError, session.data, router]);
  if (!account || account.role !== "admin")
    return <p className="p-8">Đang kiểm tra quyền quản trị…</p>;
  const select = (id: string) => {
    setTab(id);
    setMobile(false);
  };
  const links = (
    <nav className="space-y-1">
      {nav.map(([id, label, Icon]) => (
        <button
          key={id}
          onClick={() => select(id)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${tab === id ? "bg-emerald-600 text-white" : "text-slate-300 hover:bg-white/10"}`}
        >
          <Icon className="size-4" />
          {label}
        </button>
      ))}
    </nav>
  );
  return (
    <main className="fixed inset-0 flex h-dvh flex-col overflow-hidden bg-slate-50">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-5">
        <div className="flex items-center gap-3">
          <button
            aria-label="Mở menu"
            onClick={() => setMobile(!mobile)}
            className="lg:hidden"
          >
            <Menu />
          </button>
          <b className="text-xl">TopCV Admin</b>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-500 sm:block">
            {account.email}
          </span>
          <button
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
            className="flex items-center gap-2 text-sm font-semibold text-red-600"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </button>
        </div>
      </header>
      {mobile && (
        <aside className="max-h-[calc(100dvh-4rem)] shrink-0 overflow-auto bg-slate-900 p-3 lg:hidden">
          {links}
        </aside>
      )}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[250px_1fr]">
        <aside className="hidden min-h-0 overflow-auto bg-slate-900 p-4 lg:block">
          {links}
        </aside>
        <div className="flex min-h-0 min-w-0 flex-col">
          <section className="min-h-0 flex-1 space-y-5 overflow-auto p-4 sm:p-8">
            <h1 className="text-2xl font-bold">
              {nav.find((n) => n[0] === tab)?.[1]}
            </h1>
            {tab === "overview" ? (
              <Overview open={select} />
            ) : tab === "revenue-report" ? (
              <RevenueReport />
            ) : tab === "revenue" ? (
              <AdminList resource="orders" />
            ) : tab === "approvals" ? (
              <Approvals />
            ) : tab === "data" ? (
              <MasterData />
            ) : (
              <AdminList key={tab} resource={tab} />
            )}
          </section>
          <div className="shrink-0">
            <RoleFooter variant="admin" />
          </div>
        </div>
      </div>
    </main>
  );
}
function Overview({ open }: { open: (tab: string) => void }) {
  const q = useQuery({
    ...adminQueryRefresh,
    queryKey: ["admin", "overview"],
    queryFn: () =>
      get<{
        accounts: number;
        companies: number;
        jobs: number;
        pendingJobs: number;
        pendingCompanies: number;
        pendingOrders: number;
        revenue: string;
        successfulPayments: number;
        recent: Row[];
      }>("overview"),
  });
  if (q.isPending) return <p>Đang tải…</p>;
  if (q.isError)
    return <Failure error={q.error} retry={() => void q.refetch()} />;
  const d = q.data;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Doanh thu thực thu", money(d.revenue)],
          ["Tài khoản hoạt động", d.accounts],
          ["Doanh nghiệp", d.companies],
          ["Tin tuyển dụng", d.jobs],
        ].map(([label, value]) => (
          <Panel key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-700">{value}</p>
          </Panel>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel>
          <h2 className="mb-4 font-bold">Cần xử lý</h2>
          {[
            ["Tin chờ duyệt", d.pendingJobs, "approvals"],
            ["Doanh nghiệp chờ xác minh", d.pendingCompanies, "approvals"],
            ["Đơn chờ thanh toán", d.pendingOrders, "revenue"],
          ].map(([label, value, tab]) => (
            <button
              key={label}
              onClick={() => open(String(tab))}
              className="mb-2 flex w-full justify-between rounded-xl bg-slate-50 p-4 text-left"
            >
              <span>{label}</span>
              <b>{value}</b>
            </button>
          ))}
          <p className="mt-3 text-xs text-slate-500">
            Doanh thu tính từ {d.successfulPayments} khoản thanh toán thành
            công.
          </p>
        </Panel>
        <Panel>
          <h2 className="mb-4 font-bold">Hoạt động gần đây</h2>
          {d.recent.map((row, i) => (
            <div key={i} className="border-b py-3 text-sm">
              <b>{nested(row, "actor", "email") || "Hệ thống"}</b>
              <p>
                {str(row.action)} · {str(row.entityType)}
              </p>
              <p className="text-xs text-slate-500">{date(row.createdAt)}</p>
            </div>
          ))}
          {!d.recent.length && <p>Chưa có hoạt động.</p>}
        </Panel>
      </div>
    </>
  );
}
function RevenueReport() {
  const [days, setDays] = useState(30);
  const [mode, setMode] = useState("daily");
  const [year, setYear] = useState(() => Number(new Intl.DateTimeFormat("en", {timeZone:"Asia/Ho_Chi_Minh",year:"numeric"}).format(new Date())));
  const query = useQuery({
    ...adminQueryRefresh,
    queryKey: ["admin", "revenue-report", days, mode, year],
    queryFn: () => get<{points:{day:string;amount:number;count:number;candidate:number;company:number}[];total:number;count:number;candidate:number;company:number}>("revenue", {days,mode,year}),
  });
  return <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-slate-500">Thanh toán thành công · Giờ Việt Nam</p>
      <div className="flex flex-wrap gap-3">
      <AdminSelect aria-label="Chế độ doanh thu" className={input} value={mode} onChange={e=>setMode(e.target.value)}><option value="daily">Theo ngày</option><option value="monthly">Theo tháng</option></AdminSelect>
      {mode === "monthly" ? <label className="flex items-center gap-2 text-sm">Năm<input aria-label="Năm doanh thu" type="number" min={2000} max={2100} className={input+" w-28"} value={year} onChange={e=>{const value=Number(e.target.value);if(value>=2000&&value<=2100)setYear(value);}}/></label> : <AdminSelect aria-label="Khoảng thời gian doanh thu" className={input} value={days} onChange={e=>setDays(Number(e.target.value))}>
        {[7,30,90].map(d=><option key={d} value={d}>{d} ngày gần nhất</option>)}
      </AdminSelect>}
      </div>
    </div>
    {query.isPending && <p>Đang tải doanh thu…</p>}
    {query.isError && <Failure error={query.error} retry={()=>void query.refetch()}/>}
    {query.data && <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Doanh thu trong kỳ",money(query.data.total)],["Thanh toán thành công",query.data.count],["Ứng viên",money(query.data.candidate)],["Nhà tuyển dụng",money(query.data.company)]].map(([label,value])=><Panel key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-emerald-700">{value}</p></Panel>)}
      </div>
      <Panel>
        <h2 className="mb-1 font-bold">{mode === "monthly" ? `Doanh thu từng tháng năm ${year}` : "Doanh thu theo ngày"}</h2>
        <p className="mb-6 text-xs text-slate-500">Đơn vị: VND. Kỳ không có thanh toán được tính là 0.</p>
        <div className="h-80 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={query.data.points} margin={{top:10,right:20,left:10,bottom:10}}>
              <defs><linearGradient id="adminRevenueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.35}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.02}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
              <XAxis dataKey="day" tickFormatter={day=>mode === "monthly" ? `T${Number(String(day).slice(5))}` : String(day).slice(5).split("-").reverse().join("/")} minTickGap={35} tick={{fontSize:12}}/>
              <YAxis tickFormatter={value=>Number(value).toLocaleString("vi-VN",{notation:"compact"})} tick={{fontSize:12}} width={70} domain={[0,"auto"]}/>
              <Tooltip formatter={value=>money(value)} labelFormatter={day=>`${mode === "monthly" ? "Tháng" : "Ngày"} ${String(day).split("-").reverse().join("/")}`}/>
              <Area type="monotone" dataKey="amount" name="Doanh thu" stroke="#059669" strokeWidth={3} fill="url(#adminRevenueFill)" activeDot={{r:5}}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {query.data.count===0 && <p className="mt-3 text-center text-sm text-slate-500">Chưa có thanh toán thành công trong khoảng thời gian này.</p>}
      </Panel>
    </>}
  </>;
}
function Approvals() {
  const [mode, setMode] = useAdminTab("subtab", ["jobs", "companies"], "jobs");
  return (
    <>
      <div className="flex gap-2">
        <button className={input} onClick={() => setMode("jobs")}>
          Tin tuyển dụng
        </button>
        <button className={input} onClick={() => setMode("companies")}>
          Doanh nghiệp
        </button>
      </div>
      <AdminList
        key={mode}
        resource={mode}
      />
    </>
  );
}
function MasterData() {
  const [mode, setMode] = useAdminTab("subtab", ["categories", "titles", "provinces", "wards"], "categories");
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {[
          ["categories", "Ngành nghề"],
          ["titles", "Vị trí chuyên môn"],
          ["provinces", "Tỉnh/thành phố"],
          ["wards", "Phường/xã"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={mode === id ? button : input}
          >
            {label}
          </button>
        ))}
      </div>
      <AdminList key={mode} resource={mode} />
    </>
  );
}
function actions(resource: string, row: Row): string[][] {
  if (resource === "jobs")
    return row.status === "PENDING"
      ? [
          ["PUBLISHED", "Duyệt tin"],
          ["REJECTED", "Từ chối"],
        ]
      : [];
  if (resource === "companies")
    return ["verified", "rejected", "pending"]
      .filter((s) => s !== row.verificationStatus)
      .map((s) => [s, labels[s]]);
  if (resource === "accounts" && row.role !== "admin")
    return [
      [
        row.status === "active" ? "blocked" : "active",
        row.status === "active" ? "Khóa" : "Mở khóa",
      ],
    ];
  return [];
}
function AdminList({
  resource,
  initialStatus = "",
}: {
  resource: string;
  initialStatus?: string;
}) {
  const account = useAccountStore((s) => s.account),
    client = useQueryClient();
  const [page, setPage] = useState(1),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(initialStatus);
  const [detail, setDetail] = useState<Row | null>(null),
    [target, setTarget] = useState<{ row: Row; status: string } | null>(null),
    [reason, setReason] = useState(""),
    [edit, setEdit] = useState<Row | null>(null),
    [create, setCreate] = useState(false),
    [remove, setRemove] = useState<Row | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const q = useQuery({
    ...adminQueryRefresh,
    queryKey: ["admin", account?.id, resource, page, query, status],
    queryFn: () => get<Page>(resource, { page, query, status }),
    enabled: account?.role === "admin",
  });
  const reconcile = useMutation({
    mutationFn: (id: string) =>
      httpRequest.post(`/admin/orders/${id}/reconcile`),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Đã đối soát với cổng thanh toán");
    },
    onError: (e) => toast.error(errorText(e)),
  });
  const mutation = useMutation({
    mutationFn: () =>
      remove
        ? httpRequest.delete(`/admin/catalog/${resource}/${remove.id}`)
        : httpRequest.patch(`/admin/${resource}/${target!.row.id}`, {
            ...(resource === "companies"
              ? { verificationStatus: target!.status }
              : { status: target!.status }),
            reason,
          }),
    onSuccess: () => {
      toast.success("Đã cập nhật");
      setTarget(null);
      setRemove(null);
      setReason("");
      void client.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(errorText(e)),
  });
  const statuses =
    resource === "jobs"
      ? ["PENDING", "PUBLISHED", "PAUSED", "REJECTED", "CLOSED", "EXPIRED"]
      : resource === "companies"
        ? ["pending", "verified", "rejected"]
        : resource === "accounts"
          ? ["active", "blocked"]
          : resource === "orders"
            ? [
                "pending",
                "processing",
                "paid",
                "failed",
                "cancelled",
                "expired",
                "refunded",
              ]
            : [];
  const catalog = ["categories", "titles", "provinces", "wards"].includes(
    resource,
  );
  return (
    <>
      <Panel>
        <div className="mb-5 flex flex-wrap gap-3">
          <input
            className={input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm…"
            aria-label="Tìm kiếm"
          />
          {statuses.length > 0 && (
            <AdminSelect
              className={input}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {labels[s]}
                </option>
              ))}
            </AdminSelect>
          )}
          <button
            className="text-sm text-emerald-700 underline"
            onClick={() => {
              setSearch("");
              setQuery("");
              setStatus("");
              setPage(1);
            }}
          >
            Xóa lọc
          </button>
          {/* <button className={input} onClick={() => void q.refetch()}>
            Làm mới
          </button> */}
          {(resource === "notifications" || catalog) && (
            <button className={button} onClick={() => setCreate(true)}>
              Thêm mới
            </button>
          )}
        </div>
        {q.isPending && <p>Đang tải…</p>}
        {q.isError && (
          <Failure error={q.error} retry={() => void q.refetch()} />
        )}
        {q.data && (
          <>
            <p className="mb-3 text-sm text-slate-500">
              {q.data.total} bản ghi
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Thông tin", resource === "categories" ? "Mã" : resource === "titles" ? "Ngành nghề" : "Chi tiết", "Trạng thái", "Thao tác"].map(
                      (h) => (
                        <th key={h} className="p-3">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {q.data.items.map((row) => (
                    <tr key={row.id} className="border-t align-top">
                      <td className="p-3">
                        <b>
                          {str(
                            row.title ??
                              row.name ??
                              row.fullName ??
                              row.email ??
                              row.action ??
                              row.id,
                          )}
                        </b>
                        <p className="mt-1 text-xs text-slate-500">
                          {str(row.code) || date(row.createdAt)}
                        </p>
                      </td>
                      <td className="max-w-sm p-3">
                        <RowSummary row={row} resource={resource} />
                      </td>
                      <td className="p-3">
                        <Status
                          value={
                            row.status ??
                            row.verificationStatus ??
                            row.availability ??
                            (resource === "notifications"
                              ? row.readAt
                                ? "Đã đọc"
                                : "Chưa đọc"
                              : row.isActive === undefined
                                ? undefined
                                : row.isActive
                                  ? "active"
                                  : catalog ? "Ngừng hoạt động" : "disabled")
                          }
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="font-semibold text-slate-600"
                            onClick={() => setDetail(row)}
                          >
                            Chi tiết
                          </button>
                          {resource === "orders" &&
                            ["pending", "processing"].includes(
                              str(row.status),
                            ) && (
                              <button
                                disabled={reconcile.isPending}
                                className="text-emerald-700"
                                onClick={() => reconcile.mutate(row.id)}
                              >
                                Đối soát
                              </button>
                            )}
                          {actions(resource, row).map(([s, l]) => (
                            <button
                              key={s}
                              className="font-semibold text-emerald-700"
                              onClick={() => {
                                setReason("");
                                setTarget({ row, status: s });
                              }}
                            >
                              {l}
                            </button>
                          ))}
                          {(resource === "plans" || catalog) && (
                            <button
                              className="font-semibold text-emerald-700"
                              onClick={() => setEdit(row)}
                            >
                              Sửa
                            </button>
                          )}
                          {catalog && (
                            <button
                              className="text-red-600"
                              onClick={() => setRemove(row)}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!q.data.items.length && (
              <p className="p-8 text-center text-slate-500">
                Không có dữ liệu phù hợp.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-4 text-sm">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="disabled:opacity-40"
              >
                Trước
              </button>
              <span>
                Trang {page}/{Math.max(1, q.data.pages)}
              </span>
              <button
                disabled={page >= q.data.pages}
                onClick={() => setPage(page + 1)}
                className="disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </>
        )}
      </Panel>
      {detail && (
        <Dialog
          open
          onOpenChange={(o) => {
            if (!o) setDetail(null);
          }}
        >
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogTitle>Chi tiết</DialogTitle>
            <Details value={detail} />
          </DialogContent>
        </Dialog>
      )}
      {(target || remove) && (
        <Dialog
          open
          onOpenChange={(o) => {
            if (!o && !mutation.isPending) {
              setTarget(null);
              setRemove(null);
            }
          }}
        >
          <DialogContent>
            <DialogTitle>
              {remove ? "Xóa danh mục" : labels[target!.status]}
            </DialogTitle>
            <p>
              {str(
                (remove ?? target?.row)?.title ??
                  (remove ?? target?.row)?.name ??
                  (remove ?? target?.row)?.email,
              )}
            </p>
            {remove ? (
              <p>Chỉ xóa được khi chưa có dữ liệu tham chiếu.</p>
            ) : (
              <label className="text-sm">
                Lý do
                <textarea
                  className={input + " mt-2 w-full"}
                  rows={3}
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            )}
            <button
              className={button}
              disabled={
                mutation.isPending || (!remove && reason.trim().length < 3)
              }
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending ? "Đang lưu…" : "Xác nhận"}
            </button>
          </DialogContent>
        </Dialog>
      )}
      {edit && resource === "plans" && (
        <PlanEditor row={edit} close={() => setEdit(null)} />
      )}{" "}
      {resource === "notifications" && create && (
        <NotificationEditor close={() => setCreate(false)} />
      )}{" "}
      {catalog && (edit || create) && (
        <CatalogEditor
          resource={resource}
          row={edit}
          close={() => {
            setEdit(null);
            setCreate(false);
          }}
        />
      )}
    </>
  );
}
function RowSummary({ row, resource }: { row: Row; resource: string }) {
  if (resource === "orders")
    return (
      <>
        {nested(row, "purchaser", "email")}
        <p>
          {nested(row, "plan", "name")} · {money(row.totalAmount)}
        </p>
      </>
    );
  if (resource === "jobs")
    return (
      <>
        {nested(row, "company", "name")}
        <p className="text-xs text-slate-500">
          Hạn nộp: {date(row.deadlineAt)} ·{" "}
          {nested(row, "_count", "applications")} hồ sơ
        </p>
      </>
    );
  if (resource === "companies")
    return (
      <>
        {nested(row, "account", "email")}
        <p>
          MST: {str(row.taxCode) || "Chưa cập nhật"} ·{" "}
          {nested(row, "location", "name")}
        </p>
        <p>
          {nested(row, "_count", "jobPosts")} tin · Tài khoản:{" "}
          {labels[nested(row, "account", "status")]}
        </p>
      </>
    );
  if (resource === "plans")
    return (
      <>
        {labels[str(row.audience)]} · {money(row.price)}
        <p>{row.isFree ? "Miễn phí" : str(row.durationDays) + " ngày"}</p>
      </>
    );
  if (resource === "notifications")
    return (
      <>
        {nested(row, "recipient", "email")}
        <p className="line-clamp-2">{str(row.description)}</p>
      </>
    );
  if (resource === "audit")
    return (
      <>
        {nested(row, "actor", "email") || "Hệ thống"}
        <p>
          {str(row.entityType)} · {date(row.createdAt)}
        </p>
      </>
    );
  return (
    <>
      {labels[str(row.role)] ??
        (nested(row, "candidate", "fullName") ||
          nested(row, "company", "name") ||
          nested(row, "category", "name") ||
          nested(row, "province", "name") ||
          str(row.code) ||
          "—")}
    </>
  );
}
function Details({ value }: { value: unknown }): ReactNode {
  if (value === null || value === undefined) return <span>—</span>;
  if (Array.isArray(value))
    return (
      <div className="space-y-2">
        {value.map((v, i) => (
          <Details key={i} value={v} />
        ))}
      </div>
    );
  if (typeof value !== "object")
    return (
      <span className="whitespace-pre-wrap break-words">
        {typeof value === "boolean"
          ? value
            ? "Có"
            : "Không"
          : (labels[String(value)] ?? String(value))}
      </span>
    );
  return (
    <dl className="space-y-3">
      {Object.entries(value)
        .filter(
          ([k]) =>
            !["passwordHash", "metadata", "updatedAt", "deletedAt"].includes(k),
        )
        .map(([key, v]) => (
          <div className="rounded-lg bg-slate-50 p-3" key={key}>
            <dt className="mb-1 text-xs font-semibold text-slate-500">
              {fieldLabels[key] ?? key}
            </dt>
            <dd>
              <Details value={v} />
            </dd>
          </div>
        ))}
    </dl>
  );
}
function PlanEditor({ row, close }: { row: Row; close: () => void }) {
  const client = useQueryClient(),
    entries = row.entitlements as Benefit[],
    [price, setPrice] = useState(Number(row.price)),
    [active, setActive] = useState(Boolean(row.isActive)),
    [availability, setAvailability] = useState(str(row.availability)),
    [benefits, setBenefits] = useState<
      Record<string, number | string | boolean>
    >(Object.fromEntries(entries.map((e) => [e.entitlement.code, e.value])));
  const save = useMutation({
    mutationFn: () =>
      httpRequest.patch("/admin/plans/" + row.id, {
        price,
        isActive: active,
        availability,
        benefits,
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin"] });
      void client.invalidateQueries({ queryKey: ["plans"] });
      toast.success("Đã cập nhật gói");
      close();
    },
    onError: (e) => toast.error(errorText(e)),
  });
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !save.isPending) close();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle>
          Sửa gói {str(row.name)} · {labels[str(row.audience)]}
        </DialogTitle>
        <p className="text-xs text-slate-500">
          Đơn đã mua giữ quyền lợi theo snapshot.
        </p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <label className="block text-sm">
            Giá (VND)
            <input
              className={input + " mt-1 w-full"}
              type="number"
              required
              min={0}
              max={1000000000}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </label>
          <label className="flex gap-2 text-sm">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Đang cung cấp
          </label>
          <AdminSelect
            className={input + " w-full"}
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            {["available", "coming_soon", "disabled"].map((s) => (
              <option key={s} value={s}>
                {labels[s]}
              </option>
            ))}
          </AdminSelect>
          {entries.filter((b) => typeof b.value === "number").map((b) => (
            <label key={b.entitlementId} className="block text-sm">
              {b.entitlement.name}
              {typeof b.value === "boolean" ? (
                <input
                  type="checkbox"
                  checked={Boolean(benefits[b.entitlement.code])}
                  onChange={(e) =>
                    setBenefits({
                      ...benefits,
                      [b.entitlement.code]: e.target.checked,
                    })
                  }
                />
              ) : (
                <input
                  className={input + " mt-1 w-full"}
                  required
                  type={typeof b.value === "number" ? "number" : "text"}
                  min={0}
                  maxLength={500}
                  value={String(benefits[b.entitlement.code])}
                  onChange={(e) =>
                    setBenefits({
                      ...benefits,
                      [b.entitlement.code]:
                        typeof b.value === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              )}
            </label>
          ))}
          {entries.some((b) => typeof b.value !== "number") && (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold">Quyền lợi đi kèm</p>
              <p className="mt-1 text-xs text-slate-500">Chỉ xem thông tin</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {entries.filter((b) => typeof b.value !== "number").map((b) => (
                  <li key={b.entitlementId}>
                    {typeof b.value === "string"
                      ? b.value || b.entitlement.name
                      : `${b.entitlement.name}: ${b.value ? "Có" : "Không"}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className={button} disabled={save.isPending}>
            Lưu thay đổi
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function NotificationEditor({ close }: { close: () => void }) {
  const client = useQueryClient(),
    [email, setEmail] = useState(""),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [link, setLink] = useState("");
  const [audience, setAudience] = useState("account"),
    [requestKey] = useState(() => crypto.randomUUID());
  const save = useMutation({
    mutationFn: () =>
      httpRequest.post("/admin/notifications", {
        audience,
        requestKey,
        ...(audience === "account" ? { email } : {}),
        title,
        description,
        ...(link ? { link } : {}),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Đã gửi thông báo");
      close();
    },
    onError: (e) => toast.error(errorText(e)),
  });
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !save.isPending) close();
      }}
    >
      <DialogContent>
        <DialogTitle>Tạo thông báo hệ thống</DialogTitle>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <AdminSelect
            aria-label="Đối tượng"
            className={input + " w-full"}
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="account">Một tài khoản</option>
            <option value="candidate">Tất cả ứng viên hoạt động</option>
            <option value="company">Tất cả nhà tuyển dụng hoạt động</option>
          </AdminSelect>
          {audience === "account" && (
            <input
              required
              type="email"
              placeholder="Email người nhận"
              aria-label="Email người nhận"
              className={input + " w-full"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <input
            required
            maxLength={150}
            placeholder="Tiêu đề"
            aria-label="Tiêu đề"
            className={input + " w-full"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            required
            maxLength={255}
            placeholder="Nội dung"
            aria-label="Nội dung"
            className={input + " w-full"}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            placeholder="Đường dẫn nội bộ, ví dụ /services"
            aria-label="Đường dẫn"
            className={input + " w-full"}
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button className={button} disabled={save.isPending}>
            Gửi thông báo
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function CatalogEditor({
  resource,
  row,
  close,
}: {
  resource: string;
  row: Row | null;
  close: () => void;
}) {
  const client = useQueryClient(),
    [name, setName] = useState(str(row?.name ?? row?.fullName)),
    [code, setCode] = useState(str(row?.code)),
    [isActive, setIsActive] = useState(row?.isActive !== false),
    [parentId, setParentId] = useState(
      str(row?.jobCategoryId ?? row?.provinceId),
    ),
    [parentSearch, setParentSearch] = useState("");
  const parent =
    resource === "titles"
      ? "categories"
      : resource === "wards"
        ? "provinces"
        : null;
  const parents = useQuery({
    ...adminQueryRefresh,
    queryKey: ["admin", "catalog-parents", parent, parentSearch],
    enabled: !!parent,
    queryFn: async () => {
      const first = await get<Page>(parent!, { query: parentSearch });
      if (resource !== "wards") return first;
      const items = [...first.items];
      for (let page = 2; page <= first.pages; page++) {
        items.push(...(await get<Page>(parent!, { page })).items);
      }
      return { ...first, items };
    },
  });
  const save = useMutation({
    mutationFn: () =>
      row
        ? httpRequest.patch(`/admin/catalog/${resource}/${row.id}`, {
            name,
            code,
            isActive,
            ...(parent ? { parentId } : {}),
          })
        : httpRequest.post("/admin/catalog/" + resource, {
            name,
            code,
            isActive,
            ...(parent ? { parentId } : {}),
          }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["admin"] });
      toast.success("Đã lưu danh mục");
      close();
    },
    onError: (e) => toast.error(errorText(e)),
  });
  return (
    <Dialog
      open
      onOpenChange={(o) => {
        if (!o && !save.isPending) close();
      }}
    >
      <DialogContent>
        <DialogTitle>{row ? "Sửa" : "Thêm"} danh mục</DialogTitle>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <input
            required
            maxLength={150}
            placeholder="Tên"
            aria-label="Tên"
            className={input + " w-full"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            required
            maxLength={
              resource === "categories" ? 180 : resource === "titles" ? 30 : 20
            }
            placeholder="Mã"
            aria-label="Mã"
            className={input + " w-full"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {parent && (
            <>
              {resource !== "wards" && <input
                className={input + " w-full"}
                placeholder="Tìm ngành nghề"
                value={parentSearch}
                onChange={(e) => setParentSearch(e.target.value)}
              />}
              <AdminSelect
                required
                className={input + " w-full"}
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">Chọn danh mục cha</option>
                {parentId &&
                  !parents.data?.items.some((p) => p.id === parentId) && (
                    <option value={parentId}>
                      {row
                        ? nested(row, "category", "name") ||
                          nested(row, "province", "name")
                        : parentId}
                    </option>
                  )}
                {parents.data?.items.map((p) => (
                  <option key={p.id} value={p.id}>
                    {str(p.name)}
                  </option>
                ))}
              </AdminSelect>
            </>
          )}
          <label className="block text-sm">
            Trạng thái
            <AdminSelect className={input + " mt-1 w-full"} value={String(isActive)} onChange={(e) => setIsActive(e.target.value === "true")}>
              <option value="true">Hoạt động</option>
              <option value="false">Ngừng hoạt động</option>
            </AdminSelect>
          </label>
          <button className={button} disabled={save.isPending}>
            Lưu
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
