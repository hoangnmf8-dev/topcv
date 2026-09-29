"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { TopCvLogo } from "@/components/topcv-logo";
import { RoleFooter } from "@/components/role-footer";
import { useForm } from "react-hook-form";
import {
  resetPasswordInput,
  resetPasswordSchema,
} from "@/validators/auth.validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { httpProtocol } from "node_modules/zod/v4/core/regexes.cjs";
import authService from "@/services/auth.service";
import { useAccountStore } from "@/stores/auth.store";
import { toast } from "sonner";

interface PasswordFieldProps extends React.ComponentProps<"input"> {
  id: string;
  label: string;
  error?: string;
}
export default function SecurityPage() {
  const { account } = useAccountStore((state) => state);
  const { register, formState, handleSubmit } = useForm<resetPasswordInput>({
    mode: "onChange",
    resolver: zodResolver(resetPasswordSchema),
  });
  const onSubmit = async (values: resetPasswordInput) => {
    const response = await authService.changePassword(
      account?.id!,
      values.password,
    );
    if (response.success) {
      toast.success(response.message);
    } else {
      toast.error(response.message);
    }
  };
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <main className="relative flex-1 overflow-hidden px-4 py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]"
        />
        <div className="relative mx-auto w-full max-w-lg">
          <div className="mb-7 flex justify-center">
            <TopCvLogo />
          </div>
          <section className="rounded-2xl border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8">
            <>
              <Link
                href="/candidate"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Quay lại tài khoản
              </Link>
              <div className="mt-5 flex items-start gap-4">
                <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-primary">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Đổi mật khẩu</h1>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn.
                  </p>
                </div>
              </div>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-6 space-y-5"
              >
                <PasswordField
                  id="new-password"
                  label="Mật khẩu mới"
                  placeholder="Nhập mật khẩu mới"
                  error={formState.errors.password?.message}
                  {...register("password")}
                />

                <PasswordField
                  id="confirm-password"
                  label="Xác nhận mật khẩu mới"
                  placeholder="Nhập lại mật khẩu mới"
                  error={formState.errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-semibold"
                  disabled={formState.isSubmitting}
                >
                  {formState.isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <KeyRound />
                  )}
                  {formState.isSubmitting
                    ? "Đang cập nhật..."
                    : "Cập nhật mật khẩu"}
                </Button>
              </form>
            </>
          </section>
          <p className="mt-5 text-center text-xs text-muted-foreground">
            TopCV không bao giờ yêu cầu bạn cung cấp mật khẩu qua email hoặc
            điện thoại.
          </p>
        </div>
      </main>
      <RoleFooter variant="minimal" />
    </div>
  );
}
const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ id, label, error, className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);
    return (
      <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <InputGroup className="h-11">
          <InputGroupAddon>
            <LockKeyhole className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            {...props}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-sm"
              onClick={() => setVisible((prev) => !prev)}
              aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {visible ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {error && (
          <p className="mt-1 text-xs font-medium text-destructive">{error}</p>
        )}
      </Field>
    );
  },
);
