import "reflect-metadata";
type DecoratorTarget = object;
export declare function Tag(...tags: string[]): (target: DecoratorTarget, propertyKey?: string | symbol) => void;
export declare function getTags(target: DecoratorTarget, propertyKey?: string | symbol): string[];
export {};
