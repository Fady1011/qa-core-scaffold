import { test, expect } from "@playwright/test";
import { ApiClient } from "../src/api/apiClient";
import { SchemaValidator } from "../src/api/schemaValidator";

const client = new ApiClient();
const validator = new SchemaValidator();

test.describe.skip("API regression", () => {
  test("validates account profile contract", async () => {
    const response = await client.get("/profile");
    const schema = {
      type: "object",
      required: ["id", "email"],
      properties: {
        id: { type: "string" },
        email: { type: "string", format: "email" }
      },
      additionalProperties: true
    } as const;

    const result = validator.validate(schema, response.data);
    expect(result.valid).toBe(true);
  });
});
