"use client";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { InfiniteScrollEnd } from "./infinite-scroll-end";
import { useRouter } from "next/navigation";
import { useAccountStore } from "@/stores/auth.store";
import { httpRequest } from "@/lib/utils";

type Item = { id: string; title: string; description: string; link: string | null; readAt: string | null; createdAt: string };
export function NotificationBell() {
  const account = useAccountStore(s => s.account);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const client = useQueryClient();
  const router = useRouter();
  const query = useInfiniteQuery({ queryKey: ["notifications", account?.id, unread], enabled: !!account, initialPageParam: 1, queryFn: async ({ pageParam, signal }): Promise<{ items: Item[]; unreadCount: number; total: number }> => (await httpRequest.get("/notifications", { signal, params: { page: pageParam, unread: String(unread) } })).data.data, getNextPageParam: (last, pages) => pages.length * 20 < last.total ? pages.length + 1 : undefined, refetchInterval: 15000 });
  const items = [...new Map((query.data?.pages.flatMap(page => page.items) ?? []).map(item => [item.id, item])).values()];
  const mark = useMutation({ mutationFn: async (id?: string) => httpRequest.patch(id ? `/notifications/${id}/read` : "/notifications/read-all"), onSuccess: () => client.invalidateQueries({ queryKey: ["notifications", account?.id] }) });
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", close); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  if (!account) return null;
  const count = query.data?.pages[0]?.unreadCount ?? 0;
  return <div ref={root} className="relative text-slate-700">
    <button aria-label={`Thông báo, ${count} chưa đọc`} aria-expanded={open} onClick={() => setOpen(!open)} className="relative grid size-10 place-items-center rounded-full bg-slate-50"><Bell className="size-5" />{count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">{count > 99 ? "99+" : count}</span>}</button>
    {open && <section aria-label="Danh sách thông báo" className="absolute right-0 top-12 z-50 w-[min(380px,calc(100vw-2rem))] rounded-2xl border bg-white p-3 shadow-2xl">
      <div className="flex items-center justify-between p-2"><b>Thông báo</b><button disabled={mark.isPending || !count} onClick={() => mark.mutate(undefined)} className="text-xs text-emerald-700 disabled:opacity-50">Đọc tất cả</button></div>
      <button className="mb-2 px-2 text-xs text-emerald-700" onClick={() => { setUnread(!unread); }}>{unread ? "Hiện tất cả" : "Chỉ chưa đọc"}</button>
      <div className="max-h-96 overflow-y-auto">
        {query.isPending && <p className="p-3 text-sm">Đang tải thông báo…</p>}
        {query.isError && <button onClick={() => void query.refetch()} className="p-3 text-sm">Không tải được. Thử lại</button>}
        {items.length === 0 && <p className="p-3 text-sm text-slate-500">Chưa có thông báo{unread ? " chưa đọc" : ""}.</p>}
        {items.map(item => <button key={item.id} className={`mb-1 block w-full rounded-xl p-3 text-left hover:bg-emerald-50 ${item.readAt ? "" : "bg-emerald-50/70"}`} onClick={async () => { try { if (!item.readAt) await mark.mutateAsync(item.id); setOpen(false); if (item.link?.startsWith("/") && !item.link.startsWith("//")) router.push(item.link); } catch { /* Keep the notification open for retry. */ } }}><b className="block text-sm">{!item.readAt && <span aria-label="Chưa đọc" className="mr-2 inline-block size-2 rounded-full bg-emerald-500" />}{item.title}</b><span className="mt-1 block text-sm text-slate-500">{item.description}</span><time className="mt-1 block text-xs text-slate-400">{new Date(item.createdAt).toLocaleString("vi-VN")}</time></button>)}
        <InfiniteScrollEnd hasNext={!!query.hasNextPage} loading={query.isFetching} error={query.isFetchNextPageError} load={() => { if (!query.isFetching) void query.fetchNextPage(); }} />
      </div>
      {mark.isError && <p role="alert" className="p-2 text-xs text-red-600">Chưa đánh dấu được. Vui lòng thử lại.</p>}

    </section>}
  </div>;
}
