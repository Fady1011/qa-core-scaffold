import sql from "mssql";
import type { DatabaseAdapter, DatabaseConfig, QueryParams, QueryResult } from "../types/dbTypes";

const SUPPORTED_VALUE_TYPES = ["string", "number", "boolean"] as const;

function coerceSqlValue(
  value: unknown
):
  | sql.ISqlTypeFactory
  | sql.ISqlType
  | Buffer
  | string
  | number
  | boolean
  | Date
  | null
  | undefined {
  if (value instanceof Date || value instanceof Buffer) {
    return value;
  }
  if (value === null || value === undefined) {
    return value;
  }
  if (SUPPORTED_VALUE_TYPES.includes(typeof value as (typeof SUPPORTED_VALUE_TYPES)[number])) {
    return value as string | number | boolean;
  }
  return value as sql.ISqlTypeFactory | sql.ISqlType | undefined;
}

export class MsSqlAdapter implements DatabaseAdapter {
  private pool: sql.ConnectionPool;

  constructor(private readonly config: DatabaseConfig) {
    this.pool = new sql.ConnectionPool({
      user: config.user,
      password: config.password,
      server: config.host,
      database: config.database,
      port: config.port,
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    });
  }

  async connect(): Promise<void> {
    await this.pool.connect();
  }

  async disconnect(): Promise<void> {
    await this.pool.close();
  }

  async query<T>(statement: string, params: QueryParams = []): Promise<QueryResult<T>> {
    const request = this.pool.request();
    if (Array.isArray(params)) {
      params.forEach((value, index) => {
        request.input(`p${index}`, coerceSqlValue(value));
      });
    } else {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, coerceSqlValue(value));
      });
    }
    const result = await request.query<T>(statement);
    return { rows: (result.recordset ?? []) as T[] };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.request().query("SELECT 1");
      return true;
    } catch (error) {
      console.error("MSSQL health check failed", error);
      return false;
    }
  }
}
