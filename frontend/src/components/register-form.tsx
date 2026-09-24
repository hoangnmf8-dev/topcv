"use client"

import * as React from "react"
import { ArrowLeft, Building2, CheckCircle2, Clock3, Eye, EyeOff, Lock, Mail, Phone, RefreshCw, ShieldCheck, User } from "lucide-react"

import { GoogleButton } from "@/components/google-button"
import type { Role } from "@/components/role-selector"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

type Step = "form" | "otp" | "success"
const OTP_TTL = 600
const RESEND_TTL = 60
function maskEmail(email: string) {
  const [name, domain] = email.split("@")
  if (!name || !domain) return email
  return `${name.slice(0, 2)}${"*".repeat(Math.max(3, name.length - 2))}@${domain}`
}
function formatTime(total: number) {
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`
}

export function RegisterForm({ role, onVerificationChange }: { role: Role; onVerificationChange?: (active: boolean) => void }) {
  const [step, setStep] = React.useState<Step>("form")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [agreed, setAgreed] = React.useState(false)
  const [error, setError] = React.useState("")
  const [otp, setOtp] = React.useState("")
  const [otpSeconds, setOtpSeconds] = React.useState(OTP_TTL)
  const [resendSeconds, setResendSeconds] = React.useState(RESEND_TTL)
  const [form, setForm] = React.useState({ fullName: "", companyName: "", email: "", phone: "", password: "", confirmPassword: "" })

  React.useEffect(() => {
    onVerificationChange?.(step !== "form")
    return () => onVerificationChange?.(false)
  }, [onVerificationChange, step])

  React.useEffect(() => {
    if (step !== "otp") return
    const timer = window.setInterval(() => {
      setOtpSeconds((value) => Math.max(0, value - 1))
      setResendSeconds((value) => Math.max(0, value - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [step])

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  // Connect the registration API before advancing to OTP verification.
  function register(event: React.FormEvent) {
    event.preventDefault()
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.")
      return
    }
    showUnavailable()
  }

  function showUnavailable() {
    setError("Tính năng đăng ký hiện chưa khả dụng. Vui lòng thử lại sau.")
  }

  function verify(event: React.FormEvent) {
    event.preventDefault()
    showUnavailable()
  }

  if (step === "success") return (
    <div className="py-4 text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-primary"><CheckCircle2 className="size-9" /></div>
      <h2 className="mt-5 text-xl font-bold">Xác minh thành công!</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Tài khoản của bạn đã sẵn sàng. Chào mừng bạn đến với TopCV.</p>
      <Button size="lg" className="mt-6 w-full font-semibold" onClick={() => { window.location.href = role === "employer" ? "/employer" : "/candidate" }}>Bắt đầu sử dụng</Button>
    </div>
  )

  if (step === "otp") return (
    <form onSubmit={verify} className="py-1">
      <button type="button" onClick={() => { setStep("form"); setError(""); setOtp("") }} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Thay đổi thông tin</button>
      <div className="mt-5 text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-primary"><ShieldCheck className="size-7" /></div>
        <h2 className="mt-4 text-xl font-bold">Xác minh email</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Nhập mã gồm 6 chữ số vừa được gửi tới<br /><strong className="text-foreground">{maskEmail(form.email)}</strong></p>
      </div>
      <InputOTP id="register-otp" maxLength={6} value={otp} onChange={(value) => { setOtp(value); setError("") }} containerClassName="mt-6 justify-center" autoFocus>
        <InputOTPGroup className="gap-2 [&>[data-slot=input-otp-slot]]:size-11 [&>[data-slot=input-otp-slot]]:rounded-xl [&>[data-slot=input-otp-slot]]:border sm:[&>[data-slot=input-otp-slot]]:size-12">
          {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} />)}
        </InputOTPGroup>
      </InputOTP>
      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" />{otpSeconds ? <span>Mã có hiệu lực trong <strong className="text-foreground">{formatTime(otpSeconds)}</strong></span> : <span className="font-medium text-destructive">Mã OTP đã hết hạn</span>}</div>
      {error && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="mt-5 w-full font-semibold" disabled={otp.length !== 6 || otpSeconds === 0}><ShieldCheck />Xác nhận mã OTP</Button>
      <div className="mt-5 text-center text-sm text-muted-foreground">Chưa nhận được mã?{" "}<button type="button" onClick={showUnavailable} disabled={resendSeconds > 0} className="inline-flex items-center gap-1 font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"><RefreshCw className="size-3.5" />{resendSeconds ? `Gửi lại sau ${resendSeconds}s` : "Gửi lại mã"}</button></div>
    </form>
  )

  return (
    <form onSubmit={register}><FieldGroup>
      <TextField id="reg-name" label="Họ và tên" value={form.fullName} placeholder="Nguyễn Văn A" autoComplete="name" icon={<User />} onChange={(value) => update("fullName", value)} />
      {role === "employer" && <TextField id="reg-company" label="Tên công ty / Doanh nghiệp" value={form.companyName} placeholder="Công ty TNHH ABC" autoComplete="organization" icon={<Building2 />} onChange={(value) => update("companyName", value)} />}
      <TextField id="reg-email" label="Email" value={form.email} placeholder="ban@example.com" autoComplete="email" type="email" icon={<Mail />} onChange={(value) => update("email", value)} />
      <TextField id="reg-phone" label="Số điện thoại" value={form.phone} placeholder="0912 345 678" autoComplete="tel" type="tel" icon={<Phone />} onChange={(value) => update("phone", value)} />
      <PasswordField id="reg-password" label="Mật khẩu" value={form.password} placeholder="Tối thiểu 8 ký tự" visible={showPassword} onVisible={() => setShowPassword((value) => !value)} onChange={(value) => update("password", value)} />
      <PasswordField id="reg-confirm" label="Xác nhận mật khẩu" value={form.confirmPassword} placeholder="Nhập lại mật khẩu" visible={showConfirm} onVisible={() => setShowConfirm((value) => !value)} onChange={(value) => update("confirmPassword", value)} />
      {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
      <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground"><Checkbox id="terms" className="mt-0.5" checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} /><span className="leading-snug">Tôi đồng ý với <a href="#" className="font-medium text-primary hover:underline">Điều khoản dịch vụ</a> & <a href="#" className="font-medium text-primary hover:underline">Chính sách bảo mật</a></span></label>
      <Button type="submit" size="lg" className="w-full font-semibold" disabled={!agreed}><Mail />Tạo tài khoản & nhận OTP</Button>
      <GoogleButton label="Đăng ký với Google" />
    </FieldGroup></form>
  )
}

function TextField({ id, label, value, placeholder, autoComplete, type = "text", icon, onChange }: { id: string; label: string; value: string; placeholder: string; autoComplete: string; type?: string; icon: React.ReactNode; onChange: (value: string) => void }) {
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><InputGroup className="h-11"><InputGroupAddon>{icon}</InputGroupAddon><InputGroupInput id={id} type={type} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} required /></InputGroup></Field>
}

function PasswordField({ id, label, value, placeholder, visible, onVisible, onChange }: { id: string; label: string; value: string; placeholder: string; visible: boolean; onVisible: () => void; onChange: (value: string) => void }) {
  return <Field><FieldLabel htmlFor={id}>{label}</FieldLabel><InputGroup className="h-11"><InputGroupAddon><Lock /></InputGroupAddon><InputGroupInput id={id} type={visible ? "text" : "password"} autoComplete="new-password" placeholder={placeholder} minLength={8} value={value} onChange={(event) => onChange(event.target.value)} required /><InputGroupAddon align="inline-end"><InputGroupButton type="button" size="icon-sm" aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={onVisible}>{visible ? <EyeOff /> : <Eye />}</InputGroupButton></InputGroupAddon></InputGroup></Field>
}
