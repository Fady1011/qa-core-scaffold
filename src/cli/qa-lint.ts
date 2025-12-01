import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Command } from "commander";

interface GovernanceRules {
  requiredFolders: string[];
  requiredScripts: string[];
  commitPrefixes: string[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadRules(): GovernanceRules {
  const rulesPath = path.resolve(__dirname, "../governance/common.rules.json");
  const raw = fs.readFileSync(rulesPath, "utf-8");
  return JSON.parse(raw) as GovernanceRules;
}

function checkFolders(root: string, folders: string[]): string[] {
  return folders.filter((folder) => !fs.existsSync(path.resolve(root, folder)));
}

function checkScripts(root: string, scripts: string[]): string[] {
  const pkgPath = path.resolve(root, "package.json");
  if (!fs.existsSync(pkgPath)) {
    return scripts;
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  return scripts.filter((script) => !pkg.scripts || !pkg.scripts[script]);
}

export function buildQaLintCommand() {
  const command = new Command("lint");

  return command
    .description("Run governance checks against the current project")
    .option("-r, --root <path>", "Project root", ".")
    .action((options: { root: string }) => {
      const root = path.resolve(process.cwd(), options.root);
      const rules = loadRules();

      const folderIssues = checkFolders(root, rules.requiredFolders);
      const scriptIssues = checkScripts(root, rules.requiredScripts);

      if (folderIssues.length || scriptIssues.length) {
        console.error("Governance checks failed:");
        if (folderIssues.length) {
          console.error("Missing folders:");
          folderIssues.forEach((folder) => console.error(` - ${folder}`));
        }
        if (scriptIssues.length) {
          console.error("Missing package scripts:");
          scriptIssues.forEach((script) => console.error(` - ${script}`));
        }
        process.exitCode = 1;
        return;
      }

      console.log("Governance checks passed ?");
    });
}

if (process.argv[1]?.includes("qa-lint")) {
  buildQaLintCommand().parseAsync(process.argv);
}
