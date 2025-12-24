import dotenv from 'dotenv';
import path from 'path';

// Ensure we load the .env from the project root even if cwd differs
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export function get_env(key: string, defaultValue: any = ""): any {
    const val = process.env[key];
    const out = val ? val : defaultValue;
    if (typeof defaultValue === 'number') {
        const num = Number(out);
        return Number.isNaN(num) ? defaultValue : num;
    }
    return out;
}
