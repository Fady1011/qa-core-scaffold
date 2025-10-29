import sql from "mssql";
const SUPPORTED_VALUE_TYPES = ["string", "number", "boolean"];
function coerceSqlValue(value) {
    if (value instanceof Date || value instanceof Buffer) {
        return value;
    }
    if (value === null || value === undefined) {
        return value;
    }
    if (SUPPORTED_VALUE_TYPES.includes(typeof value)) {
        return value;
    }
    return value;
}
export class MsSqlAdapter {
    config;
    pool;
    constructor(config) {
        this.config = config;
        this.pool = new sql.ConnectionPool({
            user: config.user,
            password: config.password,
            server: config.host,
            database: config.database,
            port: config.port,
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        });
    }
    async connect() {
        await this.pool.connect();
    }
    async disconnect() {
        await this.pool.close();
    }
    async query(statement, params = []) {
        const request = this.pool.request();
        if (Array.isArray(params)) {
            params.forEach((value, index) => {
                request.input(`p${index}`, coerceSqlValue(value));
            });
        }
        else {
            Object.entries(params).forEach(([key, value]) => {
                request.input(key, coerceSqlValue(value));
            });
        }
        const result = await request.query(statement);
        return { rows: (result.recordset ?? []) };
    }
    async healthCheck() {
        try {
            await this.pool.request().query("SELECT 1");
            return true;
        }
        catch (error) {
            console.error("MSSQL health check failed", error);
            return false;
        }
    }
}
//# sourceMappingURL=mssqlAdapter.js.map