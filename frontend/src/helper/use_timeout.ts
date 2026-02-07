export function withTimeout<T>(promise: Promise<T>, seconds: number): Promise<T> {
    const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 1;
    const timeoutMs = safeSeconds * 1_000;

    return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`Timeout after ${safeSeconds} second(s)`));
        }, timeoutMs);

        promise
            .then((value) => {
                clearTimeout(timeoutId);
                resolve(value);
            })
            .catch((error: unknown) => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}
