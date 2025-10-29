import pino from "pino";
export declare const logger: pino.Logger<never, boolean>;
export declare function createScopedLogger(scope: string): pino.Logger<never, boolean>;
