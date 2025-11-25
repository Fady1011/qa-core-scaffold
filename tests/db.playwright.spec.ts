import { test, expect } from "@playwright/test";
import { DBManager } from "../src/db/dbManager";
import { UserQueries } from "../src/db/dbQueries/userQueries";
import { getQaEnvConfig } from "../src/utils/env";

const manager = new DBManager();
const env = getQaEnvConfig();

test.describe("Database smoke checks (mock-friendly)", () => {
  test("performs a health check", async () => {
    const result = await manager.healthCheck();
    expect(result).toBe(true);
  });

  test("fetches a user by id", async () => {
    const { rows } = await manager.runQuery(UserQueries.findById, [1]);
    expect(rows[0]).toHaveProperty("id");
  });

  test("uses configured DB profile", async () => {
    expect(env.db.type).toBeTruthy();
  });
});
