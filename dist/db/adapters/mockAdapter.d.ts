import type { DatabaseAdapter, DatabaseConfig, QueryParams, QueryResult } from "../types/dbTypes";
export declare class MockAdapter implements DatabaseAdapter {
    private readonly config;
    constructor(config?: Partial<DatabaseConfig>);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    query<T>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
    healthCheck(): Promise<boolean>;
}
