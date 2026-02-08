export const REQUEST_TIMEOUT_MS = 15_000; // 15 seconds
export const REQUEST_TIMEOUT_BOT_CLOSE_OPEN_MS = 20_000; // 20 seconds
export const PHONE_REGEX = /^(?:\+?[1-9]\d{7,14}|0\d{8,14})$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const GOOGLE_TOKEN_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
export const EXPIRE_TOKEN_TIME = 7 * 24 * 60 * 60; // 7 days in seconds
export const LIMIT_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const SAFE_TEXT = /^[A-Za-z0-9@#$%^&*!._\-]+$/;