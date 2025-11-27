import type { DatabaseAdapter, DatabaseConfig, QueryParams, QueryResult } from "../types/dbTypes.js";

const demoUsers = [
  { id: 1, first_name: "Ada", last_name: "Lovelace", email: "ada@example.test", role: "admin" },
  { id: 2, first_name: "Alan", last_name: "Turing", email: "alan@example.test", role: "user" }
];

export class MockAdapter implements DatabaseAdapter {
  // The config is accepted for parity with other adapters but is not used functionally.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(private readonly config: Partial<DatabaseConfig> = {}) {}

  async connect(): Promise<void> {
    return;
  }

  async disconnect(): Promise<void> {
    return;
  }

  async query<T>(sql: string, params: QueryParams = []): Promise<QueryResult<T>> {
    const normalizedSql = sql.toLowerCase();
    const paramsArray = Array.isArray(params) ? params : Object.values(params);

    if (normalizedSql.includes("from users")) {
      const id = paramsArray[0];
      const user =
        id !== undefined
          ? demoUsers.find((u) => u.id === Number(id)) ?? demoUsers[0]
          : demoUsers[0];
      return { rows: [user] as unknown as T[] };
    }

    return { rows: [] as unknown as T[] };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
