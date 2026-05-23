import { Pool, type QueryResultRow } from "pg";
import { getDatabaseUrl } from "./env";

let pool: Pool | null = null;

const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl()
    });
  }

  return pool;
};

export const query = <Row extends QueryResultRow>(text: string, values?: unknown[]) =>
  getPool().query<Row>(text, values);
