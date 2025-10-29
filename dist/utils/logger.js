import pino from "pino";
const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";
const defaultOptions = {
    level: LOG_LEVEL,
    base: { service: "qa-core" },
    browser: {
        asObject: true
    }
};
export const logger = pino(defaultOptions);
export function createScopedLogger(scope) {
    return logger.child({ scope });
}
//# sourceMappingURL=logger.js.map