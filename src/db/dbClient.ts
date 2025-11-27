import { getQaEnvConfig } from "../utils/env.js";
import { MockAdapter } from "./adapters/mockAdapter.js";
import { MySqlAdapter } from "./adapters/mysqlAdapter.js";
import { MsSqlAdapter } from "./adapters/mssqlAdapter.js";
import { PostgresAdapter } from "./adapters/postgresAdapter.js";
import type {
  DatabaseAdapter,
  DatabaseConfig,
  QueryParams,
  QueryResult,
  SupportedDatabase
} from "./types/dbTypes.js";

function createAdapter(config: DatabaseConfig): DatabaseAdapter {
  switch (config.type) {
    case "mock":
      return new MockAdapter(config);
    case "mysql":
      return new MySqlAdapter(config);
    case "postgres":
      return new PostgresAdapter(config);
    case "mssql":
      return new MsSqlAdapter(config);
    default:
      throw new Error(`Unsupported database type: ${config.type}`);
  }
}

export class DBClient {
  private readonly adapter: DatabaseAdapter;

  constructor(config?: Partial<DatabaseConfig>) {
    const envConfig = getQaEnvConfig();
    const mergedConfig: DatabaseConfig = {
      type: (config?.type ?? envConfig.db.type) as SupportedDatabase,
      host: config?.host ?? envConfig.db.host,
      port: config?.port ?? envConfig.db.port,
      user: config?.user ?? envConfig.db.user,
      password: config?.password ?? envConfig.db.pass,
      database: config?.database ?? envConfig.db.name
    };

    this.adapter = createAdapter(mergedConfig);
  }

  async connect(): Promise<void> {
    await this.adapter.connect();
  }

  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  async query<T>(sql: string, params: QueryParams = []): Promise<QueryResult<T>> {
    return this.adapter.query<T>(sql, params);
  }

  async healthCheck(): Promise<boolean> {
    return this.adapter.healthCheck();
  }
}
