export const MOCK_OTP = "123456"
export const MOCK_CURRENT_PASSWORD = "Demo@123"

function wait(ms = 650) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export type RegisterPayload = {
  fullName: string
  contactName?: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  role: "candidate" | "company"
}

export async function registerAccount(payload: RegisterPayload) {
  await wait()
  if (payload.email.toLowerCase().includes("exists")) throw new Error("Email đã được sử dụng.")
  return { accountId: `mock-${crypto.randomUUID()}`, expiresIn: 600 }
}

export async function verifyRegistrationOtp(payload: { accountId: string; otp: string }) {
  await wait()
  if (payload.otp !== MOCK_OTP) throw new Error("Mã OTP không chính xác. Vui lòng thử lại.")
  return { accessToken: "mock-access-token", refreshToken: "mock-refresh-token" }
}

export async function resendRegistrationOtp(_payload: { accountId: string }) {
  await wait(500)
  return { expiresIn: 600 }
}

export async function requestPasswordReset(_payload: { email: string }) {
  await wait()
  return { resetId: `reset-${crypto.randomUUID()}`, expiresIn: 600 }
}

export async function verifyPasswordResetOtp(payload: { resetId: string; otp: string }) {
  await wait()
  if (payload.otp !== MOCK_OTP) throw new Error("Mã OTP không chính xác hoặc đã hết hạn.")
  return { resetToken: `mock-reset-token-${payload.resetId}` }
}

export async function resetPassword(_payload: { resetToken: string; password: string }) {
  await wait()
}

export async function changePassword(payload: { currentPassword: string; newPassword: string }) {
  await wait()
  if (payload.currentPassword !== MOCK_CURRENT_PASSWORD) throw new Error("Mật khẩu hiện tại không chính xác.")
}
