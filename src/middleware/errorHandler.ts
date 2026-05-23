import { StatusCodes } from "http-status-codes";
import type { ErrorRequestHandler } from "express";
import { sendError } from "../utils/responses";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  console.error("[server:error]", message);
  return sendError(res, StatusCodes.INTERNAL_SERVER_ERROR, "Internal server error", message);
};
