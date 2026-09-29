import express from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import uploadService from "../services/upload.service";
import type { Prisma } from "../generated/prisma/client";
const router=express.Router();
router.get("/",async(req,res)=>{
 const parsed=z.object({page:z.coerce.number().int().min(1).default(1),query:z.string().trim().max(200).default("")}).safeParse(req.query);
 if(!parsed.success){res.status(400).json({message:"Tìm kiếm không hợp lệ"});return;}
 const {page,query}=parsed.data, limit=12;
 const open:Prisma.JobPostWhereInput={deletedAt:null,status:"PUBLISHED",OR:[{deadlineAt:null},{deadlineAt:{gte:new Date()}}]};
 const where:Prisma.CompanyWhereInput={deletedAt:null,...(query?{OR:[{name:{contains:query,mode:"insensitive"}},{description:{contains:query,mode:"insensitive"}},{jobPosts:{some:{...open,category:{name:{contains:query,mode:"insensitive"}}}}}]}:{})};
 const [total,rows]=await prisma.$transaction([
 prisma.company.count({where}),
 prisma.company.findMany({where,select:{id:true,code:true,name:true,description:true,logoKey:true,address:true,_count:{select:{jobPosts:{where:open}}}},orderBy:[{name:"asc"},{id:"asc"}],skip:(page-1)*limit,take:limit})
 ]);
 const items=await Promise.all(rows.map(async({logoKey,...row})=>({...row,logoUrl:logoKey?await uploadService.createImageUrl(logoKey):null})));
 res.json({items,total,page,totalPages:Math.ceil(total/limit)});
});
export default router;
