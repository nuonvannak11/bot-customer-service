export function empty(data: any): boolean {
    if (data == null) return true;
    const type = typeof data;
    switch (type) {
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

export function strval(data: any): string {
    if (empty(data)) return "";
    if (typeof data === "string") return data;
    return data.toString();
}

export function strlower(data: any): string {
    return strval(data).toLowerCase();
}

export function capitalize(word: string) {
    if (!word) return "";
    return word[0].toUpperCase() + word.slice(1);
}

export function get_milli_second() {
    return Date.now();
}