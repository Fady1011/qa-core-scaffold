import { getQaEnvConfig } from "../utils/env";
import { MySqlAdapter } from "./adapters/mysqlAdapter";
import { MsSqlAdapter } from "./adapters/mssqlAdapter";
import { PostgresAdapter } from "./adapters/postgresAdapter";
function createAdapter(config) {
    switch (config.type) {
        case "mysql":
            return new MySqlAdapter(config);
        case "postgres":
            return new PostgresAdapter(config);
        case "mssql":
            return new MsSqlAdapter(config);
        default:
            throw new Error(`Unsupported database type: ${config.type}`);
    }
}
export class DBClient {
    adapter;
    constructor(config) {
        const envConfig = getQaEnvConfig();
        const mergedConfig = {
            type: (config?.type ?? envConfig.db.type),
            host: config?.host ?? envConfig.db.host,
            port: config?.port ?? envConfig.db.port,
            user: config?.user ?? envConfig.db.user,
            password: config?.password ?? envConfig.db.pass,
            database: config?.database ?? envConfig.db.name
        };
        this.adapter = createAdapter(mergedConfig);
    }
    async connect() {
        await this.adapter.connect();
    }
    async disconnect() {
        await this.adapter.disconnect();
    }
    async query(sql, params = []) {
        return this.adapter.query(sql, params);
    }
    async healthCheck() {
        return this.adapter.healthCheck();
    }
}
//# sourceMappingURL=dbClient.js.map