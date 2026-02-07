export function empty(data: unknown): boolean {
    if (data === undefined || data === null || data === "") return true;
    switch (typeof data) {
        case "string":
            return data.trim().length === 0;
        case "boolean":
            return false;
        case "number":
            return Number.isNaN(data);
        case "bigint":
            return data === BigInt(0);
        case "function":
            return false;
        case "object":
            if (Array.isArray(data)) return data.length === 0;
            if (data instanceof Map || data instanceof Set) return data.size === 0;
            if (data instanceof Date) return isNaN(data.getTime());
            if (data instanceof RegExp) return false;
            return Object.keys(data).length === 0;
        default:
            return false;
    }
}


export function strval(data: unknown): string {
    if (!data) return "";
    if (typeof data === "string") return data;
    return data.toString();
}

export function strlower(data: unknown): string {
    if (!data) return "";
    return strval(data).toLowerCase();
}

export function capitalize(word: string) {
    if (!word) return "";
    return word[0].toUpperCase() + word.slice(1);
}

export function get_milli_second() {
    return Date.now();
}


export function normalizeText(text: string | null | undefined): string {
    if (!text || typeof text !== "string") {
        return "";
    }
    const MAX_LENGTH = 2000;
    const safeText = text.length > MAX_LENGTH ? text.substring(0, MAX_LENGTH) : text;
    return safeText
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}