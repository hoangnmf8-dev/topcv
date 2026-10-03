import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/prisma";
import { membership } from "../utils/realtime";
import { messageSelect } from "../types/conversation.type";
import conversationService from "../services/conversation.service";
import { successResponse } from "../utils/response";

import { AppError } from "../exceptions";
class ConversationController {
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.profile.id;
      const paging = z
        .object({
          page: z.coerce.number().int().min(1).max(10000).default(1),
          search: z.string().trim().max(150).default(""),
        })
        .safeParse(req.query);
      if (!paging.success)
        throw new AppError("Bộ lọc không hợp lệ", "INVALID_INPUT", 400);
      const conversation = await conversationService.getConversation(
        id,
        paging.data.page,
        paging.data.search,
      );
      return successResponse(
        res,
        conversation,
        "Lấy cuộc hội thoại thành công",
      );
    } catch (error) {
      next(error);
    }
  }
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = req.profile;
      const role = profile.role;
      const id = z.string().uuid().safeParse(req.body?.id);
      if (!id.success)
        throw new AppError("ID không hợp lệ", "BAD_REQUEST", 400);
      let candidateId, companyId;
      if (role !== "candidate" && role !== "company") {
        throw new AppError(
          "Không có quyền sử dụng tính năng này",
          "FORBIDEN",
          403,
        );
      }
      if (role === "candidate") {
        const candidate = await prisma.candidate.findUnique({
          where: {
            accountId: profile.id,
          },
        });
        candidateId = candidate?.id;
        companyId = id.data;
      } else {
        const company = await prisma.company.findUnique({
          where: {
            accountId: profile.id,
          },
        });
        candidateId = id.data;
        companyId = company?.id;
      }
      if (!candidateId || !companyId)
        throw new AppError("Không tìm thấy hồ sơ", "NOT_FOUND", 404);
      const [candidate, company] = await Promise.all([
        prisma.candidate.findFirst({
          where: {
            id: candidateId,
            deletedAt: null,
            account: { status: "active", deletedAt: null },
          },
        }),
        prisma.company.findFirst({
          where: {
            id: companyId,
            deletedAt: null,
            account: { status: "active", deletedAt: null },
          },
        }),
      ]);
      if (!candidate || !company)
        throw new AppError("Không tìm thấy người nhận", "NOT_FOUND", 404);
      const response = await conversationService.createConversation({
        candidateId,
        companyId,
      });
      return successResponse(
        res,
        response,
        "Tạo thành công cuộc hội thoại",
        201,
      );
    } catch (error) {
      next(error);
    }
  }
  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const profileId = req.profile.id;
      const parsedId = z.string().uuid().safeParse(req.params.id);
      if (!parsedId.success)
        throw new AppError("ID không hợp lệ", "BAD_REQUEST", 400);
      const conversationId = parsedId.data;
      const before = z.string().uuid().optional().safeParse(req.query.before);
      if (!before.success)
        throw new AppError("Mốc tin nhắn không hợp lệ", "BAD_REQUEST", 400);
      const messages = await conversationService.getMessages(
        profileId,
        conversationId,
        before.data,
      );
      return successResponse(res, messages, "Lấy tin nhắn thành công");
    } catch (error) {
      next(error);
    }
  }
  async createMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const input = z
        .object({ content: z.string().trim().min(1).max(5000) })
        .safeParse(req.body);
      if (!input.success)
        throw new AppError(
          "Tin nhắn phải có từ 1 đến 5000 ký tự",
          "BAD_REQUEST",
          400,
        );
      const { content } = input.data;
      const parsedId = z.string().uuid().safeParse(req.params.id);
      if (!parsedId.success)
        throw new AppError("ID không hợp lệ", "BAD_REQUEST", 400);
      const conversationId = parsedId.data;
      const accountId = req.profile.id;
      const response = await conversationService.createMessage(
        accountId,
        conversationId,
        content,
      );
      return successResponse(res, response, "Tạo tin nhắn mới thành công", 201);
    } catch (error) {
      next(error);
    }
  }
}
const conversationController = new ConversationController();
export default conversationController;
