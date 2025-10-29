import fs from "fs";
import path from "path";
import { Command } from "commander";
const REQUIRED_ITEMS = [
    "src",
    "src/web",
    "src/api",
    "src/mobile",
    "src/db",
    "src/utils",
    "src/governance",
    "docs",
    "tests",
    "package.json",
    "tsconfig.json"
];
export function buildValidateCommand() {
    const command = new Command("validate");
    return command
        .description("Validate project structure against qa-core governance")
        .option("-r, --root <path>", "Root path to validate", ".")
        .action((options) => {
        const { root } = options;
        const missing = [];
        for (const item of REQUIRED_ITEMS) {
            const target = path.resolve(process.cwd(), root, item);
            if (!fs.existsSync(target)) {
                missing.push(item);
            }
        }
        if (missing.length) {
            console.error("Missing required project items:\n" + missing.map((m) => ` - ${m}`).join("\n"));
            process.exitCode = 1;
            return;
        }
        console.log("Project structure looks good ?");
    });
}
if (process.argv[1]?.includes("validate-structure")) {
    buildValidateCommand().parseAsync(process.argv);
}
//# sourceMappingURL=validate-structure.js.map