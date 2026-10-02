"use client";
import { useProfileCompletion } from "@/hooks/use-profile-completion";
export function ProfileCompletion() {
  const query = useProfileCompletion();
  if (query.isPending)
    return (
      <p role="status" className="text-sm text-slate-500">
        Đang tải mức độ hoàn thiện hồ sơ…
      </p>
    );
  if (query.isError)
    return (
      <p role="alert" className="text-sm text-red-600">
        Không tải được mức độ hoàn thiện.{" "}
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="underline"
        >
          Thử lại
        </button>
      </p>
    );
  const data = query.data;
  return (
    <div>
      <p className="text-sm text-slate-500">Mức độ hoàn thiện hồ sơ</p>
      <div
        role="progressbar"
        aria-label="Mức độ hoàn thiện hồ sơ"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={data.percentage}
        className="mt-3 h-2 w-full max-w-80 rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-emerald-600 transition-all"
          style={{ width: `${data.percentage}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {data.percentage}% ·{" "}
        {data.percentage === 100
          ? "Hồ sơ đã hoàn thiện."
          : "Bổ sung các mục còn thiếu để hoàn thiện hồ sơ."}
      </p>
      <ul className="mt-3 flex max-w-lg flex-wrap gap-2">
        {data.items.map((item) => (
          <li
            key={item.code}
            className={`rounded-full px-2.5 py-1 text-xs ${item.completed ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
          >
            {item.completed ? "✓ " : ""}
            {item.label} · {item.points}%
          </li>
        ))}
      </ul>
    </div>
  );
}
