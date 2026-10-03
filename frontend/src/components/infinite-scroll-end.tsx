"use client";
import { useEffect, useRef } from "react";

export function InfiniteScrollEnd({
  hasNext,
  loading,
  error,
  load,
}: {
  hasNext: boolean;
  loading: boolean;
  error: boolean;
  load: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || !hasNext || loading || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) load();
      },
      { root: element.parentElement, rootMargin: "80px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNext, loading, error, load]);
  return (
    <div ref={ref} className="min-h-6 p-2 text-center text-xs text-slate-500">
      {loading ? (
        "Đang tải thêm…"
      ) : error && hasNext ? (
        <button onClick={load}>Không tải được. Thử lại</button>
      ) : !hasNext ? (
        "Đã hiển thị hết"
      ) : null}
    </div>
  );
}
