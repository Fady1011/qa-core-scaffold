import { test, expect } from "@playwright/test";
import { ApiClient } from "../src/api/apiClient";
import { SchemaValidator } from "../src/api/schemaValidator";
import { getQaEnvConfig } from "../src/utils/env";

const client = new ApiClient();
const validator = new SchemaValidator();
const env = getQaEnvConfig();

test.describe("API regression (demo-ready)", () => {
  test("validates placeholder post contract", async () => {
    const response = await client.get("/posts/1");
    expect(response.status).toBe(200);

    const schema = {
      type: "object",
      required: ["userId", "id", "title", "body"],
      properties: {
        userId: { type: "number" },
        id: { type: "number" },
        title: { type: "string" },
        body: { type: "string" }
      },
      additionalProperties: true
    } as const;

    const result = validator.validate(schema, response.data);
    expect(result.valid).toBe(true);
  });

  test("uses configured base URL", async () => {
    // Ensures the demo/test is actually pointed at the desired API host.
    expect(env.api.baseUrl).toContain("http");
  });
});
