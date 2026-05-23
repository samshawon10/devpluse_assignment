import type { Request } from "express";
import type { ParamsDictionary, Query } from "express-serve-static-core";

export type UserRole = "contributor" | "maintainer";
export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";

export interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
}

export interface AuthenticatedRequest<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Query
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  user?: AuthUser;
}
