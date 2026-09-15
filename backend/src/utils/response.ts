import { Response } from "express";
import { getSystemErrorMessage } from "util";
import { AppError } from "../exceptions";

export const successResponse = <T>(
  res: Response,
  data: T,
  message: string,
  status = 200,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = <T>(res: Response, errors: T, status = 500) => {
  if(errors instanceof AppError) {
    return res.status(status).json({
      success: false,
      errors: {
        code: errors.code,
        name: errors.name,
        status: errors.status,
        message: errors.message
      }
    })
  };
  return res.status(status).json({
    success: false,
    errors,
    message: errors.message
  });
};
