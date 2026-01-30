
export function make_schema<T extends object>(base: T) {
    const value = { ...base } as T;
    return {
        value,
        extend<E extends object>(extra: Readonly<E>) {
            return make_schema<T & E>({
                ...value,
                ...extra,
            });
        },

        omit<K extends keyof T>(keys: readonly K[]) {
            const keySet = new Set(keys);
            const result = {} as Omit<T, K>;
            for (const key of Object.keys(value)) {
                if (!keySet.has(key as K)) {
                    // @ts-ignore - We know this key exists and isn't omitted
                    result[key] = value[key];
                }
            }
            return make_schema(result);
        },

        pick<K extends keyof T>(keys: readonly K[]) {
            const result = {} as Pick<T, K>;
            for (const key of keys) {
                result[key] = value[key];
            }
            return make_schema(result);
        },

        merge<U extends object>(other: Readonly<U>) {
            return make_schema<T & U>({
                ...value,
                ...other,
            });
        },

        get(): Readonly<T> {
            return Object.freeze({ ...value });
        },
    };
}

