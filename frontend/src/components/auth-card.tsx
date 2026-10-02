"use client"
import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TopCvLogo } from "@/components/topcv-logo"
import { RoleSelector, type Role } from "@/components/role-selector"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { ForgotPasswordDialog } from "@/components/forgot-password-dialog"
import { useRouter } from "next/navigation"
import { useAccountStore } from "@/stores/auth.store"

export function AuthCard() {
  const router = useRouter()
  const account = useAccountStore((state) => state.account)
  React.useEffect(() => {
    if (account) router.replace(account.role === "company" ? "/employer" : account.role === "admin" ? "/admin" : "/")
  }, [account, router])
  const [role, setRole] = React.useState<Role>("candidate")
  const [tab, setTab] = React.useState("login")
  const [forgotOpen, setForgotOpen] = React.useState(false)
  const [verificationActive, setVerificationActive] = React.useState(false)
  const [googleError, setGoogleError] = React.useState("")
  React.useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.get("tab") === "register") setTab("register")
    const error = url.searchParams.get("authError")
    if (!error) return
    setGoogleError(error === "google_cancelled" ? "Bạn đã hủy đăng nhập Google." : error === "google_unavailable" ? "Đăng nhập Google chưa khả dụng. Vui lòng thử lại sau." : "Không thể đăng nhập Google. Vui lòng thử lại hoặc đăng nhập bằng mật khẩu.")
    url.searchParams.delete("authError")
    window.history.replaceState(window.history.state, "", url)
  }, [])

  if (account) return null

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
          {googleError && <p role="alert" className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{googleError}</p>}
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
