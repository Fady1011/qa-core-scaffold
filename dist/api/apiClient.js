import axios from "axios";
import { getQaEnvConfig } from "../utils/env";
import { createScopedLogger } from "../utils/logger";
export class ApiClient {
    client;
    log = createScopedLogger("ApiClient");
    constructor(config = {}) {
        const envConfig = getQaEnvConfig();
        this.client = axios.create({
            baseURL: envConfig.api.baseUrl,
            timeout: config.timeout ?? 30_000,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: envConfig.api.token ? `Bearer ${envConfig.api.token}` : undefined,
                ...config.headers
            },
            ...config
        });
        this.client.interceptors.request.use((request) => {
            this.log.info({ method: request.method, url: request.url }, "API request");
            return request;
        });
        this.client.interceptors.response.use((response) => {
            this.log.info({ status: response.status, url: response.config.url }, "API response");
            return response;
        }, (error) => {
            this.log.error({ error: error.message }, "API error");
            return Promise.reject(error);
        });
    }
    setAuthToken(token) {
        this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    async get(url, config) {
        return this.client.get(url, config);
    }
    async post(url, data, config) {
        return this.client.post(url, data, config);
    }
    async put(url, data, config) {
        return this.client.put(url, data, config);
    }
    async delete(url, config) {
        return this.client.delete(url, config);
    }
}
//# sourceMappingURL=apiClient.js.map