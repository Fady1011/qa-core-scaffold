import { getQaEnvConfig } from "../../utils/env.js";

export function iosCapabilities() {
  const env = getQaEnvConfig();
  return {
    platformName: "iOS",
    "appium:deviceName": env.mobile.deviceName,
    "appium:platformVersion": env.mobile.platformVersion,
    "appium:automationName": "XCUITest",
    "appium:app": process.env.MOBILE_APP_PATH,
    "appium:newCommandTimeout": 240
  } as const;
}
