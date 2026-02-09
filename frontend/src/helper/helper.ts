
import Swal from "sweetalert2";

export async function request_sweet_alert<T>(
    option: { title: string; text: string },
    tryFn: () => Promise<T>,
    catchFn?: (err: unknown) => void,
) {
    Swal.fire({
        title: option.title,
        text: option.text,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
    });

    try {
        const result = await tryFn();
        Swal.close();
        return result;
    } catch (err) {
        Swal.close();
        if (catchFn) {
            catchFn(err);
        }
    }
}

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
                    // @ts-expect-error - index access is safe here due to keyof filtering
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

