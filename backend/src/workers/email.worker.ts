import {Job, Worker} from "bullmq";
import { QUEUE, QUEUE_JOB_NAME } from "../constants/queue.contant";
import { redisWorkerConnection } from "../utils/bullmq";
import { mailService } from "../services/mail.service";

new Worker(QUEUE.EMAIL, async(job: Job) => {
  if(job.name === QUEUE_JOB_NAME.AUTH_SEND_VERIFY_EMAIL) {
    await mailService.sendTemplateEmail(job.data);
  };
  if(job.name === QUEUE_JOB_NAME.AUTH_SEND_FORGOT_PASSWORD_EMAIL) {
    await mailService.sendTemplateEmail(job.data);
    console.log("đã gửi mail reset password");
  };
  //Nếu không có lỗi thì bullmq tự hiểu là hoàn thành
  //Nếu có throw(lỗi) thì hiểu là thất bại
}, {
  connection: redisWorkerConnection!
});