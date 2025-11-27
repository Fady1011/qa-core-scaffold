import { Command } from "commander";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import allure from "allure-commandline";
import { logger } from "./logger.js";

export interface ReportOptions {
  resultsDir?: string;
  reportDir?: string;
  clean?: boolean;
}

export async function generateAllureReport(options: ReportOptions = {}): Promise<void> {
  const resultsDir = path.resolve(options.resultsDir ?? "allure-results");
  const reportDir = path.resolve(options.reportDir ?? "allure-report");

  if (!existsSync(resultsDir)) {
    throw new Error(`Allure results directory not found at ${resultsDir}`);
  }

  if (!existsSync(reportDir)) {
    mkdirSync(reportDir, { recursive: true });
  }

  logger.info({ resultsDir, reportDir }, "Generating Allure report");

  await new Promise<void>((resolve, reject) => {
    const generation = allure(["generate", resultsDir, "--clean", "-o", reportDir]);
    generation.on("exit", (code: number) => {
      if (code === 0) {
        logger.info({ reportDir }, "Allure report generated successfully");
        resolve();
      } else {
        reject(new Error(`Allure CLI exited with code ${code}`));
      }
    });
  });
}

function runCli(): void {
  const program = new Command();
  program
    .name("qa report")
    .description("Generate Allure HTML report")
    .option("-r, --results <path>", "Path to Allure results", "allure-results")
    .option("-o, --output <path>", "Path to Allure report output", "allure-report")
    .action(async (cmdOptions) => {
      try {
        await generateAllureReport({
          resultsDir: cmdOptions.results,
          reportDir: cmdOptions.output
        });
      } catch (error) {
        logger.error(error, "Failed to generate Allure report");
        process.exitCode = 1;
      }
    });

  program.parse(process.argv);
}

if (process.argv[1]?.includes("reporter")) {
  runCli();
}
