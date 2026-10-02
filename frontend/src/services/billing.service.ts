import { httpRequest } from "@/lib/utils";
export type Benefits = { cvLimit?: number; aiLimit?: number; activeJobLimit?: number } & Record<string, number | string | boolean>;
export type Plan = { id: string; name: string; price: string; audience: "candidate" | "company"; isFree: boolean; availability: "available" | "coming_soon" | "disabled"; purchasable: boolean; metadata: { benefits: Benefits } };
export type CvAccess = { count: number; limit: number; editingLocked: boolean; canCreate: boolean; planName: string };
export type Subscription = { id: string; startedAt: string; expiresAt: string; status: string };
export type Payment = { id: string; status: string; amount: string; checkoutUrl: string | null; createdAt: string; paidAt: string | null };
export type Order = { id: string; code: string; status: string; totalAmount: string; createdAt: string; paymentDeadlineAt: string | null; planSnapshot: { name: string }; payments: Payment[]; subscription: Subscription | null };
export const billingService = {
  plans: async (audience: string): Promise<Plan[]> => (await httpRequest.get("/billing/plans", { params: { audience } })).data.data,
  access: async (): Promise<CvAccess> => (await httpRequest.get("/billing/cv-access")).data.data,
  subscription: async (): Promise<{ name: string; benefits: Benefits; subscription: Subscription | null; scheduled: Subscription[] }> => (await httpRequest.get("/billing/subscription")).data.data,
  orders: async (): Promise<Order[]> => (await httpRequest.get("/billing/orders")).data.data,
  create: async (planId: string, requestKey: string): Promise<{ id: string }> => (await httpRequest.post("/billing/orders", { planId, requestKey })).data.data,
  checkout: async (id: string): Promise<Payment> => (await httpRequest.post(`/billing/orders/${id}/checkout`)).data.data,
  reconcile: async (id: string) => httpRequest.post(`/billing/orders/${id}/reconcile`),
};
