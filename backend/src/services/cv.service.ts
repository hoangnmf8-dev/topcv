import { prisma } from "../utils/prisma";
import { AppError } from "../exceptions";
import uploadService from "./upload.service";
import type { CvSaveInput, CvCreateInput } from "../types/cv.type";
import { cvSaveSchema } from "../validators/cv.validate";

export class CvService {
  constructor(private db = prisma) {}
  private async candidate(accountId:string) {
    const candidate=await this.db.candidate.findFirst({where:{accountId,deletedAt:null,account:{status:"active",deletedAt:null}},select:{id:true}});
    if(!candidate) throw new AppError("Không tìm thấy ứng viên", "NOT_FOUND",404);
    return candidate;
  }
  async list(accountId:string) {
    const candidate=await this.candidate(accountId);
    const rows = await this.db.cv.findMany({where:{candidateId:candidate.id,deletedAt:null},orderBy:{updatedAt:"desc"},select:{id:true,title:true,templateCode:true,isDefault:true,updatedAt:true,fileKey:true,contentJson:true}});
    return rows.map(({contentJson, ...cv}) => ({...cv, isEditable: cvSaveSchema.safeParse({title:cv.title,templateCode:cv.templateCode,contentJson}).success}));
  }
  async detail(accountId:string,id:string) {
    const candidate=await this.candidate(accountId);
    const cv=await this.db.cv.findFirst({where:{id,candidateId:candidate.id,deletedAt:null}});
    if(!cv) throw new AppError("Không tìm thấy CV", "NOT_FOUND",404);
    const content=cv.contentJson as {personal?:{avatarKey?:string}} | null;
    const avatarKey=content?.personal?.avatarKey;
    return {...cv,avatarUrl:avatarKey ? await uploadService.cvImageUrl(avatarKey) : ""};
  }
  async save(accountId:string,input:CvSaveInput,id:string,create=false) {
    const candidate=await this.candidate(accountId);
    const key=input.contentJson.personal.avatarKey;
    if(key) await uploadService.validateCvImage(accountId,key);
    return this.db.$transaction(async tx=>{
      // Serialize default-CV changes for this candidate, including simultaneous saves.
      await tx.$queryRaw`SELECT id FROM candidate WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      const existing=await tx.cv.findUnique({where:{id}});
      if(existing && (existing.candidateId!==candidate.id || existing.deletedAt)) throw new AppError("Không tìm thấy CV", "NOT_FOUND",404);
      if(!create && !existing) throw new AppError("Không tìm thấy CV", "NOT_FOUND",404);
      // A retried POST with the same client-generated id must not create another CV.
      // Reuse the same row on retries; saving changed input must not discard edits.
      if(existing?.fileKey && !cvSaveSchema.safeParse({title:existing.title,templateCode:existing.templateCode,contentJson:existing.contentJson}).success) throw new AppError("CV PDF không thể sửa bằng trình tạo CV", "INVALID_CV",400);
      if(input.isDefault) await tx.cv.updateMany({where:{candidateId:candidate.id,isDefault:true,deletedAt:null},data:{isDefault:false}});
      const data={title:input.title,templateCode:input.templateCode,contentJson:input.contentJson,...(input.isDefault!==undefined?{isDefault:input.isDefault}:{})};
      // A previously exported PDF no longer represents the edited content.
      return existing ? tx.cv.update({where:{id},data:{...data,fileKey:null}}) : tx.cv.create({data:{...data,id,candidateId:candidate.id}});
    });
  }
  create(accountId:string,input:CvCreateInput) { return this.save(accountId,input,input.id,true); }
  async remove(accountId: string, id: string) {
    const candidate = await this.candidate(accountId);
    return this.db.$transaction(async tx => {
      // Use the same lock as save so deleting and saving cannot race.
      await tx.$queryRaw`SELECT id FROM candidate WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      const result = await tx.cv.updateMany({
        where: {id, candidateId:candidate.id, deletedAt:null},
        data: {deletedAt:new Date(), isDefault:false},
      });
      if (!result.count) throw new AppError("Không tìm thấy CV", "NOT_FOUND", 404);
      return {id};
    });
  }
}
export default new CvService();
