#!/usr/bin/env node
import { Command } from "commander";
import { buildCreateProjectCommand } from "./create-project";
import { buildValidateCommand } from "./validate-structure";
import { buildQaLintCommand } from "./qa-lint";
import { buildDbCheckCommand } from "./db-check";
import { buildGeneratePageObjectCommand } from "./generate-page-object";

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
