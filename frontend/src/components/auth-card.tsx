"use client"
import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopCvLogo } from "@/components/topcv-logo"
import { RoleSelector, type Role } from "@/components/role-selector"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog"

export function AuthCard() {
  const [role, setRole] = React.useState<Role>("candidate")
  const [tab, setTab] = React.useState("login")
  const [forgotOpen, setForgotOpen] = React.useState(false)
  const [verificationActive, setVerificationActive] = React.useState(false)

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex flex-col items-center gap-2">
        <TopCvLogo />
        <p className="text-sm text-muted-foreground">
          Nền tảng tuyển dụng hàng đầu Việt Nam
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-foreground/5 sm:p-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className={`h-11 w-full rounded-xl bg-muted p-1 ${verificationActive ? "hidden" : ""}`}>
            <TabsTrigger value="login" className="rounded-lg text-sm font-semibold">
              Đăng nhập
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg text-sm font-semibold">
              Đăng ký
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 flex flex-col gap-5">
            <div className={`flex flex-col gap-2 ${verificationActive || tab === "login" ? "hidden" : ""}`}>
              <span className="text-sm font-medium text-foreground">
                Bạn là
              </span>
              <RoleSelector value={role} onChange={setRole} />
            </div>
            <TabsContent value="login">
              <LoginForm onForgotPassword={() => setForgotOpen(true)} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm role={role} onVerificationChange={setVerificationActive} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground text-balance">
        Bằng việc tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo
        mật của TopCV.
      </p>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  )
}
