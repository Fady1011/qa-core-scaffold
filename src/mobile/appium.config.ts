import type { Options } from "@wdio/types";
import path from "path";
import { fileURLToPath } from "url";
import { getQaEnvConfig } from "../utils/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = getQaEnvConfig();

export const config: Options.Testrunner = {
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
