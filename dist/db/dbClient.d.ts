import type { DatabaseConfig, QueryParams, QueryResult } from "./types/dbTypes";
export declare class DBClient {
    private readonly adapter;
    constructor(config?: Partial<DatabaseConfig>);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
    healthCheck(): Promise<boolean>;
}
