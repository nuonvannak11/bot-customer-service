import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { get_env } from "../utils/util";

export async function transcribe(filePath: string): Promise<string> {
    const openai = new OpenAI({ apiKey: get_env("OPENAI_API_KEY") });
    const stream = fs.createReadStream(filePath);
    const result: any = await openai.audio.transcriptions.create({
        file: stream,
        model: "whisper-1",
    });
    return result.text;
}

if (require.main === module) {
    (async () => {
        try {
            const sample = path.resolve(__dirname, '1.ogg');
            const text = await transcribe(sample);
            console.log(text);
        } catch (err: any) {
            console.error('Transcription error:', err.message || err);
            process.exitCode = 1;
        }
    })();
}
