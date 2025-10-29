import Ajv from "ajv";
import addFormats from "ajv-formats";
export class SchemaValidator {
    ajv;
    constructor() {
        this.ajv = new Ajv({ allErrors: true, strict: false });
        addFormats(this.ajv);
    }
    compile(schema) {
        return this.ajv.compile(schema);
    }
    validate(schema, data) {
        const validate = this.compile(schema);
        const valid = validate(data);
        return {
            valid: Boolean(valid),
            errors: validate.errors,
            data: data
        };
    }
    assertValid(schema, data) {
        const result = this.validate(schema, data);
        if (!result.valid) {
            const message = this.ajv.errorsText(result.errors);
            throw new Error(`Schema validation failed: ${message}`);
        }
        return result.data;
    }
}
//# sourceMappingURL=schemaValidator.js.map