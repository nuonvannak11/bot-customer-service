export const REQUEST_TIMEOUT_MS = 15_000; // 15 seconds
export const REQUEST_TIMEOUT_BOT_CLOSE_OPEN_MS = 20_000; // 20 seconds
export const PHONE_REGEX = /^(?:\+?[1-9]\d{7,14}|0\d{8,14})$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const GOOGLE_TOKEN_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
export const EXPIRE_TOKEN_TIME = 7 * 24 * 60 * 60; // 7 days in seconds
export const LIMIT_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const SAFE_TEXT = /^[A-Za-z0-9@#$%^&*!._\-]+$/;
export const SAFE_USER_NAME = /^[A-Za-z0-9@#$%^&*!._\-\s]+$/;
export const hashKeyRegex = /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/;
export const DAY_MS = 1000 * 60 * 60 * 24;
export const default_extensions_img = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/svg+xml"
];
export const dangerousKeys = new Set([
    "__proto__", "constructor", "prototype",
    "$gt", "$gte", "$lt", "$lte", "$ne", "$in", "$nin",
    "$regex", "$where", "$expr", "$function", "$accumulator",
    "$merge", "$out", "$project", "$lookup", "$group",
    "$set", "$unset", "$push", "$pop"
]);

