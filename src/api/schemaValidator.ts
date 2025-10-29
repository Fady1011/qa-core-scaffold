import Ajv, { ErrorObject, JSONSchemaType, type AnySchema, ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

export interface ValidationResult<T> {
  valid: boolean;
  errors?: ErrorObject<string, Record<string, unknown>, unknown>[] | null;
  data: T;
}

export class SchemaValidator {
  private readonly ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  compile<T>(schema: JSONSchemaType<T> | AnySchema): ValidateFunction<T> {
    return this.ajv.compile<T>(schema);
  }

  validate<T>(schema: JSONSchemaType<T> | AnySchema, data: unknown): ValidationResult<T> {
    const validate = this.compile(schema);
    const valid = validate(data);

    return {
      valid: Boolean(valid),
      errors: validate.errors,
      data: data as T
    };
  }

  assertValid<T>(schema: JSONSchemaType<T> | AnySchema, data: unknown): T {
    const result = this.validate(schema, data);
    if (!result.valid) {
      const message = this.ajv.errorsText(result.errors);
      throw new Error(`Schema validation failed: ${message}`);
    }

    return result.data;
  }
}
