import type { Response } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { StatusCodes } from "http-status-codes";
import {
  attachReporters,
  createIssue,
  deleteIssue,
  findIssueById,
  getIssues,
  updateIssueFields
} from "./issues.service";
import type { AuthenticatedRequest, IssueStatus, IssueType } from "../../types";
import { sendError, sendSuccess } from "../../utils/responses";
import { isIssueStatus, isIssueType, isNonEmptyString } from "../../utils/validators";

interface IssueParams extends ParamsDictionary {
  id: string;
}

interface CreateIssueBody {
  title?: unknown;
  description?: unknown;
  type?: unknown;
}

interface UpdateIssueBody {
  title?: unknown;
  description?: unknown;
  type?: unknown;
  status?: unknown;
}

interface IssueQuery {
  sort?: unknown;
  type?: unknown;
  status?: unknown;
}

const parseId = (value: unknown): number | null => {
  if (typeof value !== "string") {
    return null;
  }

  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const create = async (
  req: AuthenticatedRequest<object, object, CreateIssueBody>,
  res: Response
): Promise<Response> => {
  const { title, description, type } = req.body;

  if (!req.user) {
    return sendError(res, StatusCodes.UNAUTHORIZED, "Authorization token is required");
  }

  if (!isNonEmptyString(title) || title.trim().length > 150) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Title is required and must be at most 150 characters");
  }

  if (!isNonEmptyString(description) || description.trim().length < 20) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Description is required and must be at least 20 characters");
  }

  if (!isIssueType(type)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Type must be bug or feature_request");
  }

  const issue = await createIssue(title, description, type, req.user.id);
  return sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
};

export const findAll = async (
  req: AuthenticatedRequest<object, object, object, IssueQuery>,
  res: Response
): Promise<Response> => {
  const sort = req.query.sort === "oldest" ? "oldest" : "newest";
  const type = req.query.type;
  const status = req.query.status;

  if (type !== undefined && !isIssueType(type)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Type filter must be bug or feature_request");
  }

  if (status !== undefined && !isIssueStatus(status)) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Status filter must be open, in_progress, or resolved");
  }

  if (req.query.sort !== undefined && req.query.sort !== "newest" && req.query.sort !== "oldest") {
    return sendError(res, StatusCodes.BAD_REQUEST, "Sort must be newest or oldest");
  }

  const issues = await getIssues(sort, type as IssueType | undefined, status as IssueStatus | undefined);
  const issuesWithReporters = await attachReporters(issues);

  return sendSuccess(res, StatusCodes.OK, "Issues retrived successfully", issuesWithReporters);
};

export const findOne = async (
  req: AuthenticatedRequest<IssueParams>,
  res: Response
): Promise<Response> => {
  const id = parseId(req.params.id);

  if (!id) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Issue id must be a positive integer");
  }

  const issue = await findIssueById(id);
  if (!issue) {
    return sendError(res, StatusCodes.NOT_FOUND, "Issue not found");
  }

  const [issueWithReporter] = await attachReporters([issue]);
  return sendSuccess(res, StatusCodes.OK, "Issue retrived successfully", issueWithReporter);
};

export const update = async (
  req: AuthenticatedRequest<IssueParams, object, UpdateIssueBody>,
  res: Response
): Promise<Response> => {
  const id = parseId(req.params.id);

  if (!req.user) {
    return sendError(res, StatusCodes.UNAUTHORIZED, "Authorization token is required");
  }

  if (!id) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Issue id must be a positive integer");
  }

  const issue = await findIssueById(id);
  if (!issue) {
    return sendError(res, StatusCodes.NOT_FOUND, "Issue not found");
  }

  if (req.user.role !== "maintainer") {
    if (issue.reporter_id !== req.user.id) {
      return sendError(res, StatusCodes.FORBIDDEN, "Contributors can only update their own issues");
    }

    if (issue.status !== "open") {
      return sendError(res, StatusCodes.CONFLICT, "Contributors can only update issues while they are open");
    }
  }

  const fields: Parameters<typeof updateIssueFields>[1] = {};
  const { title, description, type } = req.body;

  if (title !== undefined) {
    if (!isNonEmptyString(title) || title.trim().length > 150) {
      return sendError(res, StatusCodes.BAD_REQUEST, "Title must be a non-empty string up to 150 characters");
    }
    fields.title = title;
  }

  if (description !== undefined) {
    if (!isNonEmptyString(description) || description.trim().length < 20) {
      return sendError(res, StatusCodes.BAD_REQUEST, "Description must be at least 20 characters");
    }
    fields.description = description;
  }

  if (type !== undefined) {
    if (!isIssueType(type)) {
      return sendError(res, StatusCodes.BAD_REQUEST, "Type must be bug or feature_request");
    }
    fields.type = type;
  }

  if (req.body.status !== undefined) {
    if (req.user.role !== "maintainer") {
      return sendError(res, StatusCodes.FORBIDDEN, "Only maintainers can update issue status");
    }

    if (!isIssueStatus(req.body.status)) {
      return sendError(res, StatusCodes.BAD_REQUEST, "Status must be open, in_progress, or resolved");
    }

    fields.status = req.body.status;
  }

  if (Object.keys(fields).length === 0) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Provide at least one field to update");
  }

  const updatedIssue = await updateIssueFields(id, fields);
  return sendSuccess(res, StatusCodes.OK, "Issue updated successfully", updatedIssue);
};

export const remove = async (
  req: AuthenticatedRequest<IssueParams>,
  res: Response
): Promise<Response> => {
  const id = parseId(req.params.id);

  if (!id) {
    return sendError(res, StatusCodes.BAD_REQUEST, "Issue id must be a positive integer");
  }

  const wasDeleted = await deleteIssue(id);
  if (!wasDeleted) {
    return sendError(res, StatusCodes.NOT_FOUND, "Issue not found");
  }

  return sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
};
