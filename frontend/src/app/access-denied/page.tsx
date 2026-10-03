import Link from "next/link";

export default async function AccessDenied({ searchParams }: { searchParams: Promise<{ reason?: string; home?: string }> }) {
  const { reason, home } = await searchParams;
  const destination = home === "/employer" || home === "/admin" ? home : "/";
  const login = reason === "login";
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="rounded-2xl bg-white p-10 text-center shadow"><h1 className="mb-6 text-xl font-semibold">{login ? "Đăng nhập để sử dụng tính năng này" : "Không có quyền truy cập"}</h1><Link className="text-emerald-700 underline" href={login ? "/login" : destination}>{login ? "Đăng nhập" : "Về trang chủ"}</Link></div></main>;
}
