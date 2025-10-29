import { DBClient } from "./dbClient";
export class DBManager {
    client;
    constructor(client) {
        this.client = client ?? new DBClient();
    }
    async withConnection(callback) {
        await this.client.connect();
        try {
            return await callback(this.client);
        }
        finally {
            await this.client.disconnect();
        }
    }
    async runQuery(sql, params = []) {
        return this.withConnection((client) => client.query(sql, params));
    }
    async healthCheck() {
        await this.client.connect();
        try {
            return await this.client.healthCheck();
        }
        finally {
            await this.client.disconnect();
        }
    }
}
//# sourceMappingURL=dbManager.js.map