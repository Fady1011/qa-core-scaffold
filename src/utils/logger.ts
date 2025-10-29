import pino, { LoggerOptions } from "pino";

const LOG_LEVEL = process.env.LOG_LEVEL ?? "info";

const defaultOptions: LoggerOptions = {
  level: LOG_LEVEL,
  base: { service: "qa-core" },
  browser: {
    asObject: true
  }
};

export const logger = pino(defaultOptions);

export function createScopedLogger(scope: string) {
  return logger.child({ scope });
}
