import { getQaEnvConfig } from "../../utils/env.js";

export function androidCapabilities() {
  const env = getQaEnvConfig();
  return {
    platformName: "Android",
    "appium:deviceName": env.mobile.deviceName,
    "appium:platformVersion": env.mobile.platformVersion,
    "appium:automationName": "UiAutomator2",
    "appium:app": process.env.MOBILE_APP_PATH,
    "appium:newCommandTimeout": 240
  } as const;
}
