import type { IssueStatus, IssueType, UserRole } from "../types";

export const roles: UserRole[] = ["contributor", "maintainer"];
export const issueTypes: IssueType[] = ["bug", "feature_request"];
export const issueStatuses: IssueStatus[] = ["open", "in_progress", "resolved"];

export const isRole = (value: unknown): value is UserRole =>
  typeof value === "string" && roles.includes(value as UserRole);

export const isIssueType = (value: unknown): value is IssueType =>
  typeof value === "string" && issueTypes.includes(value as IssueType);

export const isIssueStatus = (value: unknown): value is IssueStatus =>
  typeof value === "string" && issueStatuses.includes(value as IssueStatus);

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (value: unknown): value is string =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
