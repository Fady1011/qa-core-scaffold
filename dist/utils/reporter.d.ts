export interface ReportOptions {
    resultsDir?: string;
    reportDir?: string;
    clean?: boolean;
}
export declare function generateAllureReport(options?: ReportOptions): Promise<void>;
