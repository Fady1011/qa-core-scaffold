import { ErrorObject, JSONSchemaType, type AnySchema, ValidateFunction } from "ajv";
export interface ValidationResult<T> {
    valid: boolean;
    errors?: ErrorObject<string, Record<string, unknown>, unknown>[] | null;
    data: T;
}
export declare class SchemaValidator {
    private readonly ajv;
    constructor();
    compile<T>(schema: JSONSchemaType<T> | AnySchema): ValidateFunction<T>;
    validate<T>(schema: JSONSchemaType<T> | AnySchema, data: unknown): ValidationResult<T>;
    assertValid<T>(schema: JSONSchemaType<T> | AnySchema, data: unknown): T;
}
