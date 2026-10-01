import assert from "node:assert/strict";
import { formatAiText, AI_TEXT_LIMITS } from "../src/rules";
import { cvDataSchema as backendCv } from "../src/validators/cv.validate";
import { cvDataSchema as frontendCv } from "../../frontend/src/validators/cv.validate";
import { jobPostCreateSchema } from "../src/types/job-post-create.type";
import type { GoogleGenAI } from "@google/genai";
import { AIService } from "../src/services/AI.service";

assert.equal(formatAiText("• Phân tích yêu cầu\n\n1. Phát triển giao diện\n- Kiểm tra chất lượng"), "- Phân tích yêu cầu\n- Phát triển giao diện\n- Kiểm tra chất lượng");
assert.equal(formatAiText("-\n*\n•"), "");
assert.equal(AI_TEXT_LIMITS.objective, 500);
assert.equal(AI_TEXT_LIMITS.experience, 500);
const data={personal:{fullName:"Nguyễn Minh Anh",title:"Lập trình viên",phone:"0901352410",email:"minhanh@example.com",address:"Hà Nội",github:"",linkedin:""},objective:"a".repeat(500),experiences:[{id:"exp-1",company:"Công ty Công nghệ",role:"Lập trình viên",timeline:"2024 - Hiện tại",bullets:["a".repeat(500)]}],educations:[],skills:[]};
for(const schema of [backendCv,frontendCv]) {
  assert.equal(schema.safeParse(data).success,true);
  assert.equal(schema.safeParse({...data,objective:"a".repeat(501)}).success,false);
  assert.equal(schema.safeParse({...data,experiences:[{...data.experiences[0],bullets:["a".repeat(250),"b".repeat(250)]}]}).success,false);
  assert.equal(schema.safeParse({...data,experiences:[{...data.experiences[0],bullets:["a".repeat(249),"b".repeat(250)]}]}).success,true);
}
for(const [field,limit] of [["description",5000],["requirements",5000],["benefits",3000]] as const) {
  const schema=jobPostCreateSchema.shape[field];
  assert.equal(schema.safeParse("a".repeat(limit)).success,true);
  assert.equal(schema.safeParse("a".repeat(limit+1)).success,false);
}
async function verifyGeneration() {
  const originalKey=process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY="local-verification-key";
  let generateContent: () => Promise<{text:string}>;
  const aiService = new AIService(()=>({models:{generateContent:()=>generateContent()}} as unknown as GoogleGenAI));
  let calls=0;
  try {
    generateContent=async()=>({text:++calls===1?"a".repeat(501):"Phân tích yêu cầu\nPhối hợp bàn giao"});
    assert.equal(await aiService.generateTextAI("experience",{currentText:"Phân tích yêu cầu; phối hợp bàn giao"}),"- Phân tích yêu cầu\n- Phối hợp bàn giao");
    assert.equal(calls,2);
    calls=0;
    generateContent=async()=>{calls++;return {text:"a".repeat(501)};};
    await assert.rejects(()=>aiService.generateTextAI("objective",{currentText:"Phát triển chuyên môn"}),/vượt giới hạn/);
    assert.equal(calls,2);
    await assert.rejects(()=>aiService.generateTextAI("objective",{currentText:""}),/nhập nội dung/);
  } finally {
    if(originalKey===undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY=originalKey;
  }
  console.log("Passed: bullet formatting, frontend/backend boundaries, employer limits, AI retry and oversized output rejection. No external AI calls.");
}
verifyGeneration().catch(error=>{console.error(error);process.exitCode=1;});
