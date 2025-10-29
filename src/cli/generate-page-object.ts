import { Command } from "commander";
import type { LevelWithSilent } from "pino";
import {
  runGeneratePageObjectFromCli,
  type GeneratePageObjectCliOptions
} from "../utils/generatePageObject";

function parseLogLevel(value: string): LevelWithSilent {
  const lowered = value.toLowerCase();
  if (["fatal", "error", "warn", "info", "debug", "trace", "silent"].includes(lowered)) {
    return lowered as LevelWithSilent;
  }
  throw new Error(`Unsupported log level: ${value}`);
}

export function buildGeneratePageObjectCommand() {
  const command = new Command("generate-page-object");

  return command
    .alias("generate-po")
    .description("Generate a Playwright page object from a live or static URL")
    .option("-u, --url <url>", "Target URL to inspect")
    .option("-c, --class-name <name>", "Class name for the generated page object")
    .option("-o, --outfile <path>", "Exact output file path for the generated page object")
    .option(
      "-d, --output-dir <path>",
      "Directory where page objects are saved when --outfile is omitted"
    )
    .option("-s, --scope <selector>", "CSS selector to limit DOM extraction scope")
    .option("-m, --max <count>", "Maximum number of elements to include", (value) =>
      Number.parseInt(value, 10)
    )
    .option("-r, --rendered", "Capture rendered DOM using Playwright")
    .option("--storage-state <path>", "Path to Playwright storage state for auth cookies")
    .option("--wait-for <selector>", "Selector to await before snapshotting rendered DOM")
    .option("--no-dedupe", "Disable element deduplication")
    .option("--config <path>", "Path to a generator config file (.genpo.json by default)")
    .option("--log-level <level>", "Pino log level (info | debug | silent)", parseLogLevel)
    .option("--cwd <path>", "Working directory for resolving relative paths")
    .action(async (cmdOptions: GeneratePageObjectCliOptions) => {
      try {
        const result = await runGeneratePageObjectFromCli(cmdOptions);
        console.log(
          `? Generated ${result.className} with ${result.elementsGenerated} elements ? ${result.outfile}`
        );
      } catch (error) {
        console.error("? Page object generation failed", error);
        process.exitCode = 1;
      }
    });
}
