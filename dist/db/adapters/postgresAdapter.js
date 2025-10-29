import { Pool } from "pg";
export class PostgresAdapter {
    config;
    pool;
    constructor(config) {
        this.config = config;
        this.pool = new Pool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            max: 10
        });
    }
    async connect() {
        const client = await this.pool.connect();
        client.release();
    }
    async disconnect() {
        await this.pool.end();
    }
    async query(sql, params = []) {
        const values = Array.isArray(params) ? params : Object.values(params);
        const result = await this.pool.query(sql, values);
        return { rows: result.rows };
    }
    async healthCheck() {
        try {
            await this.pool.query("SELECT 1");
            return true;
        }
        catch (error) {
            console.error("Postgres health check failed", error);
            return false;
        }
    }
}
//# sourceMappingURL=postgresAdapter.js.map