const demoUsers = [
    { id: 1, first_name: "Ada", last_name: "Lovelace", email: "ada@example.test", role: "admin" },
    { id: 2, first_name: "Alan", last_name: "Turing", email: "alan@example.test", role: "user" }
];
export class MockAdapter {
    config;
    // The config is accepted for parity with other adapters but is not used functionally.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(config = {}) {
        this.config = config;
    }
    async connect() {
        return;
    }
    async disconnect() {
        return;
    }
    async query(sql, params = []) {
        const normalizedSql = sql.toLowerCase();
        const paramsArray = Array.isArray(params) ? params : Object.values(params);
        if (normalizedSql.includes("from users")) {
            const id = paramsArray[0];
            const user = id !== undefined
                ? demoUsers.find((u) => u.id === Number(id)) ?? demoUsers[0]
                : demoUsers[0];
            return { rows: [user] };
        }
        return { rows: [] };
    }
    async healthCheck() {
        return true;
    }
}
//# sourceMappingURL=mockAdapter.js.map