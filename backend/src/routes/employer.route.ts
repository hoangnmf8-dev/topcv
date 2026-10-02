import { Router } from "express";
import { viewPublicCv, publicCvUsage } from "../services/public-cv.service";
import { currentPlan } from "../services/subscription.service";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import uploadService from "../services/upload.service";
import { Prisma } from "../generated/prisma/client";
import { AppError } from "../exceptions";
import { boostJob,jobBoostUsage } from "../services/job-boost.service";

const router = Router();
const statuses = z.enum(["submitted", "reviewing", "interview", "hired", "rejected"]);
const paging = z.object({ page: z.coerce.number().int().min(1).default(1), query: z.string().trim().max(200).default("") });
const profileSelect = { id: true, fullName: true, headline: true, careerGoal: true, experienceYears: true, currentLocation: { select: { name: true } } } as const;
router.use(authMiddleware);
router.use(async (req, res, next) => {
  if (req.profile?.role !== "company" || req.profile.deletedAt || req.profile.status !== "active") { res.status(403).json({ message: "Chỉ tài khoản doanh nghiệp được truy cập" }); return; }
  const company = await prisma.company.findFirst({ where: { accountId: req.profile.id, deletedAt: null }, select: { id: true } });
  if (!company) { res.status(404).json({ message: "Chưa có hồ sơ doanh nghiệp" }); return; }
  res.locals.companyId = company.id;
  next();
});
router.get("/job-boost-usage",async(req,res)=>{res.json({data:await jobBoostUsage(req.profile.id)});});
router.post("/job-posts/:id/boost",async(req,res)=>{res.json({data:await boostJob(req.profile.id,z.uuid().parse(req.params.id))});});
router.get("/job-posts", async (req, res) => {
 const parsed=paging.extend({status:z.enum(["PENDING","PUBLISHED","PAUSED","REJECTED","CLOSED","EXPIRED"]).optional()}).safeParse(req.query);
 if(!parsed.success){res.status(400).json({message:"Bộ lọc không hợp lệ"});return;}
 const q=parsed.data;
 const where={companyId:res.locals.companyId as string,deletedAt:null,title:{contains:q.query,mode:"insensitive" as const},...(q.status?{status:q.status}:{})};
 const [total,items]=await prisma.$transaction([prisma.jobPost.count({where}),prisma.jobPost.findMany({where,orderBy:[{createdAt:"desc"},{id:"desc"}],skip:(q.page-1)*10,take:10,select:{id:true,title:true,status:true,deadlineAt:true,boostedUntil:true,category:{select:{name:true}},province:{select:{name:true}},_count:{select:{applications:{where:{deletedAt:null}}}}}})]);
 res.json({data:{total,items,page:q.page,pages:Math.ceil(total/10)}});
});
router.patch("/job-posts/:id/status",async(req,res)=>{
 const id=z.uuid().parse(req.params.id),input=z.object({status:z.enum(["PAUSED","PUBLISHED","CLOSED"])}).strict().parse(req.body);
 const companyId=res.locals.companyId as string;
 const job=await prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM company WHERE id=${companyId}::uuid FOR UPDATE`;
  await tx.$queryRaw`SELECT id FROM job_post WHERE id=${id}::uuid AND company_id=${companyId}::uuid FOR UPDATE`;
  const before=await tx.jobPost.findFirst({where:{id,companyId,deletedAt:null}});
  if(!before)throw new AppError("Không tìm thấy tin tuyển dụng","NOT_FOUND",404);
  const allowed=before.status==="PUBLISHED"?["PAUSED","CLOSED"]:before.status==="PAUSED"?["PUBLISHED","CLOSED"]:before.status==="PENDING"?["CLOSED"]:[];
  if(!allowed.includes(input.status))throw new AppError("Không thể chuyển trạng thái tin này","INVALID_STATUS",409);
  if(input.status==="PUBLISHED"){
   if(before.deadlineAt&&before.deadlineAt<=new Date())throw new AppError("Tin đã hết hạn, không thể khôi phục","JOB_EXPIRED",409);
   const plan=await currentPlan(req.profile.id,tx);
   const count=await tx.jobPost.count({where:{companyId,deletedAt:null,status:{in:["PENDING","PUBLISHED"]},OR:[{deadlineAt:null},{deadlineAt:{gt:new Date()}}]}});
   if(count>=plan.benefits.activeJobLimit)throw new AppError(`Gói hiện tại cho phép ${plan.benefits.activeJobLimit} tin hoạt động hoặc chờ duyệt`,"JOB_LIMIT_REACHED",403);
  }
  const updated=await tx.jobPost.update({where:{id},data:{status:input.status}});
  await tx.auditLog.create({data:{actorType:"ACCOUNT",actorAccountId:req.profile.id,action:"job.status",entityType:"job_post",entityId:id,beforeData:{status:before.status},afterData:{status:input.status}}});
  return {id:updated.id,status:updated.status};
 });res.json({data:job});
});
router.get("/jobs", async (_req, res) => {
  const data = await prisma.jobPost.findMany({ where: { companyId: res.locals.companyId, deletedAt: null }, select: { id: true, title: true }, orderBy: { createdAt: "desc" } });
  res.json({ data });
});
router.get("/summary", async (req, res) => {
  const parsed = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) }).safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ message: "Khoảng thời gian không hợp lệ" }); return; }
  const companyId = res.locals.companyId as string;
  const plan = await currentPlan(req.profile.id);
  const occupiedSlots = await prisma.jobPost.count({ where: { companyId, deletedAt: null, status: { in: ["PUBLISHED", "PENDING"] }, OR: [{ deadlineAt: null }, { deadlineAt: { gt: new Date() } }] } });
  const since = new Date(Date.now() - parsed.data.days * 86400000);
  const where: Prisma.ApplicationWhereInput = { deletedAt: null, appliedAt: { gte: since }, jobPost: { companyId, deletedAt: null } };
  const [jobs, activeJobs, groups, recent, jobGroups, titles] = await Promise.all([
    prisma.jobPost.count({ where: { companyId, deletedAt: null } }),
    prisma.jobPost.count({ where: { companyId, deletedAt: null, status: "PUBLISHED", OR: [{ deadlineAt: null }, { deadlineAt: { gte: new Date() } }] } }),
    prisma.application.groupBy({ by: ["status"], where, _count: { _all: true } }),
    prisma.application.findMany({ where, orderBy: [{ appliedAt: "desc" }, { id: "desc" }], take: 5, select: { id: true, appliedAt: true, status: true, candidate: { select: { fullName: true } }, jobPost: { select: { title: true } } } }),
    prisma.application.groupBy({ by: ["jobPostId", "status"], where, _count: { _all: true } }),
    prisma.jobPost.findMany({ where: { companyId, deletedAt: null }, select: { id: true, title: true } }),
  ]);
  res.json({ data: { days: parsed.data.days, planName: plan.name, activeJobLimit: plan.benefits.activeJobLimit, occupiedSlots, jobs, activeJobs, total: groups.reduce((n, g) => n + g._count._all, 0), statuses: groups.map(g => ({ status: g.status, count: g._count._all })), recent,
    reports: titles.map(j => ({ ...j, counts: Object.fromEntries(jobGroups.filter(g => g.jobPostId === j.id).map(g => [g.status, g._count._all])) })) } });
});
router.get("/applications", async (req, res) => {
  const parsed = paging.extend({ status: statuses.optional(), jobPostId: z.string().uuid().optional() }).safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ message: "Bộ lọc không hợp lệ" }); return; }
  const q = parsed.data;
  const where: Prisma.ApplicationWhereInput = { deletedAt: null, jobPost: { companyId: res.locals.companyId, deletedAt: null }, candidate: { deletedAt: null, fullName: { contains: q.query, mode: "insensitive" } }, ...(q.status ? { status: q.status } : {}), ...(q.jobPostId ? { jobPostId: q.jobPostId } : {}) };
  const [total, items] = await prisma.$transaction([
    prisma.application.count({ where }),
    prisma.application.findMany({ where, skip: (q.page - 1) * 10, take: 10, orderBy: [{ appliedAt: "desc" }, { id: "desc" }], select: { id: true, status: true, fitScore: true, internalNote: true, coverLetter: true, appliedAt: true, candidate: { select: profileSelect }, jobPost: { select: { id: true, title: true } }, cv: { where: { deletedAt: null }, select: { id: true, title: true, deletedAt: true } } } }),
  ]);
  res.json({ data: { total, items, page: q.page, pages: Math.ceil(total / 10) } });
});
router.patch("/applications/:id", async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  const input = z.object({ status: statuses, fitScore: z.number().min(0).max(100).nullable(), internalNote: z.string().max(10000) }).strict().safeParse(req.body);
  if (!id.success || !input.success) { res.status(400).json({ message: "Dữ liệu cập nhật không hợp lệ" }); return; }
  const result = await prisma.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM applications WHERE id = ${id.data}::uuid FOR UPDATE`;
    const previous = await tx.application.findFirst({ where: { id: id.data, deletedAt: null, jobPost: { companyId: res.locals.companyId, deletedAt: null } }, include: { candidate: true, jobPost: true } });
    if (!previous) return { count: 0 };
    const updated = await tx.application.update({ where: { id: previous.id }, data: input.data });
    if (previous.status !== updated.status) {
      const { notify } = await import("../services/notification.service");
      const names = { submitted: "Đã gửi", reviewing: "Đang xem xét", interview: "Mời phỏng vấn", hired: "Đã tuyển", rejected: "Không phù hợp" };
      await notify(tx, { recipientAccountId: previous.candidate.accountId, type: updated.status === "interview" ? "interview" : "application", title: "Hồ sơ ứng tuyển được cập nhật", description: `${previous.jobPost.title}: ${names[updated.status]}.`, link: "/candidate?tab=applications", eventKey: `application:${previous.id}:${updated.updatedAt?.getTime()}:${updated.status}` });
    }
    return { count: 1 };
  });
  if (!result.count) { res.status(404).json({ message: "Không tìm thấy hồ sơ ứng tuyển" }); return; }
  res.json({ success: true });
});
router.get("/talent/usage", async (req, res) => {
  res.json({ data: await publicCvUsage(req.profile.id) });
});
router.post("/talent/:id/cv", async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) { res.status(400).json({ message: "ID không hợp lệ" }); return; }
  res.setHeader("Cache-Control", "no-store");
  res.json({ data: await viewPublicCv(req.profile.id, id.data) });
});
router.get("/applications/:id/cv", async (req, res) => {
  const id = z.string().uuid().safeParse(req.params.id);
  if (!id.success) { res.status(400).json({ message: "ID không hợp lệ" }); return; }
  const application = await prisma.application.findFirst({ where: { id: id.data, deletedAt: null, jobPost: { companyId: res.locals.companyId, deletedAt: null } }, select: { candidateId: true, cv: { where: { deletedAt: null }, select: { candidateId: true, title: true, contentJson: true, fileKey: true, deletedAt: true } } } });
  const cv = application?.cv;
  if (!cv || cv.deletedAt || cv.candidateId !== application?.candidateId) { res.status(404).json({ message: "Không có CV khả dụng" }); return; }
  const url = cv.fileKey ? await uploadService.createDownloadUrl(cv.fileKey, req.profile.id) : null;
  res.json({ data: { title: cv.title, content: cv.contentJson, url } });
});
router.get("/talent", async (req, res) => {
  const parsed = paging.extend({ experience: z.coerce.number().min(0).max(99).optional(), location: z.string().trim().max(200).default("") }).safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ message: "Bộ lọc không hợp lệ" }); return; }
  const q = parsed.data;
  const where: Prisma.CandidateWhereInput = { isSearchable: true, deletedAt: null, account: { role: "candidate", status: "active", deletedAt: null }, cvs: { some: { isDefault: true, deletedAt: null, OR: [{ fileKey: { not: null }, NOT: { fileKey: "" } }, { contentJson: { not: Prisma.AnyNull } }] } }, OR: [{ fullName: { contains: q.query, mode: "insensitive" } }, { headline: { contains: q.query, mode: "insensitive" } }], ...(q.experience !== undefined ? { experienceYears: { gte: q.experience } } : {}), ...(q.location ? { currentLocation: { name: { contains: q.location, mode: "insensitive" } } } : {}) };
  const [total, items] = await prisma.$transaction([prisma.candidate.count({ where }), prisma.candidate.findMany({ where, select: profileSelect, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (q.page - 1) * 10, take: 10 })]);
  res.json({ data: { total, items, page: q.page, pages: Math.ceil(total / 10) } });
});
export default router;
