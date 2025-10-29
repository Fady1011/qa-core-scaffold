import fs from "fs";
import path from "path";
import { Command } from "commander";
import { copyTemplateDirectory, ensureDir, pathExists } from "../utils/fileHelper";
import { logger } from "../utils/logger";

const TEMPLATE_TYPES = ["web", "api", "mobile"] as const;
type TemplateType = (typeof TEMPLATE_TYPES)[number];

export function buildCreateProjectCommand() {
  const command = new Command("create-project");

  return command
    .description("Scaffold a new QA automation project from templates")
    .argument("<name>", "Name of the destination project directory")
    .option("-t, --type <type>", "Project type", "web")
    .option("-d, --directory <directory>", "Workspace directory", ".")
    .option("-f, --force", "Overwrite if directory exists", false)
    .action(
      async (name: string, options: { type: TemplateType; directory: string; force: boolean }) => {
        const { type, directory, force } = options;
        if (!TEMPLATE_TYPES.includes(type)) {
          throw new Error(`Unsupported template type: ${type}`);
        }

        const templateDir = path.resolve(__dirname, "../../templates", type);
        if (!fs.existsSync(templateDir)) {
          throw new Error(`Template directory not found for type ${type}`);
        }

        const destinationDir = path.resolve(process.cwd(), directory, name);
        if (pathExists(destinationDir) && !force) {
          throw new Error(
            `Destination directory ${destinationDir} already exists. Use --force to overwrite.`
          );
        }

        if (!pathExists(destinationDir)) {
          await ensureDir(destinationDir);
        }

        logger.info({ templateDir, destinationDir }, "Scaffolding project");
        await copyTemplateDirectory(templateDir, destinationDir);
        logger.info("Project scaffold complete");
      }
    );
}

if (process.argv[1]?.includes("create-project")) {
  buildCreateProjectCommand().parseAsync(process.argv);
}
