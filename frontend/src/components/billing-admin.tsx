"use client";
import { useQuery } from "@tanstack/react-query";
import { httpRequest } from "@/lib/utils";
import { useAccountStore } from "@/stores/auth.store";
import type { Order } from "@/services/billing.service";
export function BillingAdmin() {
  const account = useAccountStore((s) => s.account);
  const query = useQuery({
    queryKey: ["admin-billing", account?.id],
    enabled: account?.role === "admin",
    queryFn: async (): Promise<Order[]> =>
      (await httpRequest.get("/billing/admin/orders")).data.data,
  });
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Đơn hàng & thanh toán</h2>
      <p className="text-sm text-slate-500">
        100 đơn gần nhất. Trạng thái thanh toán được xác nhận từ payOS.
      </p>
      {query.isPending && <p>Đang tải…</p>}
      {query.isError && (
        <button onClick={() => void query.refetch()}>
          Không tải được đơn hàng. Thử lại
        </button>
      )}
      {query.data?.length === 0 && <p>Chưa có đơn hàng.</p>}
      {query.data?.map((o) => (
        <article key={o.id} className="rounded-xl border bg-white p-4">
          <b>{o.code}</b>
          <p>
            {o.planSnapshot.name ?? "Gói dịch vụ"} ·{" "}
            {Number(o.totalAmount).toLocaleString("vi-VN")} VND · {o.status}
          </p>
          <p className="text-sm text-slate-500">
            {new Date(o.createdAt).toLocaleString("vi-VN")}
          </p>
          {o.payments.map((p) => (
            <p key={p.id} className="mt-2 text-sm">
              Thanh toán {p.id}: {p.status}
            </p>
          ))}
        </article>
      ))}
    </section>
  );
}
