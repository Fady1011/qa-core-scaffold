import mysql, { Pool, type RowDataPacket } from "mysql2/promise";
import type { DatabaseAdapter, DatabaseConfig, QueryParams, QueryResult } from "../types/dbTypes";

export class MySqlAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor(private readonly config: DatabaseConfig) {
    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10
    });
  }

  async connect(): Promise<void> {
    const connection = await this.pool.getConnection();
    connection.release();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
  }

  async query<T>(sql: string, params: QueryParams = []): Promise<QueryResult<T>> {
    const valuesArray: unknown[] = Array.isArray(params) ? params : Object.values(params);
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, valuesArray);
    return { rows: rows as unknown as T[] };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      console.error("MySQL health check failed", error);
      return false;
    }
  }
}
