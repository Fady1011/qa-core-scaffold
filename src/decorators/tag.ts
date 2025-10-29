import "reflect-metadata";

const TAG_METADATA_KEY = Symbol("qa:tags");

type DecoratorTarget = object;

export function Tag(...tags: string[]) {
  return function (target: DecoratorTarget, propertyKey?: string | symbol) {
    if (propertyKey) {
      const existing: string[] = Reflect.getMetadata(TAG_METADATA_KEY, target, propertyKey) ?? [];
      Reflect.defineMetadata(TAG_METADATA_KEY, [...existing, ...tags], target, propertyKey);
      return;
    }

    const existing: string[] = Reflect.getMetadata(TAG_METADATA_KEY, target) ?? [];
    Reflect.defineMetadata(TAG_METADATA_KEY, [...existing, ...tags], target);
  };
}

export function getTags(target: DecoratorTarget, propertyKey?: string | symbol): string[] {
  if (propertyKey) {
    return Reflect.getMetadata(TAG_METADATA_KEY, target, propertyKey) ?? [];
  }
  return Reflect.getMetadata(TAG_METADATA_KEY, target) ?? [];
}
