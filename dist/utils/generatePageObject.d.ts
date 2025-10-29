import type { LevelWithSilent } from "pino";
export interface GeneratePageObjectOptions {
    url: string;
    className?: string;
    scope?: string;
    rendered?: boolean;
    storageState?: string;
    waitFor?: string;
    maxElements?: number;
    dedupe?: boolean;
    outfile?: string;
    outputDir?: string;
    logLevel?: LevelWithSilent;
    cwd?: string;
}
export interface GeneratePageObjectResult {
    className: string;
    outfile: string;
    elementsGenerated: number;
}
export interface GeneratorConfig {
    defaults?: Partial<GeneratePageObjectOptions>;
}
export interface GeneratePageObjectCliOptions extends Partial<GeneratePageObjectOptions> {
    config?: string;
}
export declare function runGeneratePageObjectFromCli(options: GeneratePageObjectCliOptions): Promise<GeneratePageObjectResult>;
export declare function generatePageObject(options: GeneratePageObjectOptions): Promise<GeneratePageObjectResult>;
