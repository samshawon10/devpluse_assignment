import { StatusCodes } from "http-status-codes";
import type { Request, Response } from "express";
import { sendError } from "../utils/responses";

export const notFound = (req: Request, res: Response): Response =>
  sendError(res, StatusCodes.NOT_FOUND, `Route not found: ${req.method} ${req.originalUrl}`);
