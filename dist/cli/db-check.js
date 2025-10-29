import { Command } from "commander";
import { DBClient } from "../db/dbClient";
import { getQaEnvConfig } from "../utils/env";
import { logger } from "../utils/logger";
export function buildDbCheckCommand() {
    const command = new Command("db:check");
    return command
        .description("Verify database connectivity using configured environment variables")
        .option("-t, --type <type>", "Database type override (mysql|postgres|mssql)")
        .option("-h, --host <host>", "Database host override")
        .action(async (options) => {
        const env = getQaEnvConfig();
        const resolvedType = (options.type ?? env.db.type);
        const client = new DBClient({
            type: resolvedType,
            host: options.host ?? env.db.host
        });
        try {
            await client.connect();
            const healthy = await client.healthCheck();
            if (healthy) {
                logger.info("Database connectivity verified ?");
            }
            else {
                logger.error("Database health check failed");
                process.exitCode = 1;
            }
        }
        catch (error) {
            logger.error({ error }, "Database connection failed");
            process.exitCode = 1;
        }
        finally {
            await client.disconnect().catch(() => undefined);
        }
    });
}
if (process.argv[1]?.includes("db-check")) {
    buildDbCheckCommand().parseAsync(process.argv);
}
//# sourceMappingURL=db-check.js.map