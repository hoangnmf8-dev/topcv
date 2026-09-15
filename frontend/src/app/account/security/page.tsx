"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Check, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react"

import { changePassword } from "@/lib/auth-mock"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { TopCvLogo } from "@/components/topcv-logo"
import { RoleFooter } from "@/components/role-footer"

export default function SecurityPage() {
  const [form, setForm] = React.useState({ currentPassword: "", newPassword: "", confirmPassword: "" })
  const [visible, setVisible] = React.useState({ current: false, next: false })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  const rules = {
    length: form.newPassword.length >= 8,
    upper: /[A-Z]/.test(form.newPassword),
    number: /\d/.test(form.newPassword),
    special: /[^A-Za-z0-9]/.test(form.newPassword),
  }
  const strongEnough = Object.values(rules).every(Boolean)

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("")
    if (!strongEnough) return setError("Mật khẩu mới chưa đáp ứng các yêu cầu bảo mật.")
    if (form.newPassword !== form.confirmPassword) return setError("Mật khẩu xác nhận không khớp.")
    if (form.currentPassword === form.newPassword) return setError("Mật khẩu mới phải khác mật khẩu hiện tại.")
    setLoading(true)
    try { await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }); setSuccess(true) }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Không thể đổi mật khẩu.") }
    finally { setLoading(false) }
  }

  return <div className="flex min-h-svh flex-col bg-background"><main className="relative flex-1 overflow-hidden px-4 py-10">
    <div aria-hidden className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]" />
    <div className="relative mx-auto w-full max-w-lg">
      <div className="mb-7 flex justify-center"><TopCvLogo /></div>
      <section className="rounded-2xl border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8">
        {!success ? <>
          <Link href="/candidate" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Quay lại tài khoản</Link>
          <div className="mt-5 flex items-start gap-4"><div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-primary"><ShieldCheck className="size-6" /></div><div><h1 className="text-2xl font-bold">Đổi mật khẩu</h1><p className="mt-1 text-sm leading-6 text-muted-foreground">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p></div></div>
          <form onSubmit={submit} className="mt-6 space-y-5">
            <PasswordField id="current-password" label="Mật khẩu hiện tại" value={form.currentPassword} visible={visible.current} autoComplete="current-password" onVisible={() => setVisible((value) => ({ ...value, current: !value.current }))} onChange={(value) => setForm((current) => ({ ...current, currentPassword: value }))} />
            <PasswordField id="new-password" label="Mật khẩu mới" value={form.newPassword} visible={visible.next} autoComplete="new-password" onVisible={() => setVisible((value) => ({ ...value, next: !value.next }))} onChange={(value) => setForm((current) => ({ ...current, newPassword: value }))} />
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-3 text-xs text-muted-foreground"><Rule ok={rules.length}>Ít nhất 8 ký tự</Rule><Rule ok={rules.upper}>Có chữ viết hoa</Rule><Rule ok={rules.number}>Có chữ số</Rule><Rule ok={rules.special}>Có ký tự đặc biệt</Rule></div>
            <PasswordField id="confirm-password" label="Xác nhận mật khẩu mới" value={form.confirmPassword} visible={visible.next} autoComplete="new-password" onVisible={() => setVisible((value) => ({ ...value, next: !value.next }))} onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))} />
            {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" className="w-full font-semibold" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <KeyRound />}{loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}</Button>
          </form>
        </> : <div className="py-6 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-primary"><CheckCircle2 className="size-9" /></div><h1 className="mt-5 text-2xl font-bold">Đổi mật khẩu thành công</h1><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Mật khẩu đã được cập nhật và các phiên đăng nhập khác đã được thu hồi.</p><Button className="mt-6 w-full" onClick={() => { setSuccess(false); setForm({ currentPassword: "", newPassword: "", confirmPassword: "" }) }}>Hoàn tất</Button></div>}
      </section>
      <p className="mt-5 text-center text-xs text-muted-foreground">TopCV không bao giờ yêu cầu bạn cung cấp mật khẩu qua email hoặc điện thoại.</p>
    </div>
  </main><RoleFooter variant="minimal" /></div>
}

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) { return <span className={`flex items-center gap-1.5 ${ok ? "font-medium text-primary" : ""}`}><Check className="size-3.5" />{children}</span> }

function PasswordField({ id, label, value, visible, autoComplete, onVisible, onChange }: { id: string; label: string; value: string; visible: boolean; autoComplete: string; onVisible: () => void; onChange: (value: string) => void }) {
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><InputGroup className="h-11"><InputGroupAddon><LockKeyhole /></InputGroupAddon><InputGroupInput id={id} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder="Nhập mật khẩu" value={value} onChange={(event) => onChange(event.target.value)} required /><InputGroupAddon align="inline-end"><InputGroupButton type="button" size="icon-sm" onClick={onVisible} aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{visible ? <EyeOff /> : <Eye />}</InputGroupButton></InputGroupAddon></InputGroup></Field>
}
