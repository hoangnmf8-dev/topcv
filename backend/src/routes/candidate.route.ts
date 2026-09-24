import express from "express";
import { z } from "zod";
import { authMiddleware } from "../middlewares/auth.middleware";
import { prisma } from "../utils/prisma";
import { successResponse } from "../utils/response";
const candidateRouter = express.Router();
candidateRouter.use(authMiddleware);
