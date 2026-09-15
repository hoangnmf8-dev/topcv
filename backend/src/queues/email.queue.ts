import {Queue} from "bullmq";
import { QUEUE } from "../constants/queue.contant";
import { redisQueueConnection } from "../utils/bullmq";

export const emailQueue = new Queue(QUEUE.EMAIL, {
  connection: redisQueueConnection!,
  defaultJobOptions: {
    attempts: 4, //số lần chạy lại
    backoff: {
      type: "exponential",
      delay: 5000
    }
  }
});
