import express from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import type { Prisma } from "../generated/prisma/client";

const router = express.Router();
const paging = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(8),
  query: z.string().trim().max(200).default(""),
  status: z
    .enum(["submitted", "reviewing", "interview", "hired", "rejected"])
    .optional(),
});
const jobSelect = {
  id: true,
  title: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  status: true,
  deadlineAt: true,
  deletedAt: true,
  company: { select: { name: true, deletedAt: true } },
  province: { select: { name: true } },
} satisfies Prisma.JobPostSelect;
router.use(async (req, res, next) => {
  if (req.profile?.role !== "candidate") {
    res.status(403).json({ message: "Chỉ ứng viên được xem dữ liệu này" });
    return;
  }
  const candidate = await prisma.candidate.findFirst({
    where: { accountId: req.profile.id, deletedAt: null },
  });
  if (!candidate) {
    res.status(404).json({ message: "Không tìm thấy hồ sơ ứng viên" });
    return;
  }
  res.locals.candidate = candidate;
  next();
});
router.get("/overview", async (req, res) => {
  const candidate = res.locals.candidate;
  const publicWhere: Prisma.JobPostWhereInput = {
    deletedAt: null,
    status: "PUBLISHED",
    company: { deletedAt: null },
    OR: [{ deadlineAt: null }, { deadlineAt: { gte: new Date() } }],
  };
  if (candidate.currentLocationId)
    publicWhere.provinceId = candidate.currentLocationId;
  const [saved, applications, cvs, jobCount, jobs] = await Promise.all([
    prisma.savedJob.count({ where: { candidateId: candidate.id } }),
    prisma.application.count({
      where: {
        candidateId: candidate.id,
        deletedAt: null,
        appliedAt: { gte: new Date(Date.now() - 30 * 86400000) },
      },
    }),
    prisma.cv.count({ where: { candidateId: candidate.id, deletedAt: null } }),
    prisma.jobPost.count({ where: publicWhere }),
    prisma.jobPost.findMany({
      where: publicWhere,
      select: jobSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
    }),
  ]);
  res.json({
    saved,
    applications,
    cvs,
    jobCount,
    profileCompletion: candidate.profileCompletion ?? 0,
    localRecommendations: !!candidate.currentLocationId,
    jobs,
  });
});
router.get("/:kind", async (req, res) => {
  const kind = req.params.kind;
  if (kind !== "applications" && kind !== "saved") {
    res.status(404).json({ message: "Không tìm thấy" });
    return;
  }
  const parsed = paging.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: "Bộ lọc không hợp lệ" });
    return;
  }
  const { page, limit, query, status } = parsed.data;
  const jobPost: Prisma.JobPostWhereInput = query
    ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { company: { name: { contains: query, mode: "insensitive" } } },
          { province: { name: { contains: query, mode: "insensitive" } } },
        ],
      }
    : {};
  const candidateId = res.locals.candidate.id;
  if (kind === "applications") {
    const where: Prisma.ApplicationWhereInput = {
      candidateId,
      deletedAt: null,
      jobPost,
      ...(status ? { status } : {}),
    };
    const [total, items] = await prisma.$transaction([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        select: {
          id: true,
          jobPostId: true,
          status: true,
          appliedAt: true,
          updatedAt: true,
          coverLetter: true,
          cv: { where: { deletedAt: null }, select: { title: true } },
          jobPost: { select: jobSelect },
        },
        orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } else {
    const where: Prisma.SavedJobWhereInput = { candidateId, jobPost };
    const [total, items] = await prisma.$transaction([
      prisma.savedJob.count({ where }),
      prisma.savedJob.findMany({
        where,
        select: {
          jobPostId: true,
          createdAt: true,
          jobPost: { select: jobSelect },
        },
        orderBy: [{ createdAt: "desc" }, { jobPostId: "desc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    res.json({ items, total, page, totalPages: Math.ceil(total / limit) });
  }
});
export default router;
