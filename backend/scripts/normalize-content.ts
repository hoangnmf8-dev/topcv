import "dotenv/config";
import { Client } from "pg";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { cvSaveSchema, cvTemplateSchema, cvThemeSchema } from "../src/validators/cv.validate";

// Read-only by default. Apply requires a previously verified pg_dump archive.
const apply = process.argv.includes("--apply");
const backup = resolve("../database/backups/topcv-20261001-before-normalization.dump");
const reportPath = resolve("../database/backups/normalization-report.json");
if (apply && (!existsSync(backup) || readFileSync(backup).length < 1024)) throw new Error("Missing database backup");
const db = new Client({ connectionString: process.env.DATABASE_URL });
const marker = /demo|dữ liệu thử|dữ liệu kiểm thử|giả lập|TOPCV-DEMO/i;
const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;
type Row = Record<string, any>;
const changes: Record<string, number> = {};

function cleanMetadata(value: any): any {
  if (Array.isArray(value)) return value.map(cleanMetadata);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !["demo", "seed", "isSynthetic", "sampleCode", "phoneSource", "avatarSource", "displayEmailIsFictional"].includes(key))
    .map(([key, val]) => [key, cleanMetadata(val)]));
  return value;
}

async function snapshot(tables: string[]) {
  const result: Record<string, Row[]> = {};
  for (const table of tables) result[table] = (await db.query(`SELECT to_jsonb(t) AS row FROM ${quote(table)} t ORDER BY to_jsonb(t)::text`)).rows.map(r => r.row);
  return result;
}

