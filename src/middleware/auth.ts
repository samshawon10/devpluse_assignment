import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { env } from "../config/env";
import type { AuthUser, AuthenticatedRequest } from "../types";
import { sendError } from "../utils/responses";

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const token = req.header("Authorization");

  if (!token) {
    sendError(res, StatusCodes.UNAUTHORIZED, "Authorization token is required");
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as AuthUser;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };
    next();
  } catch {
    sendError(res, StatusCodes.UNAUTHORIZED, "Invalid or expired token");
  }
};

export const requireMaintainer = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "maintainer") {
    sendError(res, StatusCodes.FORBIDDEN, "Maintainer role is required");
    return;
  }

  next();
};
