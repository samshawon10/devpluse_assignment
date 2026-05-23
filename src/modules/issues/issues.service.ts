import { pool } from "../../config/db";
import type { IssueRow, IssueStatus, IssueType } from "../../types";
import { buildSetClause, buildWhereClause, createPlaceholders } from "../../utils/sql";

interface Reporter {
  id: number;
  name: string;
  role: string;
}

export interface IssueWithReporter extends Omit<IssueRow, "reporter_id"> {
  reporter: Reporter | null;
}

export const createIssue = async (
  title: string,
  description: string,
  type: IssueType,
  reporterId: number
): Promise<IssueRow> => {
  const result = await pool.query<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title.trim(), description.trim(), type, reporterId]
  );

  return result.rows[0];
};

export const findIssueById = async (id: number): Promise<IssueRow | null> => {
  const result = await pool.query<IssueRow>(
    "SELECT id, title, description, type, status, reporter_id, created_at, updated_at FROM issues WHERE id = $1",
    [id]
  );
  return result.rows[0] ?? null;
};

export const getIssues = async (
  sort: "newest" | "oldest",
  type?: IssueType,
  status?: IssueStatus
): Promise<IssueRow[]> => {
  const { clause, values } = buildWhereClause([
    { clause: "type = ?", values: type ? [type] : [] },
    { clause: "status = ?", values: status ? [status] : [] }
  ]);
  const orderDirection = sort === "oldest" ? "ASC" : "DESC";

  const result = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     ${clause}
     ORDER BY created_at ${orderDirection}, id ${orderDirection}`,
    values
  );

  return result.rows;
};

export const getReportersByIds = async (ids: number[]): Promise<Map<number, Reporter>> => {
  if (ids.length === 0) {
    return new Map();
  }

  const uniqueIds = [...new Set(ids)];
  const placeholders = createPlaceholders(uniqueIds.length);
  const result = await pool.query<Reporter>(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    uniqueIds
  );

  return new Map(result.rows.map((reporter) => [reporter.id, reporter]));
};

export const attachReporters = async (issues: IssueRow[]): Promise<IssueWithReporter[]> => {
  const reporters = await getReportersByIds(issues.map((issue) => issue.reporter_id));

  return issues.map(({ reporter_id, ...issue }) => ({
    ...issue,
    reporter: reporters.get(reporter_id) ?? null
  }));
};

export const updateIssueFields = async (
  id: number,
  fields: Partial<Pick<IssueRow, "title" | "description" | "type" | "status">>
): Promise<IssueRow> => {
  const { setClause, values } = buildSetClause({
    title: fields.title?.trim(),
    description: fields.description?.trim(),
    type: fields.type,
    status: fields.status
  });

  values.push(id);

  const result = await pool.query<IssueRow>(
    `UPDATE issues
     SET ${setClause}
     WHERE id = $${values.length}
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values
  );

  return result.rows[0];
};

export const deleteIssue = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM issues WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};
