"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BadgeCheck, Crown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountStore } from "@/stores/auth.store";
import { billingService, type Plan } from "@/services/billing.service";
import { LoadingState } from "./loading-state";

const money = (amount: string) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount));
const labels: Record<string, string> = { pending: "Chờ thanh toán", processing: "Đang xác nhận", paid: "Đã thanh toán", succeeded: "Thành công", failed: "Thất bại", cancelled: "Đã hủy", expired: "Hết hạn", refunded: "Đã hoàn tiền" };
function errorMessage(error: unknown) {
  const e = error as { response?: { data?: { message?: string; errors?: { message?: string } } }; message?: string };
  return e?.response?.data?.message ?? e?.response?.data?.errors?.message ?? e?.message ?? "Không thực hiện được. Vui lòng thử lại.";
}
export function PlanCards({ audience }: { audience: "candidate" | "company" }) {
  const account = useAccountStore(s => s.account);
  const keys = useRef<Record<string, string>>({});
  const [selected, setSelected] = useState<Plan | null>(null);
  const query = useQuery({ queryKey: ["plans", audience], queryFn: () => billingService.plans(audience) });
  const purchase = useMutation({ mutationFn: async (plan: Plan) => {
    const key = keys.current[plan.id] ??= crypto.randomUUID();
    const order = await billingService.create(plan.id, key);
    const payment = await billingService.checkout(order.id);
    if (payment.checkoutUrl) window.location.assign(payment.checkoutUrl);
  } });
  if (query.isPending) return <LoadingState message="Đang tải gói dịch vụ…" />;
  if (query.isError) return <button onClick={() => void query.refetch()}>Không tải được gói. Thử lại</button>;
  return <div>
    <div className="grid gap-5 md:grid-cols-3">{query.data.map(plan => <article key={plan.id} className={`rounded-2xl border bg-white p-6 text-center ${plan.name === "Pro" ? "border-emerald-500 shadow-md" : "border-slate-200"}`}>
      <h2 className="flex items-center justify-center gap-2 text-2xl font-bold">{plan.name === "Pro" && <BadgeCheck aria-hidden="true" className="size-7 text-emerald-600" />}{plan.name === "Premium" && <Crown aria-hidden="true" className="size-7 text-amber-500" />}{plan.name}</h2>
      <p className="mt-4 text-xl font-bold text-emerald-700">{plan.availability === "coming_soon" ? "Chưa công bố" : plan.isFree ? "Miễn phí" : Number(plan.price) > 0 ? `${money(plan.price)} / 30 ngày` : "Giá sẽ được công bố"}</p>
      {plan.availability === "coming_soon" ? <p className="my-5 text-sm text-slate-600">Các công cụ nâng cao đang được phát triển. Quyền lợi sẽ được công bố khi ra mắt.</p> : <ul className="my-5 space-y-3 text-sm text-slate-600">
        {audience === "candidate" ? <><li>Lưu tối đa {plan.metadata.benefits.cvLimit} CV</li><li>{plan.metadata.benefits.aiLimit} lượt AI {plan.isFree ? "/ tháng" : "/ 30 ngày"}</li></> : <><li>{plan.metadata.benefits.activeJobLimit} tin hoạt động hoặc chờ duyệt</li><li>{String(plan.metadata.benefits.publicCvViewLimit)} lượt xem CV công khai {plan.isFree ? "/ tháng" : "/ 30 ngày"}</li><li>Mỗi lần mở CV đều tính lượt; miễn trừ nếu ứng viên đã ứng tuyển vào công ty</li></>}
        {Object.entries(plan.metadata.benefits).filter(([, value]) => typeof value === "string").map(([code, value]) => <li key={code}>{String(value)}</li>)}
      </ul>}
      {plan.availability === "coming_soon" ? <button disabled className="w-full rounded-xl bg-slate-100 p-3 text-slate-500">Đang phát triển</button> : plan.isFree ? <p className="rounded-xl bg-emerald-50 p-3 text-center text-emerald-700">Gói mặc định</p> : !plan.purchasable ? <button disabled className="w-full rounded-xl bg-slate-100 p-3 text-slate-500">Chưa mở thanh toán</button> : !account ? <Link href="/login" className="block rounded-xl bg-emerald-600 p-3 text-center text-white">Đăng nhập để mua</Link> : account.role !== audience ? <p className="text-sm text-slate-500">Gói dành cho {audience === "candidate" ? "ứng viên" : "nhà tuyển dụng"}</p> : <button disabled={purchase.isPending} onClick={() => { purchase.reset(); setSelected(plan); }} className="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white disabled:opacity-50">Mua Pro</button>}
    </article>)}</div>
    {selected && <section className="mt-6 rounded-xl border bg-white p-5" aria-label="Xác nhận mua gói"><h3 className="font-bold">Xác nhận mua {selected.name}</h3><p className="my-3">{money(selected.price)} · 30 ngày. Nếu Pro còn hiệu lực, gói mới bắt đầu sau khi gói hiện tại kết thúc. Không tự động gia hạn.</p><button disabled={purchase.isPending} onClick={() => purchase.mutate(selected)} className="rounded-lg bg-emerald-600 px-4 py-2 text-white">{purchase.isPending ? "Đang tạo thanh toán…" : "Tiếp tục thanh toán"}</button><button disabled={purchase.isPending} onClick={() => setSelected(null)} className="ml-4">Hủy</button></section>}
    {purchase.isError && <p role="alert" className="mt-4 text-red-600">{errorMessage(purchase.error)} <Link href="/billing/orders" className="underline">Xem đơn hàng để thử lại</Link></p>}
  </div>;
}
export function BillingPanel({ view = "orders" }: { view?: "orders" | "payments" | "services" }) {
  const returned = useRef("");
  const account = useAccountStore(s => s.account);
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["orders", account?.id], enabled: !!account, queryFn: billingService.orders, refetchInterval: view === "orders" ? 15000 : false });
  const sub = useQuery({ queryKey: ["subscription", account?.id], enabled: !!account, queryFn: billingService.subscription });
  const action = useMutation({ mutationFn: async ({ id, pay }: { id: string; pay: boolean }) => {
    if (pay) { const payment = await billingService.checkout(id); if (payment.checkoutUrl) window.location.assign(payment.checkoutUrl); }
    else { await billingService.reconcile(id); await Promise.all([client.invalidateQueries({ queryKey: ["orders"] }), client.invalidateQueries({ queryKey: ["subscription"] }), client.invalidateQueries({ queryKey: ["cv-access"] })]); }
  } });
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("orderId");
    if (!id || !query.data?.some(o => o.id === id) || returned.current === id) return;
    returned.current = id;
    action.mutate({ id, pay: false });
  }, [query.data]);
  if (!account) return <p>Vui lòng <Link href="/login" className="text-emerald-700 underline">đăng nhập</Link> để xem đơn hàng.</p>;
  return <section className="space-y-5 rounded-2xl border bg-white p-6">
    <h2 className="text-xl font-bold">{view === "services" ? "Gói đang sử dụng" : view === "payments" ? "Lịch sử thanh toán" : "Đơn hàng"}</h2>
    {sub.data && <div className="rounded-xl bg-emerald-50 p-4"><b>Gói hiện tại: {sub.data.name}</b>{sub.data.subscription && <p>Hết hạn: {new Date(sub.data.subscription.expiresAt).toLocaleString("vi-VN")}</p>}{sub.data.scheduled.map(s => <p key={s.id}>Pro tiếp theo: {new Date(s.startedAt).toLocaleDateString("vi-VN")} – {new Date(s.expiresAt).toLocaleDateString("vi-VN")}</p>)}</div>}
    {view === "services" ? <PlanCards audience={account.role === "company" ? "company" : "candidate"} /> : <>
      {query.isPending && <LoadingState message="Đang tải đơn hàng…" />}
      {query.isError && <button onClick={() => void query.refetch()}>Không tải được đơn hàng. Thử lại</button>}
      {query.data?.length === 0 && <p className="text-slate-500">Bạn chưa có đơn hàng.</p>}
      {query.data?.map(order => <article key={order.id} className="rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-3"><div><b>{order.planSnapshot.name ?? "Gói dịch vụ"} · {money(order.totalAmount)}</b><p className="mt-1 break-all text-xs text-slate-500">{order.code}</p></div><span>{labels[order.status] ?? order.status}</span></div>
        <p className="mt-2 text-sm">Ngày mua: {new Date(order.createdAt).toLocaleString("vi-VN")}</p>
        {order.subscription && <p className="mt-2 text-sm">Hiệu lực: {new Date(order.subscription.startedAt).toLocaleString("vi-VN")} – {new Date(order.subscription.expiresAt).toLocaleString("vi-VN")}</p>}
        <details className="mt-3 text-sm" open={view === "payments"}><summary>Các lần thanh toán ({order.payments.length})</summary>{order.payments.map(p => <p key={p.id} className="mt-2">{new Date(p.createdAt).toLocaleString("vi-VN")} · {money(p.amount)} · {labels[p.status] ?? p.status}</p>)}</details>
        {order.status === "pending" && <div className="mt-3 flex gap-4"><button disabled={action.isPending || !order.paymentDeadlineAt || new Date(order.paymentDeadlineAt) <= new Date()} onClick={() => action.mutate({ id: order.id, pay: true })} className="text-emerald-700 disabled:opacity-50">Thanh toán</button>{order.payments.length > 0 && <button disabled={action.isPending} onClick={() => action.mutate({ id: order.id, pay: false })}>Kiểm tra thanh toán</button>}</div>}
      </article>)}
    </>}
    {action.isError && <p role="alert" className="text-red-600">{errorMessage(action.error)}</p>}
  </section>;
}
