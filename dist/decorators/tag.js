import "reflect-metadata";
const TAG_METADATA_KEY = Symbol("qa:tags");
export function Tag(...tags) {
    return function (target, propertyKey) {
        if (propertyKey) {
            const existing = Reflect.getMetadata(TAG_METADATA_KEY, target, propertyKey) ?? [];
            Reflect.defineMetadata(TAG_METADATA_KEY, [...existing, ...tags], target, propertyKey);
            return;
        }
        const existing = Reflect.getMetadata(TAG_METADATA_KEY, target) ?? [];
        Reflect.defineMetadata(TAG_METADATA_KEY, [...existing, ...tags], target);
    };
}
export function getTags(target, propertyKey) {
    if (propertyKey) {
        return Reflect.getMetadata(TAG_METADATA_KEY, target, propertyKey) ?? [];
    }
    return Reflect.getMetadata(TAG_METADATA_KEY, target) ?? [];
}
//# sourceMappingURL=tag.js.map