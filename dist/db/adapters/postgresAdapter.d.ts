import type { DatabaseAdapter, DatabaseConfig, QueryParams, QueryResult } from "../types/dbTypes";
export declare class PostgresAdapter implements DatabaseAdapter {
    private readonly config;
    private pool;
    constructor(config: DatabaseConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
    healthCheck(): Promise<boolean>;
}
