"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@/providers/chat-provider";
import { ArrowLeft, MessageCircle, Send, Search } from "lucide-react";
import { useAccountStore } from "@/stores/auth.store";

import {
  conversationService,
} from "@/services/conversation.service";

export function MessagesPanel() {
  const account = useAccountStore((s) => s.account);
  const params = useSearchParams();
  const client = useQueryClient();
  const [selected, setSelected] = useState(params.get("conversation") ?? "");
  const [search, setSearch] = useState("");
  const { connected, state } = useChat();
  const accountId = account?.id;
  useEffect(() => {
    setSelected(params.get("conversation") ?? "");
  }, [params]);
  const list = useQuery({
    queryKey: ["conversations", accountId],
    enabled: !!accountId,
    queryFn: ({ signal }) => conversationService.list(signal),
  });
  if (!account)
    return (
      <div className="rounded-2xl bg-white p-8 text-center">
        Vui lòng đăng nhập để xem tin nhắn.{" "}
        <Link href="/login" className="text-emerald-700 underline">
          Đăng nhập
        </Link>
      </div>
    );
  const current = list.data?.find((item) => item.id === selected);
  const name = (item: NonNullable<typeof current>) =>
    account.role === "company" ? item.candidate.fullName : item.company.name;
  const filtered = (list.data ?? []).filter((item) =>
    name(item).toLocaleLowerCase("vi").includes(search.toLocaleLowerCase("vi")),
  );
  return (
    <div className="grid h-[min(720px,80vh)] min-h-120 overflow-hidden rounded-2xl border bg-white shadow-sm md:grid-cols-[300px_1fr]">
      <aside
        className={`${selected ? "hidden md:flex" : "flex"} min-h-0 flex-col border-r`}
      >
        <div className="border-b p-4">
          <h2 className="font-bold">Cuộc trò chuyện</h2>
          <label className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3">
            <Search className="size-4" />
            <input
              aria-label="Tìm cuộc trò chuyện"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên..."
              className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
            />
          </label>
        </div>
        <div className="flex-1 overflow-y-auto">
          {list.isPending && <p className="p-4 text-sm">Đang tải...</p>}
          {list.isError && (
            <button
              onClick={() => void list.refetch()}
              className="p-4 text-red-600"
            >
              Không tải được hội thoại. Thử lại
            </button>
          )}
          {list.isSuccess && !filtered.length && (
            <p className="p-4 text-sm text-slate-500">
              Chưa có cuộc trò chuyện phù hợp.
            </p>
          )}
          {filtered.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item.id)}
              className={`w-full border-b p-4 text-left ${selected === item.id ? "bg-emerald-50" : "hover:bg-slate-50"}`}
            >
              <p className="truncate font-semibold">{name(item)}{(state?.counts[item.id]??0)>0 && <span className="ml-2 inline-block rounded-full bg-emerald-600 px-2 text-xs text-white">{state?.counts[item.id]}</span>}</p>
              <p className="mt-1 truncate text-sm text-slate-500">
                {item.messages[0]?.content ?? "Bắt đầu cuộc trò chuyện"}
              </p>
              {item.lastMessageAt && (
                <time className="text-xs text-slate-400">
                  {new Date(item.lastMessageAt).toLocaleString("vi-VN")}
                </time>
              )}
            </button>
          ))}
        </div>
      </aside>
      <section
        className={`${selected ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col`}
      >
        <header className="flex items-center gap-3 border-b p-4">
          <button
            aria-label="Trở lại hội thoại"
            className="md:hidden"
            onClick={() => setSelected("")}
          >
            <ArrowLeft />
          </button>
          <div>
            <h2 className="font-bold">
              {current ? name(current) : "Tin nhắn"}
            </h2>
            <p className="text-xs text-slate-500">
              {!connected ? "Đang kết nối lại…" : current ? (state?.online[account.role === "company" ? current.candidate.accountId : current.company.accountId] ? "● Đang hoạt động" : "Ngoại tuyến") : "Đã kết nối"}
            </p>
          </div>
        </header>
        {selected ? (
          <ConversationThread
            key={`${account.id}:${selected}`}
            accountId={account.id}
            id={selected}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500">
            <MessageCircle />
            <p>Chọn cuộc trò chuyện để bắt đầu.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ConversationThread({
  accountId,
  id,
}: {
  accountId: string;
  id: string;
}) {
  const client = useQueryClient();
  const [draft, setDraft] = useState("");
  const lock = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const {ack,connected}=useChat();
  const history = useInfiniteQuery({
    queryKey: ["messages", accountId, id],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) => conversationService.messages(id, signal, pageParam),
    getNextPageParam: (page) => page.length===50 ? page[0]?.id : undefined,
  });
  const messages={...history,data:history.data?.pages.slice().reverse().flat()};
  const send = useMutation({
    mutationFn: (content: string) => conversationService.send(id, content),
    retry: false,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["messages", accountId, id] });
      void client.invalidateQueries({ queryKey: ["conversations", accountId] });
      setDraft("");
    },
  });
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [messages.data?.at(-1)?.id]);
  useEffect(()=>{
    const root=viewport.current; if(!root || !connected)return;
    const viewed=new Set<string>();
    const flush=()=>{if(document.visibilityState==="visible" && viewed.size){ack([...viewed],true);}};
    const observer=new IntersectionObserver(entries=>{for(const entry of entries){const id=(entry.target as HTMLElement).dataset.unreadId!;if(entry.isIntersecting)viewed.add(id);else viewed.delete(id);}flush();},{root,threshold:0.5});
    root.querySelectorAll("[data-unread-id]").forEach(el=>observer.observe(el));
    document.addEventListener("visibilitychange",flush);
    const retry=setInterval(flush,5000);
    return ()=>{observer.disconnect();clearInterval(retry);document.removeEventListener("visibilitychange",flush);};
  },[messages.data,connected,ack]);
  async function submit() {
    if (!draft.trim() || lock.current) return;
    lock.current = true;
    try {
      await send.mutateAsync(draft.trim());
    } catch {
      /* Keep draft for retry. */
    } finally {
      lock.current = false;
    }
  }
  return (
    <>
      <div ref={viewport} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
        {history.hasNextPage && <button type="button" disabled={history.isFetchingNextPage} onClick={()=>void history.fetchNextPage()} className="block mx-auto text-sm text-emerald-700">{history.isFetchingNextPage?"Đang tải…":"Xem tin nhắn cũ hơn"}</button>}
        {messages.isPending && <p>Đang tải tin nhắn...</p>}
        {messages.isError && (
          <button
            onClick={() => void messages.refetch()}
            className="text-red-600"
          >
            Không tải được tin nhắn. Thử lại
          </button>
        )}
        {messages.isSuccess && !messages.data?.length && (
          <p className="text-center text-sm text-slate-500">
            Hãy gửi lời chào đầu tiên.
          </p>
        )}
        {messages.data?.map((item) => (
          <div
            key={item.id}
            data-unread-id={item.senderAccountId!==accountId && !item.readAt ? item.id : undefined}
            className={`flex ${item.senderAccountId === accountId ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${item.senderAccountId === accountId ? "bg-emerald-600 text-white" : "bg-white shadow-sm"}`}
            >
              <p className="whitespace-pre-wrap break-words text-sm">
                {item.content}
              </p>
              <time className="mt-1 block text-right text-[10px] opacity-70">
                {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              {item.senderAccountId===accountId && <p className="text-right text-[10px] opacity-80">{item.readAt?"Đã xem":item.deliveredAt?"Đã nhận · Chưa xem":"Đã gửi"}</p>}
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="border-t p-3"
      >
        {send.isError && (
          <p role="alert" className="mb-2 text-sm text-red-600">
            Chưa xác nhận được gửi tin. Nội dung đã được giữ lại; kiểm tra hội
            thoại trước khi gửi lại.
          </p>
        )}
        <div className="flex gap-2">
          <textarea
            aria-label="Nội dung tin nhắn"
            maxLength={5000}
            rows={2}
            value={draft}
            disabled={send.isPending}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nhập tin nhắn…"
            className="min-w-0 flex-1 resize-none rounded-xl bg-slate-100 p-3 text-sm"
          />
          <button
            aria-label="Gửi tin nhắn"
            disabled={send.isPending || !draft.trim() || !messages.isSuccess}
            className="rounded-xl bg-emerald-600 px-4 text-white disabled:opacity-50"
          >
            <Send className="size-5" />
          </button>
        </div>
      </form>
    </>
  );
}
