declare module "allure-commandline" {
  type AllureCommandLineResult = {
    on(event: "exit", handler: (code: number) => void): AllureCommandLineResult;
  };

  export default function allure(args: string[]): AllureCommandLineResult;
}
