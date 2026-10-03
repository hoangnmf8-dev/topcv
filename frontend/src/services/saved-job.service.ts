import { httpRequest } from "@/lib/utils";
type Result = { jobPostId: string; saved: boolean };
class SavedJobService {
  async list(signal?: AbortSignal): Promise<string[]> {
    return (await httpRequest.get("/saved-job", { signal })).data.data;
  }
  async save(id: string): Promise<Result> {
    return (await httpRequest.put(`/saved-job/${id}`)).data.data;
  }
  async remove(id: string): Promise<Result> {
    return (await httpRequest.delete(`/saved-job/${id}`)).data.data;
  }
}
export default new SavedJobService();
