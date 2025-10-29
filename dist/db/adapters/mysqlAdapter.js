import mysql from "mysql2/promise";
export class MySqlAdapter {
    config;
    pool;
    constructor(config) {
        this.config = config;
        this.pool = mysql.createPool({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password,
            database: config.database,
            waitForConnections: true,
            connectionLimit: 10
        });
    }
    async connect() {
        const connection = await this.pool.getConnection();
        connection.release();
    }
    async disconnect() {
        await this.pool.end();
    }
    async query(sql, params = []) {
        const valuesArray = Array.isArray(params) ? params : Object.values(params);
        const [rows] = await this.pool.query(sql, valuesArray);
        return { rows: rows };
    }
    async healthCheck() {
        try {
            await this.pool.query("SELECT 1");
            return true;
        }
        catch (error) {
            console.error("MySQL health check failed", error);
            return false;
        }
    }
}
//# sourceMappingURL=mysqlAdapter.js.map