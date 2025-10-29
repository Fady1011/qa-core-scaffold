export type SupportedDatabase = "mysql" | "postgres" | "mssql";

export interface DatabaseConfig {
  type: SupportedDatabase;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface QueryResult<T = unknown> {
  rows: T[];
}

export type QueryParams = unknown[] | Record<string, unknown>;

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query<T>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
  healthCheck(): Promise<boolean>;
}

export type TransactionCallback<T> = (client: DatabaseAdapter) => Promise<T>;
