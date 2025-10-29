export declare function ensureDir(dirPath: string): Promise<void>;
export declare function copyTemplateDirectory(templatePath: string, destinationPath: string): Promise<void>;
export declare function writeFileSafely(filePath: string, contents: string): Promise<void>;
export declare function pathExists(targetPath: string): boolean;
