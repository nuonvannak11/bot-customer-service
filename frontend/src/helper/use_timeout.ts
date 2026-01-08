export function withTimeout<T>(promise: Promise<T>, minutes: number): Promise<T> {
    const timeoutMs = minutes * 60_000;
    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${minutes} minute(s)`)), timeoutMs)
    );
    return Promise.race([promise, timeoutPromise]);
}
