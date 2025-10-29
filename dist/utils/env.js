import fs from "fs";
import path from "path";
import { config } from "dotenv";
const REQUIRED_COMMON_KEYS = [
    "BASE_URL",
    "API_BASE_URL",
    "APPIUM_HOST",
    "APPIUM_PORT",
    "DEVICE_NAME",
    "PLATFORM_VERSION",
    "DB_TYPE",
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASS"
];
let loadedProfile = null;
function resolveEnvFiles(profile) {
    return [`.env.${profile}.local`, `.env.${profile}`, `.env.local`, `.env`].map((candidate) => path.resolve(process.cwd(), candidate));
}
export function loadEnv(profile = process.env.QA_PROFILE ?? "dev") {
    if (loadedProfile === profile) {
        return process.env;
    }
    for (const envPath of resolveEnvFiles(profile)) {
        if (fs.existsSync(envPath)) {
            config({ path: envPath, override: true });
        }
    }
    loadedProfile = profile;
    return process.env;
}
export function requireEnvKeys(keys, profile) {
    loadEnv(profile);
    const missing = keys.filter((key) => !process.env[key] || process.env[key]?.trim() === "");
    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
}
export function getQaEnvConfig(profile) {
    const env = loadEnv(profile);
    requireEnvKeys(REQUIRED_COMMON_KEYS, profile);
    return {
        profile: (profile ?? env.QA_PROFILE ?? "dev").toString(),
        web: {
            baseUrl: env.BASE_URL ?? "",
            browser: env.BROWSER ?? "chromium"
        },
        api: {
            baseUrl: env.API_BASE_URL ?? "",
            token: env.API_TOKEN
        },
        mobile: {
            host: env.APPIUM_HOST ?? "localhost",
            port: Number(env.APPIUM_PORT ?? "4723"),
            deviceName: env.DEVICE_NAME ?? "",
            platformVersion: env.PLATFORM_VERSION ?? ""
        },
        db: {
            type: (env.DB_TYPE ?? "mysql").toLowerCase(),
            host: env.DB_HOST ?? "localhost",
            port: Number(env.DB_PORT ?? "3306"),
            name: env.DB_NAME ?? "",
            user: env.DB_USER ?? "",
            pass: env.DB_PASS ?? ""
        }
    };
}
export function resetEnvCache() {
    loadedProfile = null;
}
//# sourceMappingURL=env.js.map