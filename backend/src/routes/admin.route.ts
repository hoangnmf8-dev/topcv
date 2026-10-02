import { Router, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../utils/prisma";
import { Prisma } from "../generated/prisma/client";
import { authMiddleware } from "../middlewares/auth.middleware";
import { AppError } from "../exceptions";
import { currentPlan } from "../services/subscription.service";
import { randomUUID } from "node:crypto";
import { publishNotification } from "../realtime";
import { reconcilePayment, serializePayment } from "../services/billing.service";

const router = Router();
router.use(authMiddleware);
router.use((req, _res, next) => {
  if (req.profile.role !== "admin" || req.profile.status !== "active" || req.profile.deletedAt) throw new AppError("Không có quyền quản trị", "FORBIDDEN", 403);
  next();
});
const filters = z.object({ page: z.coerce.number().int().min(1).default(1), query: z.string().trim().max(200).default(""), status: z.string().max(40).default(""), parentId: z.string().uuid().optional() });
const uuid = z.string().uuid();
function audit(tx: Prisma.TransactionClient, actorAccountId: string, action: string, entityType: string, entityId: string | null, beforeData: Prisma.InputJsonValue, afterData: Prisma.InputJsonValue) {
  return tx.auditLog.create({ data: { actorType: "ACCOUNT", actorAccountId, action, entityType, entityId, beforeData, afterData } });
}
router.get("/overview", async (_req, res) => {
  const [accounts, companies, jobs, pendingJobs, pendingCompanies, pendingOrders, revenue, recent] = await Promise.all([
    prisma.account.count({ where: { deletedAt: null, status: "active" } }),
    prisma.company.count({ where: { deletedAt: null } }),
    prisma.jobPost.count({ where: { deletedAt: null } }),
    prisma.jobPost.count({ where: { deletedAt: null, status: "PENDING" } }),
    prisma.company.count({ where: { deletedAt: null, verificationStatus: "pending" } }),
    prisma.order.count({ where: { deletedAt: null, status: "pending" } }),
    prisma.payment.aggregate({ where: { status: "succeeded", order: { deletedAt: null } }, _sum: { amount: true }, _count: true }),
    prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { action: true, entityType: true, createdAt: true, actor: { select: { email: true } } } }),
  ]);
  res.json({ data: { accounts, companies, jobs, pendingJobs, pendingCompanies, pendingOrders, revenue: revenue._sum.amount ?? 0, successfulPayments: revenue._count, recent } });
});
router.get("/revenue", async (req, res) => {
  const days = z.coerce.number().pipe(z.union([z.literal(7), z.literal(30), z.literal(90)])).default(30).parse(req.query.days);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const mode = z.enum(["daily", "monthly"]).default("daily").parse(req.query.mode);
  const year = z.coerce.number().int().min(2000).max(2100).default(Number(today.slice(0,4))).parse(req.query.year);
  const end = mode === "monthly" ? new Date(`${year+1}-01-01T00:00:00+07:00`) : new Date(new Date(`${today}T00:00:00+07:00`).getTime()+86400000);
  const start = mode === "monthly" ? new Date(`${year}-01-01T00:00:00+07:00`) : new Date(end.getTime() - days * 86400000);
  const format = mode === "monthly" ? "YYYY-MM" : "YYYY-MM-DD";
  const rows = await prisma.$queryRaw<{day:string;amount:string;count:number;candidate:string;company:string}[]>`
    SELECT to_char(COALESCE(p.paid_at,p.created_at) AT TIME ZONE 'Asia/Ho_Chi_Minh',${format}) AS day,
      SUM(p.amount)::text AS amount, COUNT(*)::integer AS count,
      SUM(CASE WHEN s.audience='candidate' THEN p.amount ELSE 0 END)::text AS candidate,
      SUM(CASE WHEN s.audience='company' THEN p.amount ELSE 0 END)::text AS company
    FROM payments p JOIN orders o ON o.id=p.order_id JOIN service_plans s ON s.id=o.plan_id
    WHERE p.status='succeeded' AND o.deleted_at IS NULL
      AND COALESCE(p.paid_at,p.created_at)>=${start} AND COALESCE(p.paid_at,p.created_at)<${end}
    GROUP BY day ORDER BY day`;
  const points = Array.from({length:mode === "monthly" ? 12 : days}, (_, i) => {
    const day = mode === "monthly" ? `${year}-${String(i+1).padStart(2,"0")}` : new Date(start.getTime() + i*86400000 + 7*3600000).toISOString().slice(0,10);
    const row = rows.find(r => r.day===day);
    return {day,amount:Number(row?.amount??0),count:row?.count??0,candidate:Number(row?.candidate??0),company:Number(row?.company??0)};
  });
  res.json({data:{points,total:points.reduce((s,p)=>s+p.amount,0),count:points.reduce((s,p)=>s+p.count,0),candidate:points.reduce((s,p)=>s+p.candidate,0),company:points.reduce((s,p)=>s+p.company,0)}});
});
router.get("/:resource", async (req, res) => {
  const q = filters.parse(req.query), skip = (q.page - 1) * 20, take = 20;
  const text = { contains: q.query, mode: "insensitive" as const };
  let total: number, items: unknown[];
  switch (req.params.resource) {
    case "orders": {
      const status=q.status?z.enum(["pending","processing","paid","failed","cancelled","refunded","expired"]).parse(q.status):undefined;
      const where:Prisma.OrderWhereInput={deletedAt:null,OR:[{code:text},{purchaser:{email:text}}],...(status?{status}:{})};
      const result=await prisma.$transaction([prisma.order.count({where}),prisma.order.findMany({where,skip,take,orderBy:{createdAt:"desc"},include:{purchaser:{select:{email:true}},plan:{select:{name:true,audience:true}},payments:{orderBy:{createdAt:"desc"}},subscription:true}})]);
      total=result[0];items=result[1].map(row=>({...row,title:row.code,payments:row.payments.map(serializePayment)}));break;
    }
    case "jobs": {
      const status = q.status ? z.enum(["PENDING","PUBLISHED","PAUSED","REJECTED","CLOSED","EXPIRED"]).parse(q.status) : undefined;
      const where: Prisma.JobPostWhereInput = { deletedAt: null, OR: [{ title: text }, { company: { name: text } }], ...(status ? { status } : {}) };
      [total, items] = await prisma.$transaction([prisma.jobPost.count({ where }), prisma.jobPost.findMany({ where, skip, take, orderBy: { createdAt: "desc" }, select: { id:true,title:true,status:true,description:true,requirements:true,benefits:true,createdAt:true,deadlineAt:true,company:{select:{name:true}},_count:{select:{applications:{where:{deletedAt:null}}}} } })]); break;
    }
    case "companies": {
      const verificationStatus = q.status ? z.enum(["pending","verified","rejected"]).parse(q.status) : undefined;
      const where: Prisma.CompanyWhereInput = { deletedAt:null, OR:[{name:text},{taxCode:text}], ...(verificationStatus?{verificationStatus}:{}) };
      [total,items]=await prisma.$transaction([prisma.company.count({where}),prisma.company.findMany({where,skip,take,orderBy:{createdAt:"desc"},select:{id:true,name:true,taxCode:true,description:true,website:true,verificationStatus:true,createdAt:true,account:{select:{email:true,status:true}},location:{select:{name:true}},_count:{select:{jobPosts:{where:{deletedAt:null}}}}}})]); break;
    }
    case "accounts": {
      const status=q.status?z.enum(["active","blocked"]).parse(q.status):undefined;
      const where:Prisma.AccountWhereInput={deletedAt:null,OR:[{email:text},{candidate:{fullName:text}},{company:{name:text}}],...(status?{status}:{})};
      [total,items]=await prisma.$transaction([prisma.account.count({where}),prisma.account.findMany({where,skip,take,orderBy:{createdAt:"desc"},select:{id:true,email:true,role:true,status:true,verifyEmail:true,createdAt:true,lastLoginAt:true,candidate:{select:{fullName:true}},company:{select:{name:true}}}})]); break;
    }
    case "plans": {
      const where={deletedAt:null,name:text};
      [total,items]=await prisma.$transaction([prisma.servicePlan.count({where}),prisma.servicePlan.findMany({where,skip,take,orderBy:[{audience:"asc"},{displayOrder:"asc"}],include:{entitlements:{include:{entitlement:true}}}})]); break;
    }
    case "audit": {
      const where:Prisma.AuditLogWhereInput={OR:[{action:text},{entityType:text},{actor:{email:text}}]};
      [total,items]=await prisma.$transaction([prisma.auditLog.count({where}),prisma.auditLog.findMany({where,skip,take,orderBy:{createdAt:"desc"},include:{actor:{select:{email:true}}}})]); break;
    }
    case "notifications": {
      const where:Prisma.NotificationWhereInput={type:"system",deletedAt:null,title:text};
      [total,items]=await prisma.$transaction([prisma.notification.count({where}),prisma.notification.findMany({where,skip,take,orderBy:{createdAt:"desc"},include:{recipient:{select:{email:true}}}})]); break;
    }
    case "categories": {
      const where={deletedAt:null,name:text};
      [total,items]=await prisma.$transaction([prisma.jobCategory.count({where}),prisma.jobCategory.findMany({where,skip,take,orderBy:{name:"asc"}})]); break;
    }
    case "titles": {
      const where={deletedAt:null,name:text,...(q.parentId?{jobCategoryId:q.parentId}:{})};
      [total,items]=await prisma.$transaction([prisma.jobTitle.count({where}),prisma.jobTitle.findMany({where,skip,take,orderBy:{name:"asc"},include:{category:{select:{name:true}}}})]); break;
    }
    case "provinces": {
      const where={name:text};
      [total,items]=await prisma.$transaction([prisma.province.count({where}),prisma.province.findMany({where,skip,take,orderBy:{name:"asc"}})]); break;
    }
    case "wards": {
      const where={fullName:text,...(q.parentId?{provinceId:q.parentId}:{})};
      [total,items]=await prisma.$transaction([prisma.ward.count({where}),prisma.ward.findMany({where,skip,take,orderBy:{fullName:"asc"},include:{province:{select:{name:true}}}})]); break;
    }
    default: throw new AppError("Không tìm thấy mục quản trị","NOT_FOUND",404);
  }
  res.json({data:{total,items,page:q.page,pages:Math.ceil(total/20)}});
});
router.patch("/accounts/:id", async (req,res)=>{
  const id=uuid.parse(req.params.id), input=z.object({status:z.enum(["active","blocked"]),reason:z.string().trim().min(3).max(500)}).strict().parse(req.body);
  await prisma.$transaction(async tx=>{
    const previous=await tx.account.findUniqueOrThrow({where:{id},select:{id:true,role:true,status:true}});
    if(previous.role==="admin")throw new AppError("Không được khóa tài khoản quản trị viên","ADMIN_PROTECTED",403);
    await tx.account.update({where:{id},data:{status:input.status}});
    await audit(tx,req.profile.id,"account.status","accounts",id,previous,input);
  });
  res.json({success:true});
});
router.post("/orders/:id/reconcile",async(req,res)=>{
  const id=uuid.parse(req.params.id);
  const order=await prisma.order.findFirst({where:{id,deletedAt:null},include:{payments:{where:{status:{in:["pending","processing"]}},orderBy:{createdAt:"desc"}}}});
  if(!order)throw new AppError("Không tìm thấy đơn hàng","NOT_FOUND",404);
  for(const payment of order.payments)await reconcilePayment(payment.id);
  await audit(prisma,req.profile.id,"order.reconcile","orders",id,{status:order.status},{requested:true});
  res.json({success:true});
});
router.patch("/companies/:id",async(req,res)=>{
  const id=uuid.parse(req.params.id),input=z.object({verificationStatus:z.enum(["verified","rejected","pending"]),reason:z.string().trim().min(3).max(500)}).strict().parse(req.body);
  const recipient = await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT id FROM company WHERE id=${id}::uuid FOR UPDATE`;
    const before=await tx.company.findUniqueOrThrow({where:{id},select:{verificationStatus:true,accountId:true,deletedAt:true}});
    if(before.deletedAt)throw new AppError("Không tìm thấy doanh nghiệp","NOT_FOUND",404);
    if(before.verificationStatus===input.verificationStatus)return null;
    await tx.company.update({where:{id},data:{verificationStatus:input.verificationStatus,verifiedAt:input.verificationStatus==="verified"?new Date():null}});
    await audit(tx,req.profile.id,"company.verify","company",id,before,input);
    const title = input.verificationStatus === "verified" ? "Doanh nghiệp đã được xác minh" : input.verificationStatus === "rejected" ? "Yêu cầu xác minh bị từ chối" : "Doanh nghiệp đang chờ xác minh";
    await tx.notification.create({data:{recipientAccountId:before.accountId,type:"system",title,description:`${title}. Lý do: ${input.reason}`.slice(0,255),link:"/employer?tab=company",eventKey:`company:verification:${id}:${randomUUID()}`,metadata:{companyId:id,verificationStatus:input.verificationStatus,reason:input.reason}}});
    return before.accountId;
  });
  if(recipient)publishNotification(recipient);
  res.json({success:true});
});
router.patch("/jobs/:id",async(req,res)=>{
  const id=uuid.parse(req.params.id),input=z.object({status:z.enum(["PUBLISHED","REJECTED"]),reason:z.string().trim().min(3).max(500)}).strict().parse(req.body);
  const recipient=await prisma.$transaction(async tx=>{
    const before=await tx.jobPost.findUniqueOrThrow({where:{id},include:{company:{select:{accountId:true,deletedAt:true,account:{select:{status:true,deletedAt:true}}}}}});
    await tx.$queryRaw`SELECT id FROM company WHERE id=${before.companyId}::uuid FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM job_post WHERE id=${id}::uuid FOR UPDATE`;
    const fresh=await tx.jobPost.findUniqueOrThrow({where:{id}});
    if(fresh.deletedAt)throw new AppError("Tin đã bị xóa","NOT_FOUND",404);
    const allowed=fresh.status==="PENDING"?["PUBLISHED","REJECTED"]:[];
    if(!allowed.includes(input.status))throw new AppError("Chuyển trạng thái không hợp lệ","INVALID_STATUS",409);
    if(input.status==="PUBLISHED"){
      if(before.company.deletedAt||before.company.account.deletedAt||before.company.account.status!=="active")throw new AppError("Doanh nghiệp không hoạt động","COMPANY_INACTIVE",409);
      if(fresh.deadlineAt&&fresh.deadlineAt<=new Date())throw new AppError("Tin đã quá hạn","JOB_EXPIRED",409);
      const plan=await currentPlan(before.company.accountId,tx);
      const used=await tx.jobPost.count({where:{companyId:before.companyId,id:{not:id},deletedAt:null,status:{in:["PENDING","PUBLISHED"]},OR:[{deadlineAt:null},{deadlineAt:{gt:new Date()}}]}});
      if(used>=plan.benefits.activeJobLimit)throw new AppError("Doanh nghiệp đã hết hạn mức tin tuyển dụng","JOB_LIMIT_REACHED",403);
    }
    await tx.jobPost.update({where:{id},data:{status:input.status,...(input.status==="PUBLISHED"&&!fresh.publishedAt?{publishedAt:new Date()}:{})}});
    await audit(tx,req.profile.id,"job.status","job_post",id,{status:fresh.status},input);
    const title=input.status==="PUBLISHED"?"Tin tuyển dụng đã được duyệt":"Tin tuyển dụng bị từ chối";
    await tx.notification.create({data:{recipientAccountId:before.company.accountId,type:"job",title,description:`${fresh.title}. Lý do: ${input.reason}`.slice(0,255),link:"/employer?tab=jobs",eventKey:`job:status:${id}:${randomUUID()}`,metadata:{jobPostId:id,status:input.status,reason:input.reason}}});
    return before.company.accountId;
  });
  publishNotification(recipient);
  res.json({success:true});
});
router.patch("/plans/:id",async(req,res)=>{
  const id=uuid.parse(req.params.id);
  const input=z.object({price:z.number().int().min(0).max(1000000000),isActive:z.boolean(),availability:z.enum(["available","coming_soon","disabled"]),benefits:z.record(z.string(),z.union([z.number().int().min(0),z.string().max(500),z.boolean()]))}).strict().parse(req.body);
  await prisma.$transaction(async tx=>{
    await tx.$queryRaw`SELECT id FROM service_plans WHERE id = ${id}::uuid FOR UPDATE`;
    const before=await tx.servicePlan.findUniqueOrThrow({where:{id},include:{entitlements:{include:{entitlement:true}}}});
    if(before.isFree&&(input.price!==0||!input.isActive||input.availability!=="available"))throw new AppError("Gói Free phải luôn khả dụng và miễn phí","INVALID_PLAN",409);
    if(before.code.endsWith("_premium")&&input.availability!=="coming_soon")throw new AppError("Premium vẫn đang phát triển","INVALID_PLAN",409);
    const expected=before.entitlements.map(e=>e.entitlement.code);
    if(Object.keys(input.benefits).length!==expected.length||expected.some(code=>!(code in input.benefits)))throw new AppError("Quyền lợi không đầy đủ","INVALID_PLAN",400);
    for(const row of before.entitlements){
      const value=input.benefits[row.entitlement.code]!;
      if(typeof value!==row.entitlement.valueType)throw new AppError("Sai kiểu dữ liệu quyền lợi","INVALID_PLAN",400);
      await tx.planEntitlement.update({where:{planId_entitlementId:{planId:id,entitlementId:row.entitlementId}},data:{value}});
    }
    await tx.servicePlan.update({where:{id},data:{price:input.price,isActive:input.isActive,availability:input.availability}});
    await audit(tx,req.profile.id,"plan.update","service_plans",id,{price:before.price.toString(),isActive:before.isActive,availability:before.availability,benefits:Object.fromEntries(before.entitlements.map(e=>[e.entitlement.code,e.value])) as Prisma.InputJsonObject},input);
  });res.json({success:true});
});
router.post("/notifications",async(req,res)=>{
  const input=z.object({title:z.string().trim().min(1).max(150),description:z.string().trim().min(1).max(255),audience:z.enum(["account","candidate","company"]).default("account"),email:z.email().optional(),requestKey:uuid.optional(),link:z.string().max(500).regex(/^\/(?!\/)/).optional()}).strict().parse(req.body);
  if(input.audience==="account"&&!input.email)throw new AppError("Hãy nhập email người nhận","BAD_REQUEST",400);
  const where:Prisma.AccountWhereInput={status:"active",deletedAt:null,...(input.audience==="account"?{email:input.email!}:{role:input.audience})};
  const key=input.requestKey??randomUUID();
  const result=await prisma.$transaction(async tx=>{
    let cursor:string|undefined,count=0;
    do{
      const rows=await tx.account.findMany({where,select:{id:true},orderBy:{id:"asc"},take:500,...(cursor?{cursor:{id:cursor},skip:1}:{})});
      if(!rows.length)break;
      const created=await tx.notification.createMany({skipDuplicates:true,data:rows.map(row=>({recipientAccountId:row.id,type:"system" as const,title:input.title,description:input.description,link:input.link??null,eventKey:`admin:${req.profile.id}:${key}:${row.id}`}))});
      count+=created.count;cursor=rows.at(-1)!.id;
    }while(cursor);
    if(input.audience==="account"&&!count&&!await tx.account.count({where}))throw new AppError("Không tìm thấy tài khoản hoạt động","NOT_FOUND",404);
    await audit(tx,req.profile.id,"notification.send","notifications",null,{}, {...input,sent:count});
    return count;
  },{timeout:30000});
  res.json({success:true,data:{sent:result}});
});
const catalogTypes=z.enum(["categories","titles","provinces","wards"]);
const catalogInput=z.object({name:z.string().trim().min(1).max(150),code:z.string().trim().min(1).max(180),parentId:uuid.optional(),isActive:z.boolean().optional()}).strict();
async function saveCatalog(req:Request,res:Response) {
  const type=catalogTypes.parse(req.params.type),id=req.params.id?uuid.parse(req.params.id):null,input=catalogInput.parse(req.body);
  if(input.code.length>(type==="titles"?30:type==="categories"?180:20))throw new AppError("Mã danh mục quá dài","BAD_REQUEST",400);
  if(["titles","wards"].includes(type)&&!input.parentId)throw new AppError("Hãy chọn danh mục cha","BAD_REQUEST",400);
  await prisma.$transaction(async tx=>{
    let before:unknown={},row:{id:string};
    switch(type){
      case "categories":{
        const data={name:input.name,code:input.code,...(input.isActive === undefined ? {} : {isActive:input.isActive})};
        if(id)before=await tx.jobCategory.findUniqueOrThrow({where:{id}});
        row=id?await tx.jobCategory.update({where:{id},data}):await tx.jobCategory.create({data});break;
      }
      case "titles":{
        const data={name:input.name,code:input.code,jobCategoryId:input.parentId!,...(input.isActive === undefined ? {} : {isActive:input.isActive})};
        await tx.jobCategory.findFirstOrThrow({where:{id:input.parentId!,deletedAt:null}});
        if(id)before=await tx.jobTitle.findUniqueOrThrow({where:{id}});
        row=id?await tx.jobTitle.update({where:{id},data}):await tx.jobTitle.create({data});break;
      }
      case "provinces":{
        const data={name:input.name,fullName:input.name,code:input.code,...(input.isActive === undefined ? {} : {isActive:input.isActive})};
        if(id)before=await tx.province.findUniqueOrThrow({where:{id}});
        row=id?await tx.province.update({where:{id},data}):await tx.province.create({data});break;
      }
      case "wards":{
        const data={fullName:input.name,code:input.code,provinceId:input.parentId!,...(input.isActive === undefined ? {} : {isActive:input.isActive})};
        await tx.province.findUniqueOrThrow({where:{id:input.parentId!}});
        if(id){
          const ward=await tx.ward.findUniqueOrThrow({where:{id}});before=ward;
          if(ward.provinceId!==input.parentId&&await tx.jobPost.count({where:{wardId:id}}))throw new AppError("Phường/xã đang được tin tuyển dụng tham chiếu, không thể đổi tỉnh","IN_USE",409);
        }
        row=id?await tx.ward.update({where:{id},data}):await tx.ward.create({data});break;
      }
    }
    await audit(tx,req.profile.id,id?"catalog.update":"catalog.create",type,row.id,JSON.parse(JSON.stringify(before)) as Prisma.InputJsonValue,input);
  });res.json({success:true});
}
router.post("/catalog/:type",saveCatalog);
router.patch("/catalog/:type/:id",saveCatalog);
router.delete("/catalog/:type/:id",async(req,res)=>{
  const type=catalogTypes.parse(req.params.type),id=uuid.parse(req.params.id);
  await prisma.$transaction(async tx=>{
    const table={categories:"job_category",titles:"job_title",provinces:"province",wards:"ward"}[type];
    await tx.$queryRaw(Prisma.sql`SELECT id FROM ${Prisma.raw(table)} WHERE id=${id}::uuid FOR UPDATE`);
    let before:unknown;
    switch(type){
      case "categories":
        if(await tx.jobTitle.count({where:{jobCategoryId:id}})||await tx.jobPost.count({where:{jobCategoryId:id}}))throw new AppError("Ngành nghề đang được tham chiếu","IN_USE",409);
        before=await tx.jobCategory.delete({where:{id}});break;
      case "titles":
        if(await tx.jobPost.count({where:{jobTitleId:id}}))throw new AppError("Vị trí đang được tham chiếu","IN_USE",409);
        before=await tx.jobTitle.delete({where:{id}});break;
      case "provinces":
        if(await tx.ward.count({where:{provinceId:id}})||await tx.candidate.count({where:{currentLocationId:id}})||await tx.company.count({where:{locationId:id}})||await tx.jobPost.count({where:{provinceId:id}}))throw new AppError("Tỉnh/thành đang được tham chiếu","IN_USE",409);
        before=await tx.province.delete({where:{id}});break;
      case "wards":
        if(await tx.jobPost.count({where:{wardId:id}}))throw new AppError("Phường/xã đang được tham chiếu","IN_USE",409);
        before=await tx.ward.delete({where:{id}});break;
    }
    await audit(tx,req.profile.id,"catalog.delete",type,id,JSON.parse(JSON.stringify(before)) as Prisma.InputJsonValue,{});
  });res.json({success:true});
});
router.use((error:unknown,_req:Request,_res:Response,next:NextFunction)=>{
  if(error instanceof z.ZodError){next(new AppError("Dữ liệu hoặc bộ lọc không hợp lệ","BAD_REQUEST",400));return;}
  if(error instanceof Prisma.PrismaClientKnownRequestError){
    if(error.code==="P2002"){next(new AppError("Mã danh mục đã tồn tại","DUPLICATE",409));return;}
    if(error.code==="P2003"){next(new AppError("Dữ liệu đang được tham chiếu hoặc danh mục cha không hợp lệ","IN_USE",409));return;}
    if(error.code==="P2025"){next(new AppError("Không tìm thấy bản ghi","NOT_FOUND",404));return;}
  }
  next(error);
});
export default router;
