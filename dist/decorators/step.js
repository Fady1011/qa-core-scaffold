import { allure } from "allure-playwright";
import { logger } from "../utils/logger";
export function Step(name) {
    return function (_target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function stepWrapper(...args) {
            const stepName = name ?? `${String(propertyKey)}(${args.map((arg) => JSON.stringify(arg)).join(", ")})`;
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
//# sourceMappingURL=step.js.map