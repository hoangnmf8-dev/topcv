"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { loginAction } from "@/actions/auth.action";
import { AuthForm } from "@/components/auth-form";
import { GoogleButton } from "@/components/google-button";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useAccountStore } from "@/stores/auth.store";
import { type LoginInput, loginSchema } from "@/validators/auth.validate";

export function LoginForm({
  onForgotPassword,
}: {
  onForgotPassword: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const setAccount = useAccountStore((state) => state.setAccount);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    mode: "onBlur",
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  async function onSubmit(values: LoginInput) {
    setServerError("");
    const result = await loginAction(values);
    if (!result.success) {
      setServerError(result.message);
      return;
    }
    try {
      const account = await setAccount();
      toast.success("Đăng nhập thành công");
      router.replace(
        account.role === "company"
          ? "/employer"
          : account.role === "admin"
            ? "/admin"
            : "/",
      );
    } catch {
      setServerError(
        "Đăng nhập thành công nhưng không thể tải hồ sơ. Vui lòng thử lại.",
      );
    }
  }

  return (
    <AuthForm
      onSubmit={handleSubmit(onSubmit)}
      onSubmitError={() =>
        setServerError("Không thể gửi yêu cầu đăng nhập. Vui lòng thử lại.")
      }
      noValidate
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.email)}>
            <InputGroupAddon>
              <Mail />
            </InputGroupAddon>
            <InputGroupInput
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register("email", { onChange: () => setServerError("") })}
            />
          </InputGroup>
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.password)}>
            <InputGroupAddon>
              <Lock />
            </InputGroupAddon>
            <InputGroupInput
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              aria-invalid={Boolean(errors.password)}
              {...register("password", { onChange: () => setServerError("") })}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                size="icon-sm"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </Field>

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium text-primary hover:underline"
          >
            Quên mật khẩu?
          </button>
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full font-semibold"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
        <FieldSeparator>Hoặc đăng nhập bằng</FieldSeparator>
        <GoogleButton label="Đăng nhập với Google" />
      </FieldGroup>
    </AuthForm>
  );
}
