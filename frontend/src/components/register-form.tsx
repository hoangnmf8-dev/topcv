"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, Building2, CheckCircle2, Clock3, Eye, EyeOff, Lock, Mail, Phone, RefreshCw, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

import { registerAction, resendVerificationAction, verifyRegistrationAction } from "@/actions/auth.action";
import { AuthForm } from "@/components/auth-form";
import { GoogleButton } from "@/components/google-button";
import type { Role } from "@/components/role-selector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAccountStore } from "@/stores/auth.store";
import { type RegisterInput, registerSchema } from "@/validators/auth.validate";

type Step = "form" | "otp" | "success";
const OTP_TTL = 600;
const RESEND_TTL = 60;

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 2)}${"*".repeat(Math.max(3, name.length - 2))}@${domain}`;
}

function formatTime(total: number) {
  return `${Math.floor(total / 60).toString().padStart(2, "0")}:${(total % 60).toString().padStart(2, "0")}`;
}

export function RegisterForm({ role, onVerificationChange }: { role: Role; onVerificationChange?: (active: boolean) => void }) {
  const [step, setStep] = React.useState<Step>("form");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [serverError, setServerError] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [otpSeconds, setOtpSeconds] = React.useState(OTP_TTL);
  const [resendSeconds, setResendSeconds] = React.useState(RESEND_TTL);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const router = useRouter();
  const setAccount = useAccountStore((state) => state.setAccount);
  const {
    register,
    control,
    watch,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    mode: "onBlur",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });
  const email = watch("email");
  const isCompany = role === "employer";

  React.useEffect(() => {
    onVerificationChange?.(step !== "form");
    return () => onVerificationChange?.(false);
  }, [onVerificationChange, step]);

  React.useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => {
      setOtpSeconds((value) => Math.max(0, value - 1));
      setResendSeconds((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  async function submitRegistration(values: RegisterInput) {
    setServerError("");
    if (isCompany && !values.companyName.trim()) {
      setError("companyName", { message: "Không được để trống tên công ty" });
      return;
    }
    if (!isCompany && !values.fullName.trim()) {
      setError("fullName", { message: "Không được để trống họ và tên" });
      return;
    }

    const result = await registerAction(values, isCompany ? "company" : "candidate");
    if (!result.success) {
      setServerError(result.message);
      return;
    }

    setOtp("");
    setOtpSeconds(OTP_TTL);
    setResendSeconds(RESEND_TTL);
    setStep("otp");
    toast.success("Mã xác minh đã được gửi đến email của bạn");
  }

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.length !== 6 || otpSeconds === 0 || isVerifying || isResending) return;
    setServerError("");
    try {
      setIsVerifying(true);
      const result = await verifyRegistrationAction(email, otp);
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      await setAccount();
      setStep("success");
      toast.success("Xác minh email thành công");
    } catch {
      setServerError("Xác minh thành công nhưng không thể tải hồ sơ. Vui lòng đăng nhập lại.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function resend() {
    setServerError("");
    try {
      setIsResending(true);
      const result = await resendVerificationAction(email);
      if (!result.success) {
        setServerError(result.message);
        return;
      }
      setOtp("");
      setOtpSeconds(OTP_TTL);
      setResendSeconds(RESEND_TTL);
      toast.success("Đã gửi lại mã xác minh");
    } finally {
      setIsResending(false);
    }
  }

  if (step === "success") {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-primary"><CheckCircle2 className="size-9" /></div>
        <h2 className="mt-5 text-xl font-bold">Xác minh thành công!</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Tài khoản của bạn đã sẵn sàng. Chào mừng bạn đến với TopCV.</p>
        <Button size="lg" className="mt-6 w-full font-semibold" onClick={() => router.replace(isCompany ? "/employer" : "/candidate")}>Bắt đầu sử dụng</Button>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <AuthForm onSubmit={verify} onSubmitError={() => setServerError("Không thể gửi yêu cầu xác minh. Vui lòng thử lại.")} className="py-1">
        <button type="button" onClick={() => { setStep("form"); setServerError(""); setOtp(""); }} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Thay đổi thông tin</button>
        <div className="mt-5 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-primary"><ShieldCheck className="size-7" /></div>
          <h2 className="mt-4 text-xl font-bold">Xác minh email</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Nhập mã gồm 6 chữ số vừa được gửi tới<br /><strong className="text-foreground">{maskEmail(email)}</strong></p>
        </div>
        <InputOTP id="register-otp" maxLength={6} value={otp} onChange={(value) => { setOtp(value); setServerError(""); }} containerClassName="mt-6 justify-center" autoFocus>
          <InputOTPGroup className="gap-2 [&>[data-slot=input-otp-slot]]:size-11 [&>[data-slot=input-otp-slot]]:rounded-xl [&>[data-slot=input-otp-slot]]:border sm:[&>[data-slot=input-otp-slot]]:size-12">
            {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} />)}
          </InputOTPGroup>
        </InputOTP>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"><Clock3 className="size-4" />{otpSeconds ? <span>Mã có hiệu lực trong <strong className="text-foreground">{formatTime(otpSeconds)}</strong></span> : <span className="font-medium text-destructive">Mã OTP đã hết hạn</span>}</div>
        {serverError && <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-center text-sm text-destructive">{serverError}</p>}
        <Button type="submit" size="lg" className="mt-5 w-full font-semibold" disabled={otp.length !== 6 || otpSeconds === 0 || isVerifying}><ShieldCheck />{isVerifying ? "Đang xác minh..." : "Xác nhận mã OTP"}</Button>
        <div className="mt-5 text-center text-sm text-muted-foreground">Chưa nhận được mã? <button type="button" onClick={resend} disabled={resendSeconds > 0 || isResending} className="inline-flex items-center gap-1 font-semibold text-primary disabled:cursor-not-allowed disabled:text-muted-foreground"><RefreshCw className="size-3.5" />{isResending ? "Đang gửi..." : resendSeconds ? `Gửi lại sau ${resendSeconds}s` : "Gửi lại mã"}</button></div>
      </AuthForm>
    );
  }

  return (
    <AuthForm onSubmit={handleSubmit(submitRegistration)} onSubmitError={() => setServerError("Không thể gửi yêu cầu đăng ký. Vui lòng thử lại.")} noValidate>
      <FieldGroup>
        {!isCompany && <Field>
          <FieldLabel htmlFor="reg-name">Họ và tên</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.fullName)}><InputGroupAddon><User /></InputGroupAddon><InputGroupInput id="reg-name" autoComplete="name" placeholder="Nguyễn Văn A" aria-invalid={Boolean(errors.fullName)} {...register("fullName", { onChange: () => { setServerError(""); clearErrors("fullName"); } })} /></InputGroup>
          {errors.fullName && <ErrorText>{errors.fullName.message}</ErrorText>}
        </Field>}
        {isCompany && <Field>
          <FieldLabel htmlFor="reg-company">Tên công ty / Doanh nghiệp</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.companyName)}><InputGroupAddon><Building2 /></InputGroupAddon><InputGroupInput id="reg-company" autoComplete="organization" placeholder="Công ty TNHH ABC" aria-invalid={Boolean(errors.companyName)} {...register("companyName", { onChange: () => { setServerError(""); clearErrors("companyName"); } })} /></InputGroup>
          {errors.companyName && <ErrorText>{errors.companyName.message}</ErrorText>}
        </Field>}
        <Field>
          <FieldLabel htmlFor="reg-email">Email</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.email)}><InputGroupAddon><Mail /></InputGroupAddon><InputGroupInput id="reg-email" type="email" autoComplete="email" placeholder="ban@example.com" aria-invalid={Boolean(errors.email)} {...register("email", { onChange: () => setServerError("") })} /></InputGroup>
          {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
        </Field>
        <Field>
          <FieldLabel htmlFor="reg-phone">Số điện thoại <span className="font-normal text-muted-foreground">(không bắt buộc)</span></FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.phone)}><InputGroupAddon><Phone /></InputGroupAddon><InputGroupInput id="reg-phone" type="tel" autoComplete="tel" placeholder="0912 345 678" aria-invalid={Boolean(errors.phone)} {...register("phone", { onChange: () => setServerError("") })} /></InputGroup>
          {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
        </Field>
        <Field>
          <FieldLabel htmlFor="reg-password">Mật khẩu</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.password)}><InputGroupAddon><Lock /></InputGroupAddon><InputGroupInput id="reg-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" aria-invalid={Boolean(errors.password)} {...register("password", { onChange: () => setServerError("") })} /><InputGroupAddon align="inline-end"><InputGroupButton type="button" size="icon-sm" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff /> : <Eye />}</InputGroupButton></InputGroupAddon></InputGroup>
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}
        </Field>
        <Field>
          <FieldLabel htmlFor="reg-confirm">Xác nhận mật khẩu</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.confirmPassword)}><InputGroupAddon><Lock /></InputGroupAddon><InputGroupInput id="reg-confirm" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Nhập lại mật khẩu" aria-invalid={Boolean(errors.confirmPassword)} {...register("confirmPassword", { onChange: () => setServerError("") })} /><InputGroupAddon align="inline-end"><InputGroupButton type="button" size="icon-sm" aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"} onClick={() => setShowConfirm((value) => !value)}>{showConfirm ? <EyeOff /> : <Eye />}</InputGroupButton></InputGroupAddon></InputGroup>
          {errors.confirmPassword && <ErrorText>{errors.confirmPassword.message}</ErrorText>}
        </Field>
        {serverError && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{serverError}</p>}
        <Controller control={control} name="termsAccepted" render={({ field }) => <label className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground"><Checkbox id="terms" className="mt-0.5" checked={field.value} onCheckedChange={(checked) => field.onChange(checked === true)} /><span className="leading-snug">Tôi đồng ý với <a href="#" className="font-medium text-primary hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="font-medium text-primary hover:underline">Chính sách bảo mật</a></span></label>} />
        {errors.termsAccepted && <ErrorText>{errors.termsAccepted.message}</ErrorText>}
        <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting}><Mail />{isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản & nhận OTP"}</Button>
        <GoogleButton label="Đăng ký với Google" />
      </FieldGroup>
    </AuthForm>
  );
}

function ErrorText({ children }: { children?: string }) {
  return children ? <p className="mt-1 text-sm text-destructive">{children}</p> : null;
}
