import * as z from "zod";
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
export type LoginInput = z.infer<typeof loginSchema>;

const passwordSchema = z
  .string()
  .min(8, "Nhập tối thiểu 8 kí tự")
  .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa")
  .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường")
  .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
  .regex(
    /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~+=/]/,
    "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
  );

export const registerSchema = z
  .object({
    fullName: z.string().trim(),
    companyName: z.string().trim(),
    email: z
      .string()
      .trim()
      .min(1, "Không được để trống email")
      .pipe(z.email("Email không hợp lệ")),
    phone: z
      .string()
      .trim()
      .refine(
        (value) => !value || /^(?:\+84|0)\d{9,10}$/.test(value.replace(/[.\s-]/g, "")),
        "Số điện thoại không hợp lệ",
      ),
    password: passwordSchema,
    confirmPassword: z.string(),
    termsAccepted: z
      .boolean()
      .refine((value) => value, "Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật"),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Xác nhận mật khẩu không khớp",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export const resetPasswordSchema = z
  .object({
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
    confirmPassword: z
      .string()
      .min(8, "Nhập tối thiểu 8 kí tự")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")
      .regex(
        /[!@#$%^&*(),.?":{}|<>_\-\\[\]`~+=/]/,
        "Mật khẩu phải có ít nhất 1 ký tự đặc biệt",
      ),
  })
  .superRefine((data, ctx) => {
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Xác nhận mật khẩu không khớp",
        path: ["confirmPassword"],
      });
    }
  });
  export type resetPasswordInput = z.infer<typeof resetPasswordSchema>;
