import type { DatabaseAdapter, DatabaseConfig, QueryParams, QueryResult } from "../types/dbTypes";
export declare class MsSqlAdapter implements DatabaseAdapter {
    private readonly config;
    private pool;
    constructor(config: DatabaseConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(statement: string, params?: QueryParams): Promise<QueryResult<T>>;
    healthCheck(): Promise<boolean>;
}
