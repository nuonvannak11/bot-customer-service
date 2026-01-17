import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(200).json({
    message: err.message || "Server error",
  });
};
