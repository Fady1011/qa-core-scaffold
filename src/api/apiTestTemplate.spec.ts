import { test, expect } from "@playwright/test";
import { ApiClient } from "./apiClient.js";
import { SchemaValidator } from "./schemaValidator.js";

const validator = new SchemaValidator();

interface UserResponse {
  id: number;
  email: string;
  [key: string]: unknown;
}

const userSchema = {
  type: "object",
  required: ["id", "email"] as const,
  properties: {
    id: { type: "number" },
    email: { type: "string", format: "email" }
  },
  additionalProperties: true
} as const;

test.describe.skip("Sample API flow", () => {
  const client = new ApiClient();

  test("validates GET user response", async () => {
    const response = await client.get("/users/1");
    const result = validator.validate<UserResponse>(userSchema, response.data);
    expect(result.valid).toBe(true);
  });

  test("validates POST payload", async () => {
    const payload = { email: "qa@yourorg.com", password: "super-secret" };
    const response = await client.post<typeof payload, { token: string }>("/sessions", payload);
    expect(response.status).toBe(201);
    expect(response.data.token).toBeDefined();
  });
});