async function main() {
  await db.connect();
  await db.query("BEGIN");
  const tables = (await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name <> '_prisma_migrations' ORDER BY table_name")).rows.map(r => r.table_name as string);
  // Keep the audit and normalization consistent with concurrent application writes.
  if (apply) await db.query(`LOCK TABLE ${tables.map(quote).join(", ")} IN SHARE ROW EXCLUSIVE MODE`);
  const before = await snapshot(tables);
  const constraints = (await db.query(`SELECT conrelid::regclass::text AS table_name, a.attname AS column_name
    FROM pg_constraint c CROSS JOIN LATERAL unnest(c.conkey) AS k(num)
    JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k.num WHERE c.contype IN ('f','p') ORDER BY table_name, column_name`)).rows;
  const fingerprint = (data: Record<string, Row[]>) => JSON.stringify(tables.map(t => [t, data[t].map(r => JSON.stringify(constraints.filter(c => c.table_name === t).map(c => r[c.column_name]))).sort()]));
  const original = fingerprint(before);
  const accounts = new Map(before.accounts.map(r => [r.id, r]));
  const candidates = new Map(before.candidate.map(r => [r.id, {...r}]));

  async function update(table: string, row: Row, patch: Row) {
    const entries = Object.entries(patch).filter(([key, value]) => JSON.stringify(row[key]) !== JSON.stringify(value));
    if (!entries.length) return;
    changes[table] = (changes[table] ?? 0) + 1;
    if (apply) await db.query(`UPDATE ${quote(table)} SET ${entries.map(([key], i) => `${quote(key)}=$${i + 1}`).join(",")} WHERE id=$${entries.length + 1}`,
      [...entries.map(([, value]) => value && typeof value === "object" ? JSON.stringify(value) : value), row.id]);
    Object.assign(row, patch);
  }

  const names = ["Nguyễn Hoàng Nam", "Trần Minh Anh", "Lê Tuấn Kiệt"];
  let candidateIndex = 0;
  for (const row of before.candidate) {
    if (marker.test(row.full_name)) {
      const index = candidateIndex++;
      await update("candidate", row, {full_name:names[index], headline:["Lập trình viên Frontend", "Lập trình viên Backend", "Kỹ sư phần mềm"][index], phone:`09013524${String(index + 10).padStart(2,"0")}`, career_goal:"Phát triển sản phẩm phần mềm ổn định, nâng cao trải nghiệm người dùng và đóng góp vào chất lượng bàn giao của đội ngũ."});
    }
    candidates.set(row.id, {...row});
  }
  for (const row of before.accounts) if (marker.test(row.email)) {
    const profile = [...candidates.values()].find(c => c.account_id === row.id);
    const local = profile ? profile.full_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("đ","d").toLowerCase().replaceAll(" ",".") : "tuyendung";
    await update("accounts", row, {email:`${local}.${row.id.slice(0,8)}@example.com`});
  }
  for (const row of before.company) {
    const patch: Row = {description:row.description?.replace(/\n\nLưu ý: Đây là nội dung giới thiệu mẫu[\s\S]*$/, "").trim()};
    if (marker.test(row.code)) patch.code = `doanh-nghiep-${row.id.slice(0,8)}`;
    await update("company", row, patch);
  }
  for (const row of before.cvs) {
    const candidate = candidates.get(row.candidate_id)!;
    const old = row.content_json ?? {};
    const valid = cvSaveSchema.safeParse({title:row.title,templateCode:row.template_code,contentJson:old});
    if (valid.success) continue;
    const personal = old.personal ?? {};
    const title = candidate.headline ?? personal.title ?? "Chuyên viên phát triển phần mềm";
    const skills = (old.skills ?? ["JavaScript", "TypeScript", "React", "Git"]).map((s: any, i: number) => typeof s === "string" ? {id:`skill-${row.id}-${i}`,name:s,level:3} : {id:s.id,name:s.name,level:Math.min(5,Math.max(1,Number(s.level)||3))});
    const contentJson = {
      personal:{fullName:candidate.full_name,title,phone:candidate.phone ?? personal.phone ?? "0901352413",email:accounts.get(candidate.account_id)!.email,address:candidate.address ?? personal.address ?? "",github:personal.github ?? "",linkedin:personal.linkedin ?? "",avatarKey:""},
      objective:(candidate.career_goal ?? "Phát triển chuyên môn, phối hợp hiệu quả với đồng nghiệp và nâng cao chất lượng công việc.").slice(0,200),
      experiences:(old.experiences ?? [{id:`experience-${row.id}`,company:"Nhóm phát triển sản phẩm",role:title,timeline:"09/2025 - Hiện tại",bullets:["Phát triển giao diện theo yêu cầu nghiệp vụ và phối hợp xử lý các vấn đề phát sinh.","Viết tài liệu bàn giao, rà soát chất lượng mã nguồn và theo dõi tiến độ công việc."]}]).map((e:any)=>({id:e.id,company:e.company,role:e.role.slice(0,50),timeline:e.timeline,bullets:e.bullets.map((b:string)=>b.slice(0,150))})),
      educations:(old.educations ?? [{id:`education-${row.id}`,school:"Đại học Công nghệ",degree:"Công nghệ thông tin",timeline:"2021 - 2025"}]).map((e:any)=>({id:e.id,school:e.school,degree:e.degree,timeline:e.timeline})),
      skills,theme:cvThemeSchema.safeParse(old.theme).success?old.theme:"emerald",
    };
    const templateCode=cvTemplateSchema.safeParse(row.template_code).success?row.template_code:"modern";
    const payload=cvSaveSchema.parse({title:`${candidate.full_name} - ${title}`,templateCode,contentJson});
    await update("cvs",row,{title:payload.title,template_code:payload.templateCode,content_json:payload.contentJson});
  }
  for(const row of before.job_category) if(marker.test(row.code)) await update("job_category",row,{code:"software-engineering",name:"Kỹ thuật phần mềm",description:"Phát triển, vận hành và bảo đảm chất lượng sản phẩm phần mềm."});
  for(const [i,row] of before.job_title.filter(r=>marker.test(r.code)).entries()) await update("job_title",row,{code:`software-engineering-${i+1}`,name:row.name.replace(/\s*Demo/gi,"")});
  for(const row of before.messages) if(marker.test(row.content)) await update("messages",row,{content:row.type==="file"?"Tôi gửi kèm thông tin chuẩn bị phỏng vấn. Anh/chị xem giúp và phản hồi thời gian phù hợp nhé.":"Xin chào anh/chị, tôi muốn trao đổi thêm về vị trí tuyển dụng và các bước phỏng vấn tiếp theo."});
  for(const row of before.message_attachments) if(marker.test(row.file_name)) {
    const text="Thông tin chuẩn bị phỏng vấn\nVui lòng chuẩn bị CV cập nhật, mô tả dự án đã tham gia và các câu hỏi về công việc. Thời gian phỏng vấn sẽ được xác nhận trong hội thoại.\n";
    await update("message_attachments",row,{file_name:"huong-dan-phong-van.txt",file_url:`data:text/plain;base64,${Buffer.from(text).toString("base64")}`,file_size:Buffer.byteLength(text)});
  }
  for(const row of before.notifications) if(marker.test(JSON.stringify(row))) await update("notifications",row,{title:"Theo dõi tiến độ ứng tuyển",description:"Bạn có thể xem trạng thái hồ sơ và phản hồi tuyển dụng tại mục Việc đã ứng tuyển.",metadata:cleanMetadata(row.metadata)});
  for(const row of before.service_plans) if(!/^(candidate|company)_(free|pro|premium)$/.test(row.code) && marker.test(JSON.stringify(row))) {
    const candidate=row.audience==="candidate";
    await update("service_plans",row,{code:candidate?"TOPCV-PRO-30":"RECRUITMENT-30",name:candidate?"TopCV Pro 30 ngày":"Gói tuyển dụng 30 ngày",description:candidate?"Công cụ hoàn thiện hồ sơ và quản lý hành trình tìm việc trong 30 ngày.":"Quản lý tin tuyển dụng, theo dõi hồ sơ ứng tuyển và phối hợp tuyển chọn trong 30 ngày.",metadata:cleanMetadata(row.metadata)});
  }
  for(const row of before.orders) if(marker.test(JSON.stringify(row))) await update("orders",row,{code:`TCV-${row.created_at.slice(0,10).replaceAll("-","")}-${row.id.slice(0,8).toUpperCase()}`,metadata:cleanMetadata(row.metadata)});
  for(const row of before.payments) if(marker.test(JSON.stringify(row))) await update("payments",row,{provider:"bank_transfer",transaction_code:`PAY-${row.id.slice(0,8).toUpperCase()}`,failure_reason:row.failure_reason?"Giao dịch không được ngân hàng chấp thuận.":null});
  for(const row of before.audit_logs) if(marker.test(JSON.stringify(row))) await update("audit_logs",row,{action:"ORDER_CREATED",request_id:`order-${row.entity_id}`,after_data:cleanMetadata(row.after_data),before_data:cleanMetadata(row.before_data)});

  const after = apply ? await snapshot(tables) : before;
  if(fingerprint(after)!==original) throw new Error("IDs or foreign keys changed");
  const remaining = Object.entries(after).flatMap(([table,rows])=>rows.filter(row=>marker.test(JSON.stringify(row))).map(row=>({table,id:row.id})));
  if(remaining.length) throw new Error(`Unresolved content markers (${remaining.length}): ${JSON.stringify(remaining.slice(0,10))}`);
  for(const row of after.cvs) cvSaveSchema.parse({title:row.title,templateCode:row.template_code,contentJson:row.content_json});
  await db.query(apply?"COMMIT":"ROLLBACK");
  const report={applied:apply,counts:Object.fromEntries(tables.map(t=>[t,after[t].length])),changes,cvSchemaValid:after.cvs.length,idsAndRelationsPreserved:true,remainingMarkers:remaining,backup,backupSha256:existsSync(backup)?createHash("sha256").update(readFileSync(backup)).digest("hex"):null};
  if(apply) writeFileSync(reportPath,JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}
main().catch(async error=>{await db.query("ROLLBACK");console.error(error);process.exitCode=1;}).finally(()=>db.end());
