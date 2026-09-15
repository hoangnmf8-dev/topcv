import {NextFunction, Request, Response} from "express";
import { Schema, ZodError, ZodType } from "zod";
import { errorResponse } from "../utils/response";

const validateMiddleware = (schema: ZodType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
    } catch(error) {
      if(error instanceof ZodError) {
        const zodError = Object.fromEntries(
          error.issues.map(({path, message}) => {
            return [path[0], message];
          })
        );
        zodError.status = 400;
        return next(zodError);
      }
      next(error);
    };
    next();
  }
};
export default validateMiddleware;