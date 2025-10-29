import { test, expect } from "@playwright/test";
import { DBManager } from "../src/db/dbManager";
import { UserQueries } from "../src/db/dbQueries/userQueries";

const manager = new DBManager();

test.describe.skip("Database smoke checks", () => {
  test("performs a health check", async () => {
    const result = await manager.healthCheck();
    expect(result).toBe(true);
  });

  test("fetches a user by id", async () => {
    const { rows } = await manager.runQuery(UserQueries.findById, [1]);
    expect(rows[0]).toHaveProperty("id");
  });
});
