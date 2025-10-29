import { test, expect } from "@playwright/test";
import { ApiClient } from "./apiClient";
import { SchemaValidator } from "./schemaValidator";
const validator = new SchemaValidator();
const userSchema = {
    type: "object",
    required: ["id", "email"],
    properties: {
        id: { type: "number" },
        email: { type: "string", format: "email" }
    },
    additionalProperties: true
};
test.describe.skip("Sample API flow", () => {
    const client = new ApiClient();
    test("validates GET user response", async () => {
        const response = await client.get("/users/1");
        const result = validator.validate(userSchema, response.data);
        expect(result.valid).toBe(true);
    });
    test("validates POST payload", async () => {
        const payload = { email: "qa@yourorg.com", password: "super-secret" };
        const response = await client.post("/sessions", payload);
        expect(response.status).toBe(201);
        expect(response.data.token).toBeDefined();
    });
});
//# sourceMappingURL=apiTestTemplate.spec.js.map