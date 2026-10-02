import { AppError } from "../exceptions";
import { publishMessage } from "../realtime";
import { messageSelect } from "../types/conversation.type";
import { prisma } from "../utils/prisma";
import { membership } from "../utils/realtime";

class ConversationService {
  async getConversation(profileId: string, page = 1, search = "") {
    const conversations = await prisma.conversation.findMany({
      where: { AND: [membership(profileId), ...(search ? [{ OR: [{ candidate: { fullName: { contains: search, mode: "insensitive" as const } } }, { company: { name: { contains: search, mode: "insensitive" as const } } }] }] : [])] },
      orderBy: [
        {
          lastMessageAt: {
            sort: "desc",
            nulls: "last",
          },
        },
        { id: "desc" },
      ],
      take: 20,
      skip: (page - 1) * 20,
      select: {
        id: true,
        lastMessageAt: true,
        candidate: {
          select: {
            id: true,
            accountId: true,
            fullName: true,
          },
        },
        company: {
          select: {
            id: true,
            accountId: true,
            name: true,
          },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 1,
          select: messageSelect,
        },
      },
    });
    return conversations;
  }
  async createConversation({
    candidateId,
    companyId,
  }: {
    candidateId: string;
    companyId: string;
  }) {
    const conversation = await prisma.conversation.upsert({
      where: {
        candidateId_companyId: {
          candidateId,
          companyId,
        },
      },
      create: {
        candidateId,
        companyId,
      },
      update: { deletedAt: null },
    });
    if (!conversation)
      throw new AppError(
        "Không thể tạo cuộc hội thoại",
        "INTERNAL SERVER",
        500,
      );
    return conversation;
  }
  async getMessages(profileId: string, conversationId: string, before?: string) {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        ...membership(profileId),
      },
      select: { id: true },
    });
    if (!conversation) {
      throw new AppError("Không tìm thấy cuộc trò chuyện", "NOT_FOUND", 404);
    }
    const cursor = before ? await prisma.message.findFirst({where:{id:before,conversationId,deletedAt:null},select:{id:true,createdAt:true}}) : null;
    if(before && !cursor) throw new AppError("Mốc tin nhắn không hợp lệ", "BAD_REQUEST",400);
    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        deletedAt: null,
        ...(cursor ? {OR:[{createdAt:{lt:cursor.createdAt}},{createdAt:cursor.createdAt,id:{lt:cursor.id}}]} : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 50,
      select: messageSelect,
    });
    return messages.reverse();
  }
  async createMessage(
    accountId: string,
    conversationId: string,
    content: string,
  ) {
    const result = await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findFirst({
        where: {
          id: conversationId,
          ...membership(accountId),
        },
        select: {
          id: true,
          candidate: { select: { accountId: true } },
          company: { select: { accountId: true } },
        },
      });
      if (!conversation) return null;
      const message = await tx.message.create({
        data: {
          conversationId: conversationId,
          senderAccountId: accountId,
          type: "text",
          content,
        },
        select: messageSelect,
      });
      await tx.conversation.updateMany({
        where: {
          id: conversationId,
          OR: [
            { lastMessageAt: null },
            { lastMessageAt: { lt: message.createdAt } },
          ],
        },
        data: {
          lastMessageAt: message.createdAt,
          lastMessageContent: message.content,
        },
      });
      return { conversation, message };
    });
    if (!result) {
      throw new AppError("Không tìm thấy cuộc trò chuyện", "NOT_FOUND", 404);
    }
    // Chỉ phát sự kiện sau khi transaction đã lưu thành công.
    publishMessage(
      [
        result.conversation.candidate.accountId,
        result.conversation.company.accountId,
      ],
      result.message,
    );
    return result.message;
  }
}
const conversationService = new ConversationService();
export default conversationService;
