"use client";
import { useState } from "react";
import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const send = () => {return;};
  return (
    <div className="global-chat-widget fixed bottom-4 right-4 z-50 sm:bottom-5 sm:right-5">
      {open && (
        <div className="mb-3 w-[min(330px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#00b14f] px-4 py-3 text-white">
            <span className="flex items-center gap-2 font-bold">
              <Bot className="size-5" />
              Trợ lý TopCV
            </span>
            <button onClick={() => setOpen(false)}>
              <X className="size-5" />
            </button>
          </div>
          <div className="h-44 space-y-3 overflow-y-auto p-4 text-sm">
            <div className="w-fit max-w-[250px] rounded-2xl rounded-tl-sm bg-slate-100 px-3 py-2 text-slate-700">
              Chào bạn! Mình có thể hỗ trợ tìm việc, tạo CV hoặc giải đáp dịch
              vụ.
            </div>
            {messages.map((item,index)=><div key={`${item}-${index}`} className="ml-auto w-fit max-w-[250px] rounded-2xl rounded-tr-sm bg-[#00b14f] px-3 py-2 text-white">{item}</div>)}
            <p className="text-xs text-slate-400">
              Chưa có cuộc trò chuyện
            </p>
          </div>
          <div className="flex gap-2 border-t p-3">
            <input
              value={message}
              onChange={event=>setMessage(event.target.value)}
              onKeyDown={event=>event.key==="Enter"&&send()}
              className="min-w-0 flex-1 rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none"
              placeholder="Nhập tin nhắn..."
            />
            <button onClick={send} aria-label="Gửi tin nhắn" className="grid size-9 place-items-center rounded-xl bg-[#00b14f] text-white disabled:opacity-50" disabled>
              <Send className="size-4" />
            </button>
          </div>
          <Link
            href="/messages"
            className="block border-t py-2.5 text-center text-sm font-semibold text-[#00a649]"
          >
            Mở trang tin nhắn
          </Link>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="grid size-14 place-items-center rounded-full bg-[#00b14f] text-white shadow-lg shadow-green-600/30 transition hover:scale-105"
        aria-label="Mở trợ lý"
      >
        <MessageCircle className="size-6" />
      </button>
    </div>
  );
}
