"use client";
import {useState} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { GoogleButton } from "@/components/google-button";
import { useForm, Controller } from "react-hook-form";
import { LoginInput, loginSchema } from "@/validators/auth.validate";
import { convertServerPatchToFullTree } from "next/dist/client/components/segment-cache/navigation";
import { getAccesToken, loginAction } from "@/actions/auth.action";

export function LoginForm({
  onForgotPassword,
}: {
  onForgotPassword: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isFault, setIsFault] = useState("");
  const router = useRouter();
  const { register, control, handleSubmit, setError, formState } =
    useForm<LoginInput>({
      mode: "onChange",
      resolver: zodResolver(loginSchema),
      defaultValues: {
        email: "",
        password: "",
      },
    });
  const { errors, isSubmitting } = formState;
  async function onSubmit(values: LoginInput) {
    const response = await loginAction(values);
    router.push("/");
    if(!response.success) {
      setIsFault(response.errors.message);
    };
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="login-email">Email / Số điện thoại</FieldLabel>
          <InputGroup className="h-11" aria-invalid={Boolean(errors.email)}>
            <InputGroupAddon>
              <Mail />
            </InputGroupAddon>
            <InputGroupInput
              id="login-email"
              type="text"
              autoComplete="username"
              placeholder="Nhập email hoặc số điện thoại"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
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
              {...register("password")}
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

        {isFault && (
          <p role="alert" className="text-sm text-destructive">
            {isFault}
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
    </form>
  );
}
