import z from "zod";

export const registerSchema = z
  .object({
    role: z.enum(["candidate", "company"]),
    fullName: z.string().min(1, "Không được để trống tên"),
    email: z
      .string()
      .min(1, "Không được để trống email")
      .pipe(z.email("Email không hợp lệ")),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, "Nhập tối thiểu 8 kí tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
      .regex(
        /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~+=/]/,
        "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
      ),
    confirmPassword: z.string().min(8, "Nhập tối thiểu 8 kí tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Không được để trống email")
    .pipe(z.email("Email không hợp lệ")),
  password: z
    .string()
    .min(8, "Nhập tối thiểu 8 kí tự")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
    .regex(
      /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~+=/]/,
      "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
    ),
});
export const resetPasswordSchema = z.object({
  accountId: z.string().min(1, "Không được để trống account id"),
  password: z
    .string()
    .min(8, "Nhập tối thiểu 8 kí tự")
    .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa")
    .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
    .regex(
      /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~+=/]/,
      "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
    ),
});
