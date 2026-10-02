import { prisma } from "../utils/prisma";
import { AppError } from "../exceptions";
import { cvDataSchema } from "../validators/cv.validate";
type Profile = {
  avatarKey: string | null;
  fullName: string;
  phone: string | null;
  headline: string | null;
  experienceYears: unknown;
  address: string | null;
  careerGoal: string | null;
};
type Cv = {
  deletedAt: Date | null;
  fileKey: string | null;
  contentJson: unknown;
};
const text = (value: string | null, max: number) =>
  !!value?.trim() && value.trim().length <= max;
export function calculateProfileCompletion(profile: Profile, cvs: Cv[]) {
  const items = [
    {
      code: "avatar",
      label: "Ảnh đại diện",
      points: 10,
      completed: text(profile.avatarKey, 500),
    },
    {
      code: "fullName",
      label: "Họ và tên",
      points: 10,
      completed: text(profile.fullName, 150),
    },
    {
      code: "phone",
      label: "Số điện thoại",
      points: 10,
      completed: /^\+?\d{9,15}$/.test(
        (profile.phone ?? "").replace(/[\s().-]/g, ""),
      ),
    },
    {
      code: "headline",
      label: "Tiêu đề nghề nghiệp",
      points: 10,
      completed: text(profile.headline, 255),
    },
    {
      code: "experienceYears",
      label: "Số năm kinh nghiệm",
      points: 10,
      completed:
        profile.experienceYears != null &&
        Number.isInteger(Number(profile.experienceYears)) &&
        Number(profile.experienceYears) >= 0 &&
        Number(profile.experienceYears) <= 80,
    },
    {
      code: "address",
      label: "Địa điểm hiện tại",
      points: 10,
      completed: text(profile.address, 300),
    },
    {
      code: "careerGoal",
      label: "Mục tiêu nghề nghiệp",
      points: 10,
      completed: text(profile.careerGoal, 2000),
    },
    {
      code: "cv",
      label: "CV hợp lệ",
      points: 30,
      completed: cvs.some(
        (cv) =>
          !cv.deletedAt &&
          (text(cv.fileKey, 500) ||
            cvDataSchema.safeParse(cv.contentJson).success),
      ),
    },
  ];
  return {
    percentage: items.reduce(
      (sum, item) => sum + (item.completed ? item.points : 0),
      0,
    ),
    items,
    missing: items.filter((item) => !item.completed),
  };
}
export class ProfileCompletionService {
  async get(accountId: string) {
    const candidate = await prisma.candidate.findFirst({
      where: {
        accountId,
        deletedAt: null,
        account: { role: "candidate", status: "active", deletedAt: null },
      },
      include: {
        cvs: {
          where: { deletedAt: null },
          select: { fileKey: true, contentJson: true, deletedAt: true },
        },
      },
    });
    if (!candidate)
      throw new AppError("Không tìm thấy hồ sơ ứng viên", "NOT_FOUND", 404);
    return calculateProfileCompletion(candidate, candidate.cvs);
  }
}
export default new ProfileCompletionService();
