#!/usr/bin/env node
import { Command } from "commander";
import { buildCreateProjectCommand } from "./create-project.js";
import { buildValidateCommand } from "./validate-structure.js";
import { buildQaLintCommand } from "./qa-lint.js";
import { buildDbCheckCommand } from "./db-check.js";
import { buildGeneratePageObjectCommand } from "./generate-page-object.js";

const program = new Command();

program
  .name("qa")
  .description("QA automation scaffolding CLI")
  .addCommand(buildCreateProjectCommand())
  .addCommand(buildValidateCommand())
  .addCommand(buildQaLintCommand())
  .addCommand(buildDbCheckCommand())
  .addCommand(buildGeneratePageObjectCommand());

program.parseAsync(process.argv).catch((error) => {
  console.error(error);
  process.exit(1);
});
