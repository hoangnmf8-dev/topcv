"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, BriefcaseBusiness, MoreHorizontal, Paperclip, Search, Send, UserRound } from "lucide-react"
import { EmployerHeader } from "@/components/employer-header"
import { RoleFooter } from "@/components/role-footer"

const conversations = [] as { name: string; role: string; job: string; text: string; time: string; unread: number; }[]

export default function EmployerMessagesPage() {
  const [active, setActive] = useState(0)
  const [mobileChat, setMobileChat] = useState(false)
  const [message, setMessage] = useState("")
  const [history, setHistory] = useState(([] as string[]))
  const current = conversations[active] ?? { name: "Chưa chọn cuộc trò chuyện", role: "", job: "", text: "", time: "", unread: 0 }
  function send() {return;}

  return <main className="route-employer min-h-screen bg-[#f4f6f8] text-slate-800">
    <EmployerHeader />
    <div className="mx-auto w-full max-w-[1280px] px-4 py-4 sm:px-6 sm:py-7">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div><p className="text-sm font-semibold text-[#008f40]">Trung tâm Nhà tuyển dụng</p><h1 className="mt-1 text-2xl font-bold sm:text-3xl">Tin nhắn với ứng viên</h1></div>
        <Link href="/employer" className="inline-flex items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm font-bold"><ArrowLeft className="size-4"/>Quay lại dashboard</Link>
      </div>
      <div className="grid min-h-[560px] overflow-hidden rounded-2xl bg-white shadow-sm md:h-[calc(100vh-190px)] md:grid-cols-[340px_minmax(0,1fr)]">
        <aside className={`${mobileChat ? "hidden" : "flex"} min-h-[560px] flex-col border-r border-slate-100 md:flex`}>
          <div className="border-b p-4"><div className="flex items-center justify-between"><h2 className="font-bold">Hộp thư tuyển dụng</h2><span className="rounded-full bg-[#e7f9ef] px-2.5 py-1 text-xs font-bold text-[#008f40]">2 chưa đọc</span></div><label className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5"><Search className="size-4 text-slate-400"/><input className="w-full bg-transparent text-sm outline-none" placeholder="Tìm ứng viên, vị trí..."/></label></div>
          <div className="overflow-y-auto">{conversations.map((chat, index) => <button key={chat.name} onClick={() => { setActive(index); setMobileChat(true) }} className={`flex w-full gap-3 border-b border-slate-50 px-4 py-4 text-left transition ${active === index ? "bg-[#eaf9f0]" : "hover:bg-slate-50"}`}><span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#203246] font-bold text-white">{chat.name[0]}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><b className="truncate text-sm">{chat.name}</b><small className="shrink-0 text-slate-400">{chat.time}</small></span><span className="mt-0.5 block truncate text-xs font-medium text-[#008f40]">{chat.job}</span><span className="mt-1 flex items-center gap-2"><small className="min-w-0 flex-1 truncate text-slate-500">{chat.text}</small>{chat.unread > 0 && <i className="grid size-5 shrink-0 place-items-center rounded-full bg-[#00b14f] text-[10px] font-bold not-italic text-white">{chat.unread}</i>}</span></span></button>)}</div>
        </aside>
        <section className={`${mobileChat ? "flex" : "hidden"} min-h-[560px] min-w-0 flex-col md:flex`}>
          <div className="flex items-center justify-between gap-3 border-b p-3 sm:p-4"><button onClick={() => setMobileChat(false)} className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 md:hidden" aria-label="Trở về danh sách"><ArrowLeft className="size-4"/></button><span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#203246] font-bold text-white">{current.name[0]}</span><div className="min-w-0 flex-1"><p className="truncate font-bold">{current.name}</p><p className="truncate text-xs text-slate-500">{current.role} · <span className="text-[#008f40]">{current.job}</span></p></div><MoreHorizontal className="size-5 shrink-0"/></div>
          <div className="flex items-center gap-2 border-b bg-emerald-50/60 px-4 py-2.5 text-xs text-slate-600"><BriefcaseBusiness className="size-4 shrink-0 text-[#008f40]"/><span className="truncate">Cuộc trò chuyện gắn với tin: <b>{current.job}</b></span></div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#fafcfb] p-3 sm:p-5">{history.map((item, index) => <div key={`${item}-${index}`} className={`flex items-end gap-2 ${index % 2 === 0 ? "justify-end" : ""}`}>{index % 2 !== 0 && <span className="grid size-7 shrink-0 place-items-center rounded-full bg-slate-200"><UserRound className="size-4"/></span>}<p className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[72%] ${index % 2 === 0 ? "rounded-br-sm bg-[#203246] text-white" : "rounded-bl-sm bg-white text-slate-700 shadow-sm"}`}>{item}</p></div>)}</div>
          <div className="border-t bg-white p-3 sm:p-4"><div className="flex items-center gap-2"><button className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-500" aria-label="Đính kèm"><Paperclip className="size-5"/></button><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => event.key === "Enter" && send()} className="h-11 min-w-0 flex-1 rounded-xl bg-slate-100 px-4 text-sm outline-none" placeholder="Nhập tin nhắn cho ứng viên..."/><button disabled title="Gửi tin nhắn hiện chưa khả dụng" onClick={send} className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#00b14f] text-white" aria-label="Gửi tin nhắn"><Send className="size-4"/></button></div><p className="mt-2 pl-12 text-[11px] text-slate-400">Tin nhắn được lưu trong hồ sơ tuyển dụng của công ty.</p></div>
        </section>
      </div>
    </div>
    <RoleFooter variant="employer" />
  </main>
}
