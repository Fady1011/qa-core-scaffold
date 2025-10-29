import { test, expect } from "@playwright/test";
import { ApiClient, SchemaValidator } from "@yourorg/qa-core/api";

const client = new ApiClient();
const validator = new SchemaValidator();

test.describe("Sample API spec", () => {
  test.skip("validates health endpoint", async () => {
    const response = await client.get("/health");
    expect(response.status).toBe(200);
    const schema = {
      type: "object",
      required: ["status"],
      properties: {
        status: { type: "string" }
      }
    } as const;
    const result = validator.validate(schema, response.data);
    expect(result.valid).toBe(true);
  });
});
