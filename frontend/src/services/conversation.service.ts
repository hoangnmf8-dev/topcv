import { httpRequest } from "@/lib/utils";

export type ChatMessage = { id: string; conversationId: string; senderAccountId: string; content: string | null; createdAt: string; deliveredAt: string | null; readAt: string | null };
export type Conversation = { id: string; lastMessageAt: string | null; candidate: { id: string; accountId: string; fullName: string }; company: { id: string; accountId: string; name: string }; messages: ChatMessage[] };
export const conversationService = {
  async list(signal?: AbortSignal, page = 1, search = ""): Promise<Conversation[]> {
    return (await httpRequest.get("/conversation", { signal, params: { page, search } })).data.data;
  },
  async create(id: string): Promise<{ id: string }> {
    return (await httpRequest.post("/conversation", { id })).data.data;
  },
  async messages(id: string, signal?: AbortSignal, before?: string): Promise<ChatMessage[]> {
    return (await httpRequest.get(`/conversation/${id}/messages`, { signal, params:{before} })).data.data;
  },
  async send(id: string, content: string): Promise<ChatMessage> {
    return (await httpRequest.post(`/conversation/${id}/messages`, { content })).data.data;
  },
};
