export interface SqlCondition {
  clause: string;
  values: unknown[];
}

export interface SqlSetClause {
  setClause: string;
  values: unknown[];
}

export const createPlaceholders = (count: number, startAt = 1): string =>
  Array.from({ length: count }, (_value, index) => `$${index + startAt}`).join(", ");

export const buildWhereClause = (conditions: SqlCondition[]): SqlCondition => {
  const clauses: string[] = [];
  const values: unknown[] = [];

  for (const condition of conditions) {
    if (condition.values.length === 0) {
      continue;
    }

    clauses.push(condition.clause.replace("?", `$${values.length + 1}`));
    values.push(...condition.values);
  }

  return {
    clause: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
    values
  };
};

export const buildSetClause = (fields: Record<string, unknown>): SqlSetClause => {
  const assignments: string[] = [];
  const values: unknown[] = [];

  for (const [column, value] of Object.entries(fields)) {
    if (value === undefined) {
      continue;
    }

    values.push(value);
    assignments.push(`${column} = $${values.length}`);
  }

  return {
    setClause: assignments.join(", "),
    values
  };
};
