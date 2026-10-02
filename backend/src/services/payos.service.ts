import { PayOS } from "@payos/node";
import { AppError } from "../exceptions";

export function paymentsConfigured() {
  return !!(
    process.env.PAYOS_CLIENT_ID &&
    process.env.PAYOS_API_KEY &&
    process.env.PAYOS_CHECKSUM_KEY &&
    process.env.PAYMENT_RETURN_URL
  );
}
export function payos() {
  if (!paymentsConfigured())
    throw new AppError(
      "Thanh toán chưa được cấu hình. Vui lòng quay lại sau.",
      "PAYMENT_NOT_CONFIGURED",
      503,
    );
  return new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID!,
    apiKey: process.env.PAYOS_API_KEY!,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
    timeout: 8000,
    maxRetries: 0,
  });
}
