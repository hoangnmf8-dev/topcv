import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import indexRouter from "./routes/index.route";
import { errorResponse } from "./utils/response";
import { HTTPError } from "./types/auth.type";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { initRealtime } from "./realtime";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use(cookieParser());
app.set("query parser", "extended");
app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(indexRouter);
app.use((req: Request, res: Response, next: NextFunction) => {
  return errorResponse(
    res,
    {
      status: 404,
      message: "Not found",
    },
    404,
  );
});
app.use(
  (errors: HTTPError, req: Request, res: Response, next: NextFunction) => {
    return errorResponse(res, errors, errors.status);
  },
);
const server = createServer(app);
initRealtime(server);
server.listen(Number(process.env.PORT ?? 3100), () => {
  console.log("Server đang chạy");
});
