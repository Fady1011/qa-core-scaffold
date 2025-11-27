import { Pool } from "pg";
import type { DatabaseAdapter, DatabaseConfig, QueryParams, QueryResult } from "../types/dbTypes.js";

export class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(private readonly config: DatabaseConfig) {
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      max: 10
    });
  }

  async connect(): Promise<void> {
    const client = await this.pool.connect();
    client.release();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async query<T>(sql: string, params: QueryParams = []): Promise<QueryResult<T>> {
    const values = Array.isArray(params) ? params : Object.values(params);
    const result = await this.pool.query(sql, values);
    return { rows: result.rows as T[] };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      console.error("Postgres health check failed", error);
      return false;
    }
  }
}
