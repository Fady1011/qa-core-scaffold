import { AxiosRequestConfig, AxiosResponse } from "axios";
export declare class ApiClient {
    private readonly client;
    private readonly log;
    constructor(config?: AxiosRequestConfig);
    setAuthToken(token: string): void;
    get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = unknown, R = unknown>(url: string, data?: T, config?: AxiosRequestConfig): Promise<AxiosResponse<R>>;
    put<T = unknown, R = unknown>(url: string, data?: T, config?: AxiosRequestConfig): Promise<AxiosResponse<R>>;
    delete<R = unknown>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<R>>;
}
