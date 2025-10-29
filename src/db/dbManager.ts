import { DBClient } from "./dbClient";
import type { QueryParams, QueryResult } from "./types/dbTypes";

export class DBManager {
  private readonly client: DBClient;

  constructor(client?: DBClient) {
    this.client = client ?? new DBClient();
  }

  async withConnection<T>(callback: (client: DBClient) => Promise<T>): Promise<T> {
    await this.client.connect();
    try {
      return await callback(this.client);
    } finally {
      await this.client.disconnect();
    }
  }

  async runQuery<T>(sql: string, params: QueryParams = []): Promise<QueryResult<T>> {
    return this.withConnection((client) => client.query<T>(sql, params));
  }

  async healthCheck(): Promise<boolean> {
    await this.client.connect();
    try {
      return await this.client.healthCheck();
    } finally {
      await this.client.disconnect();
    }
  }
}
