"use client";
import { useEffect, useState } from "react";

export function ChatPresence({ online, lastActive }: { online: boolean; lastActive?: string | null }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer); }, [lastActive]);
  if (online) return <span className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-emerald-500" />Đang hoạt động</span>;
  const timestamp = lastActive ? Date.parse(lastActive) : NaN;
  if (!Number.isFinite(timestamp)) return <span>Chưa có thông tin hoạt động</span>;
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));
  return <span>{minutes < 1 ? "Hoạt động vừa xong" : `Hoạt động ${minutes} phút trước`}</span>;
}
