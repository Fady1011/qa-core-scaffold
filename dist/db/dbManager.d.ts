import { DBClient } from "./dbClient";
import type { QueryParams, QueryResult } from "./types/dbTypes";
export declare class DBManager {
    private readonly client;
    constructor(client?: DBClient);
    withConnection<T>(callback: (client: DBClient) => Promise<T>): Promise<T>;
    runQuery<T>(sql: string, params?: QueryParams): Promise<QueryResult<T>>;
    healthCheck(): Promise<boolean>;
}
