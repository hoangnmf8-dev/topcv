import "dotenv/config";
import { prisma } from "../src/utils/prisma";
import { currentPlan } from "../src/services/subscription.service";
async function main(){
 const companies=await prisma.company.findMany({where:{name:{contains:"F88"}},select:{id:true,name:true,accountId:true}});
 for(const company of companies){const plan=await currentPlan(company.accountId);const count=await prisma.jobPost.count({where:{companyId:company.id,deletedAt:null,status:{in:["PENDING","PUBLISHED"]},OR:[{deadlineAt:null},{deadlineAt:{gt:new Date()}}]}});console.log(JSON.stringify({company:company.name,plan:plan.name,limit:plan.benefits.activeJobLimit,used:count}));}
}
main().finally(()=>prisma.$disconnect());
