import path from "path";
import { getQaEnvConfig } from "../utils/env";
const env = getQaEnvConfig();
export const config = {
    specs: [path.resolve(__dirname, "../../tests/mobile/**/*.test.ts")],
    maxInstances: 1,
    logLevel: "info",
    bail: 0,
    baseUrl: env.web.baseUrl,
    waitforTimeout: 10000,
    framework: "mocha",
    reporters: [
        [
            "allure",
            {
                outputDir: "allure-results",
                disableWebdriverStepsReporting: true,
                disableWebdriverScreenshotsReporting: false
            }
        ]
    ],
    services: [
        [
            "appium",
            {
                command: "appium",
                args: {
                    address: env.mobile.host,
                    port: env.mobile.port
                }
            }
        ]
    ],
    capabilities: [
        {
            platformName: "Android",
            "appium:deviceName": env.mobile.deviceName,
            "appium:platformVersion": env.mobile.platformVersion,
            "appium:automationName": "UiAutomator2",
            "appium:app": process.env.MOBILE_APP_PATH,
            "appium:newCommandTimeout": 240
        }
    ]
};
export default config;
//# sourceMappingURL=appium.config.js.map