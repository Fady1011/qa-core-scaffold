import fs from "fs";
import { mkdir, cp, writeFile } from "fs/promises";
import path from "path";
import { logger } from "./logger";

export async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true });
}

export async function copyTemplateDirectory(templatePath: string, destinationPath: string) {
  const source = path.resolve(templatePath);
  const target = path.resolve(destinationPath);

  logger.info({ source, target }, "Copying template directory");
  await ensureDir(target);
  await cp(source, target, { recursive: true });
}

export async function writeFileSafely(filePath: string, contents: string) {
  const targetDir = path.dirname(filePath);
  if (!fs.existsSync(targetDir)) {
    await ensureDir(targetDir);
  }

  await writeFile(filePath, contents, "utf-8");
  logger.debug({ filePath }, "Wrote file");
}

export function pathExists(targetPath: string) {
  return fs.existsSync(targetPath);
}
