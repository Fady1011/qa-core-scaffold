export type QaEnvProfile = "demo" | "dev" | "stage" | "qa" | "prod";
export declare function loadEnv(profile?: QaEnvProfile | string): NodeJS.ProcessEnv;
export declare function requireEnvKeys(keys: string[], profile?: QaEnvProfile | string): void;
export interface QaEnvConfig {
    profile: string;
    web: {
        baseUrl: string;
        browser: string;
    };
    api: {
        baseUrl: string;
        token?: string;
    };
    mobile: {
        host: string;
        port: number;
        deviceName: string;
        platformVersion: string;
    };
    db: {
        type: string;
        host: string;
        port: number;
        name: string;
        user: string;
        pass: string;
    };
}
interface QaEnvOptions {
    requireKeys?: boolean;
}
export declare function getQaEnvConfig(profile?: QaEnvProfile | string, options?: QaEnvOptions): QaEnvConfig;
export declare function resetEnvCache(): void;
export {};
