export const MAX_TIMEOUT = 20000; // 20 seconds
export const PHONE_REGEX = /^(?:\+?[1-9]\d{7,14}|0\d{8,14})$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const GOOGLE_TOKEN_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
export const EXPIRE_TOKEN_TIME = 7 * 24 * 60 * 60; // 7 days in seconds
export const LIMIT_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const LIMIT_TELEGRAM_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_UAS = ["axios", "fetch", "node-fetch"];

export const gcmPayloadRegex = /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/;