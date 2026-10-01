import type {z} from "zod";
import type {cvSaveSchema} from "@/validators/cv.validate";
export type CvSaveInput=z.infer<typeof cvSaveSchema>;
export type CvSummary={id:string;title:string;templateCode:string|null;isDefault:boolean;updatedAt:string;fileKey:string|null;isEditable:boolean};
export type CvDetail=CvSummary & {contentJson:CvSaveInput["contentJson"]|null;avatarUrl:string};
