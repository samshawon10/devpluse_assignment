import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { createUser, findUserByEmail, signToken, toPublicUser, verifyPassword } from "./auth.service";
import type { UserRole } from "../../types";
import { sendError, sendSuccess } from "../../utils/responses";
import { isNonEmptyString, isRole, isValidEmail } from "../../utils/validators";

interface SignupBody {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  role?: unknown;
}

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

export const signup = async (req: Request<object, object, SignupBody>, res: Response): Promise<Response> => {
  const { name, email, password, role = "contributor" } = req.body;

  if (!isNonEmptyString(name)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Name is required");
  }

  if (!isValidEmail(email)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Valid email is required");
  }

  if (!isNonEmptyString(password)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Password is required");
  }

  if (!isRole(role)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Role must be contributor or maintainer");
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Email is already registered");
  }

  const user = await createUser(name, email, password, role as UserRole);
  return sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
};

export const login = async (req: Request<object, object, LoginBody>, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  if (!isValidEmail(email) || !isNonEmptyString(password)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Valid email and password are required");
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return sendError(res, StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const passwordMatches = await verifyPassword(password, user.password);
  if (!passwordMatches) {
    return sendError(res, StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const publicUser = toPublicUser(user);
  const token = signToken(publicUser);

  return sendSuccess(res, StatusCodes.OK, "Login successful", {
    token,
    user: publicUser
  });
};
