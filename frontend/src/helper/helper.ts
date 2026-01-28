
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
            const result = Object.fromEntries(
                Object.entries(value).filter(([key]) => !keys.includes(key as K))
            ) as Omit<T, K>;

            return make_schema<Omit<T, K>>(result);
        },

        pick<K extends keyof T>(keys: readonly K[]) {
            const result = {} as Pick<T, K>;

            for (const key of keys) {
                if (key in value) {
                    result[key] = value[key];
                }
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

