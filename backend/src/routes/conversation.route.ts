import { chatState } from "../services/chat-state.service";
import { membership } from "../utils/realtime";
import { isOnline } from "../realtime";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import { publishMessage } from "../realtime";
import conversationController from "../controllers/conversation.controller";

const conversationRouter = Router();
conversationRouter.use(authMiddleware);
conversationRouter.use((req, res, next) => {
  const account = req.profile;
  if (
    !account ||
    account.deletedAt ||
    account.status !== "active" ||
    !["candidate", "company"].includes(account.role)
  ) {
    res.status(403).json({
      success: false,
      message: "Không có quyền truy cập tin nhắn",
    });
    return;
  }
  next();
});
conversationRouter.get("/state", async(req,res)=>{
 const id=req.profile.id;
 const [state,conversations,pending]=await Promise.all([
 chatState(id),
 prisma.conversation.findMany({where:membership(id),select:{candidate:{select:{accountId:true}},company:{select:{accountId:true}}}}),
 prisma.message.findMany({where:{conversation:membership(id),senderAccountId:{not:id},deletedAt:null,deliveredAt:null},select:{id:true},take:100})]);
 const peers=[...new Set(conversations.flatMap(c=>[c.candidate.accountId,c.company.accountId]).filter(p=>p!==id))];
 const activity = await prisma.account.findMany({where:{id:{in:peers}},select:{id:true,lastActiveAt:true}});
 res.json({success:true,data:{...state,online:Object.fromEntries(peers.map(p=>[p,isOnline(p)])),lastActive:Object.fromEntries(activity.map(p=>[p.id,p.lastActiveAt])),pending:pending.map(m=>m.id)}});
});
conversationRouter.get("/", conversationController.getConversation);
conversationRouter.post("/", conversationController.createConversation);
conversationRouter.get("/:id/messages", conversationController.getMessages);
conversationRouter.post("/:id/messages", conversationController.createMessage);
export default conversationRouter;
