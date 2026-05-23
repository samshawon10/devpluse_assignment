import type { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  const body: { success: true; message: string; data?: T } = {
    success: true,
    message
  };

  if (data !== undefined) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown
): Response => {
  const body: { success: false; message: string; errors?: unknown } = {
    success: false,
    message
  };

  if (errors !== undefined) {
    body.errors = errors;
  }

  return res.status(statusCode).json(body);
};
