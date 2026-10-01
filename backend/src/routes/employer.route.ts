import { Router } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { authMiddleware } from "../middlewares/auth.middleware";
import uploadService from "../services/upload.service";
import type { Prisma } from "../generated/prisma/client";

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
router.get("/job-posts", async (req, res) => {
 const parsed=paging.extend({status:z.enum(["DRAFT","PENDING","PUBLISHED","PAUSED","REJECTED","CLOSED","EXPIRED"]).optional()}).safeParse(req.query);
 if(!parsed.success){res.status(400).json({message:"Bộ lọc không hợp lệ"});return;}
 const q=parsed.data;
 const where={companyId:res.locals.companyId as string,deletedAt:null,title:{contains:q.query,mode:"insensitive" as const},...(q.status?{status:q.status}:{})};
 const [total,items]=await prisma.$transaction([prisma.jobPost.count({where}),prisma.jobPost.findMany({where,orderBy:[{createdAt:"desc"},{id:"desc"}],skip:(q.page-1)*10,take:10,select:{id:true,title:true,status:true,deadlineAt:true,category:{select:{name:true}},province:{select:{name:true}},_count:{select:{applications:{where:{deletedAt:null}}}}}})]);
 res.json({data:{total,items,page:q.page,pages:Math.ceil(total/10)}});
});
router.get("/jobs", async (_req, res) => {
  const data = await prisma.jobPost.findMany({ where: { companyId: res.locals.companyId, deletedAt: null }, select: { id: true, title: true }, orderBy: { createdAt: "desc" } });
  res.json({ data });
});
router.get("/summary", async (req, res) => {
  const parsed = z.object({ days: z.coerce.number().int().min(1).max(365).default(30) }).safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ message: "Khoảng thời gian không hợp lệ" }); return; }
  const companyId = res.locals.companyId as string;
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
  res.json({ data: { days: parsed.data.days, jobs, activeJobs, total: groups.reduce((n, g) => n + g._count._all, 0), statuses: groups.map(g => ({ status: g.status, count: g._count._all })), recent,
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
  const result = await prisma.application.updateMany({ where: { id: id.data, deletedAt: null, jobPost: { companyId: res.locals.companyId, deletedAt: null } }, data: input.data });
  if (!result.count) { res.status(404).json({ message: "Không tìm thấy hồ sơ ứng tuyển" }); return; }
  res.json({ success: true });
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
  const where: Prisma.CandidateWhereInput = { isSearchable: true, deletedAt: null, account: { status: "active", deletedAt: null }, OR: [{ fullName: { contains: q.query, mode: "insensitive" } }, { headline: { contains: q.query, mode: "insensitive" } }], ...(q.experience !== undefined ? { experienceYears: { gte: q.experience } } : {}), ...(q.location ? { currentLocation: { name: { contains: q.location, mode: "insensitive" } } } : {}) };
  const [total, items] = await prisma.$transaction([prisma.candidate.count({ where }), prisma.candidate.findMany({ where, select: profileSelect, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (q.page - 1) * 10, take: 10 })]);
  res.json({ data: { total, items, page: q.page, pages: Math.ceil(total / 10) } });
});
export default router;
