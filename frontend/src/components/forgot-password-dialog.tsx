"use client";

import * as React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "email" | "otp" | "password" | "success";

export function ForgotPasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = React.useState<Step>("email");
  const [email, setEmail] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      const timeout = window.setTimeout(() => {
        setStep("email");
        setEmail("");
        setOtp("");
        setPassword("");
        setConfirmPassword("");
        setError("");
      }, 200);
      return () => window.clearTimeout(timeout);
    }
  }, [open]);

  // Connect the real password-reset API here before enabling these actions.
  function handleUnavailable(event?: React.FormEvent) {
    event?.preventDefault();
    setError("Tính năng đặt lại mật khẩu hiện chưa khả dụng. Vui lòng thử lại sau.");
  }

  const descriptions: Record<Step, string> = {
    email: "Nhập email tài khoản để nhận mã xác minh.",
    otp: `Mã gồm 6 chữ số đã được gửi tới ${email}.`,
    password: "Tạo mật khẩu mới an toàn cho tài khoản của bạn.",
    success: "Bạn có thể đăng nhập bằng mật khẩu mới.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === "success"
              ? "Đặt lại mật khẩu thành công"
              : "Quên mật khẩu"}
          </DialogTitle>
          <DialogDescription>{descriptions[step]}</DialogDescription>
        </DialogHeader>
        {step !== "email" && step !== "success" && (
          <button
            type="button"
            onClick={() => {
              setStep(step === "otp" ? "email" : "otp");
              setError("");
            }}
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Quay lại
          </button>
        )}

        {step === "email" && (
          <form onSubmit={handleUnavailable}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon>
                    <Mail />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="ban@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </InputGroup>
              </Field>
              <ErrorText error={error} />
              <Button type="submit" className="w-full">
                <Mail />Gửi
                mã OTP
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleUnavailable}>
            <div className="rounded-xl bg-emerald-50 p-3 text-center text-sm text-emerald-800">
              Kiểm tra cả thư mục Spam nếu bạn chưa thấy email.
            </div>
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setError("");
              }}
              containerClassName="my-6 justify-center"
              autoFocus
            >
              <InputOTPGroup className="gap-2 [&>[data-slot=input-otp-slot]]:size-11 [&>[data-slot=input-otp-slot]]:rounded-lg [&>[data-slot=input-otp-slot]]:border">
                {Array.from({ length: 6 }, (_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <ErrorText error={error} />
            <Button
              type="submit"
              className="w-full"
              disabled={otp.length !== 6}
            >
              <ShieldCheck />
              Xác minh OTP
            </Button>
            <button
              type="button"
              onClick={() => handleUnavailable()}
              className="mx-auto mt-4 flex items-center gap-1 text-sm font-medium text-primary"
            >
              <RefreshCw className="size-3.5" />
              Gửi lại mã
            </button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handleUnavailable}>
            <FieldGroup>
              <PasswordInput
                id="new-password"
                label="Mật khẩu mới"
                value={password}
                visible={visible}
                onChange={setPassword}
                onVisible={() => setVisible((value) => !value)}
              />
              <PasswordInput
                id="confirm-new-password"
                label="Xác nhận mật khẩu mới"
                value={confirmPassword}
                visible={visible}
                onChange={setConfirmPassword}
                onVisible={() => setVisible((value) => !value)}
              />
              <p className="text-xs leading-5 text-muted-foreground">
                Sử dụng ít nhất 8 ký tự, kết hợp chữ hoa, chữ thường, số và ký
                tự đặc biệt.
              </p>
              <ErrorText error={error} />
              <Button type="submit" className="w-full">
                <LockKeyhole />
                Đặt lại mật khẩu
              </Button>
            </FieldGroup>
          </form>
        )}

        {step === "success" && (
          <div className="py-3 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-primary">
              <CheckCircle2 className="size-9" />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Mật khẩu đã được cập nhật. Tất cả phiên đăng nhập cũ nên được đăng
              xuất để bảo vệ tài khoản.
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>
              Quay lại đăng nhập
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ErrorText({ error }: { error: string }) {
  return error ? (
    <p
      role="alert"
      className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
    >
      {error}
    </p>
  ) : null;
}

function PasswordInput({
  id,
  label,
  value,
  visible,
  onVisible,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  onVisible: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <InputGroup className="h-11">
        <InputGroupAddon>
          <LockKeyhole />
        </InputGroupAddon>
        <InputGroupInput
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          placeholder="Tối thiểu 8 ký tự"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-sm"
            onClick={onVisible}
            aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {visible ? <EyeOff /> : <Eye />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
