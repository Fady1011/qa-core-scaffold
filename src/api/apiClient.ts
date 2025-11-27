import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { getQaEnvConfig } from "../utils/env.js";
import { createScopedLogger } from "../utils/logger.js";

export class ApiClient {
  private readonly client: AxiosInstance;
  private readonly log = createScopedLogger("ApiClient");

  constructor(config: AxiosRequestConfig = {}) {
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

    this.client.interceptors.response.use(
      (response) => {
        this.log.info({ status: response.status, url: response.config.url }, "API response");
        return response;
      },
      (error) => {
        this.log.error({ error: error.message }, "API error");
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T = unknown, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R>> {
    return this.client.post<R>(url, data, config);
  }

  async put<T = unknown, R = unknown>(
    url: string,
    data?: T,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<R>> {
    return this.client.put<R>(url, data, config);
  }

  async delete<R = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<R>> {
    return this.client.delete<R>(url, config);
  }
}
