import { httpRequest } from "@/lib/utils";
import uploadService from "./upload.service";
import type { CvDetail, CvSummary, CvSaveInput } from "@/types/cv.type";
class CvService {
  async remove(id: string): Promise<void> {
    await httpRequest.delete(`/cv/${id}`);
  }
  async list(signal?: AbortSignal): Promise<CvSummary[]> {
    return (await httpRequest.get("/cv", { signal })).data.data;
  }
  async detail(id: string, signal?: AbortSignal): Promise<CvDetail> {
    return (await httpRequest.get(`/cv/${id}`, { signal })).data.data;
  }
  async create(id: string, input: CvSaveInput): Promise<CvSummary> {
    return (await httpRequest.post("/cv", { ...input, id })).data.data;
  }
  async update(id: string, input: CvSaveInput): Promise<CvSummary> {
    return (await httpRequest.put(`/cv/${id}`, input)).data.data;
  }
  async uploadImage(file: File): Promise<string> {
    const response = await uploadService.getPresignedUrl(file, "cvImage");
    const { uploadUrl, objectKey } = response.data;
    await uploadService.uploadFile(uploadUrl, file);
    return objectKey;
  }
}
export default new CvService();
