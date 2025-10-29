import { allure } from "allure-playwright";
import { logger } from "../utils/logger";

export function Step(name?: string) {
  return function (_target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = async function stepWrapper(...args: unknown[]) {
      const stepName =
        name ?? `${String(propertyKey)}(${args.map((arg) => JSON.stringify(arg)).join(", ")})`;

      logger.info({ step: stepName }, "Executing test step");

      const invoke = async () => originalMethod.apply(this, args);

      if (allure && typeof allure.step === "function") {
        return allure.step(stepName, invoke);
      }

      logger.warn("Allure instance not detected; executing step without reporting");
      return invoke();
    };

    return descriptor;
  };
}
