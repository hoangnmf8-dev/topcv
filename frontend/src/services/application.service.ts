import { httpRequest } from "@/lib/utils";
export type ApplicationStatus = { id: string; status: string; appliedAt: string; cvId: string };
class ApplicationService {
  async status(jobPostId: string, signal?: AbortSignal): Promise<ApplicationStatus | null> { return (await httpRequest.get(`/application/job/${jobPostId}`, { signal })).data.data; }
  async create(input: { jobPostId: string; cvId: string; coverLetter: string }): Promise<ApplicationStatus> { return (await httpRequest.post("/application", input)).data.data; }
}
export default new ApplicationService();
