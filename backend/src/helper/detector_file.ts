import { fileTypeFromBuffer } from "file-type";
import JSZip from "jszip";

export type RiskLevel = "SAFE" | "WARNING" | "DANGEROUS";

export type RiskReport = {
    level: RiskLevel;
    detected?: { ext?: string; mime?: string };
    kind?: string;
    reasons: string[];
    details?: Record<string, any>;
};

function startsWith(buf: Buffer, bytes: number[], offset = 0) {
    if (buf.length < offset + bytes.length) return false;
    for (let i = 0; i < bytes.length; i++) if (buf[offset + i] !== bytes[i]) return false;
    return true;
}

function hasNullBytes(buf: Buffer, scanLen = 4096) {
    const len = Math.min(buf.length, scanLen);
    for (let i = 0; i < len; i++) if (buf[i] === 0x00) return true;
    return false;
}

function isProbablyText(buf: Buffer) {
    return !hasNullBytes(buf, 4096);
}

function headUtf8(buf: Buffer, max = 2048) {
    return buf.toString("utf8", 0, Math.min(buf.length, max));
}

function riskMax(a: RiskLevel, b: RiskLevel): RiskLevel {
    const order: Record<RiskLevel, number> = { SAFE: 0, WARNING: 1, DANGEROUS: 2 };
    return order[a] >= order[b] ? a : b;
}

function detectNativeExecutable(buf: Buffer): { kind: string; reason: string } | null {
    if (startsWith(buf, [0x4d, 0x5a])) return { kind: "pe", reason: "Windows PE executable detected (MZ header)" };
    if (startsWith(buf, [0x7f, 0x45, 0x4c, 0x46])) return { kind: "elf", reason: "Linux ELF executable detected" };

    const machO = [
        [0xfe, 0xed, 0xfa, 0xce],
        [0xfe, 0xed, 0xfa, 0xcf],
        [0xcf, 0xfa, 0xed, 0xfe],
        [0xce, 0xfa, 0xed, 0xfe],
        [0xca, 0xfe, 0xba, 0xbe],
    ];
    if (machO.some((sig) => startsWith(buf, sig))) return { kind: "macho", reason: "macOS Mach-O executable detected" };
    return null;
}

async function inspectZip(buf: Buffer) {
    const zip = await JSZip.loadAsync(buf, { checkCRC32: false });

    const names = Object.keys(zip.files).map((n) => n.replace(/\\/g, "/"));
    const lower = names.map((n) => n.toLowerCase());

    const has = (p: string) => lower.includes(p.toLowerCase());
    const anyEnds = (ext: string) => lower.some((n) => n.endsWith(ext));
    const anyMatch = (re: RegExp) => lower.some((n) => re.test(n));

    const isApk = has("androidmanifest.xml") || anyMatch(/^classes\d*\.dex$/i);
    const isJar = has("meta-inf/manifest.mf") && anyEnds(".class");
    const isDocx = anyMatch(/^word\/document\.xml$/i);
    const isXlsx = anyMatch(/^xl\/workbook\.xml$/i);
    const isPptx = anyMatch(/^ppt\/presentation\.xml$/i);

    const containsNativeExe =
        anyEnds(".exe") || anyEnds(".dll") || anyEnds(".sys") || anyEnds(".so") || anyEnds(".dylib") || anyEnds(".app/");

    const containsScripts =
        anyEnds(".js") || anyEnds(".py") || anyEnds(".sh") || anyEnds(".bat") || anyEnds(".ps1") || anyEnds(".vbs");

    return {
        names,
        kind: isApk ? "apk" : isJar ? "jar" : isDocx ? "docx" : isXlsx ? "xlsx" : isPptx ? "pptx" : "zip",
        flags: { containsNativeExe, containsScripts, isApk, isJar, isDocx, isXlsx, isPptx },
    };
}

// Script heuristics (because scripts have no magic bytes)
function detectScriptHeuristics(buf: Buffer): { kind: string; reason: string } | null {
    if (!isProbablyText(buf)) return null;
    const text = headUtf8(buf, 2048);
    const t = text.trimStart();
    if (t.startsWith("#!")) {
        if (t.includes("python")) return { kind: "script-python", reason: "Shebang indicates Python script" };
        if (t.includes("node") || t.includes("nodejs")) return { kind: "script-node", reason: "Shebang indicates Node.js script" };
        if (t.includes("bash") || t.includes("sh")) return { kind: "script-shell", reason: "Shebang indicates shell script" };
        return { kind: "script", reason: "Shebang indicates executable script" };
    }

    const jsHints = /\b(require\(|module\.exports|export\s+default|import\s+.+from\s+)/.test(text);
    const pyHints = /\b(def\s+\w+\(|import\s+\w+|from\s+\w+\s+import)\b/.test(text);

    if (jsHints) return { kind: "text-js", reason: "Looks like JavaScript source (heuristic)" };
    if (pyHints) return { kind: "text-py", reason: "Looks like Python source (heuristic)" };
    return null;
}

/**
 * Main API: analyze any uploaded buffer and return SAFE/WARNING/DANGEROUS + reasons.
 */
export async function analyzeFileRisk(buffer: Buffer): Promise<RiskReport> {
    const reasons: string[] = [];
    let level: RiskLevel = "SAFE";
    let kind: string | undefined;
    let details: Record<string, any> = {};

    const ft = await fileTypeFromBuffer(buffer).catch(() => undefined);
    if (ft) details.fileType = ft;

    const native = detectNativeExecutable(buffer);
    if (native) {
        kind = native.kind;
        reasons.push(native.reason);
        level = "DANGEROUS";
        return { level, kind, detected: ft ? { ext: ft.ext, mime: ft.mime } : undefined, reasons, details };
    }

    const isZip =
        startsWith(buffer, [0x50, 0x4b, 0x03, 0x04]) ||
        startsWith(buffer, [0x50, 0x4b, 0x05, 0x06]) ||
        startsWith(buffer, [0x50, 0x4b, 0x07, 0x08]) ||
        ft?.ext === "zip";

    if (isZip) {
        level = riskMax(level, "WARNING");
        reasons.push("ZIP container detected (can hide payloads). Inspect contents.");
        try {
            const zipInfo = await inspectZip(buffer);
            kind = zipInfo.kind;
            details.zip = { kind: zipInfo.kind, flags: zipInfo.flags, sampleEntries: zipInfo.names.slice(0, 30) };

            if (zipInfo.flags.containsNativeExe) {
                level = "DANGEROUS";
                reasons.push("ZIP contains native executable-like files (.exe/.dll/.so/.dylib etc.)");
            } else if (zipInfo.flags.containsScripts) {
                level = riskMax(level, "WARNING");
                reasons.push("ZIP contains script files (.js/.py/.sh/.bat/.ps1 etc.)");
            }

            if (zipInfo.flags.isApk) {
                level = riskMax(level, "WARNING");
                reasons.push("Looks like APK (Android app package). Treat as untrusted executable container.");
            }
            if (zipInfo.flags.isJar) {
                level = riskMax(level, "WARNING");
                reasons.push("Looks like JAR (Java archive). Can execute code.");
            }
            if (zipInfo.flags.isDocx || zipInfo.flags.isXlsx || zipInfo.flags.isPptx) {
                level = riskMax(level, "WARNING");
                reasons.push("Looks like an Office document (DOCX/XLSX/PPTX). Can carry malicious content/macros in some cases.");
            }
        } catch (e) {
            details.zipError = String(e);
            level = riskMax(level, "WARNING");
            reasons.push("Failed to inspect ZIP contents (corrupt/encrypted/unsupported). Treat as suspicious.");
        }
    }

    const isPdf = startsWith(buffer, [0x25, 0x50, 0x44, 0x46]) || ft?.ext === "pdf";
    if (isPdf) {
        kind = kind ?? "pdf";
        level = riskMax(level, "WARNING");
        reasons.push("PDF detected. PDFs can contain scripts/actions; scan before opening.");
    }

    const script = detectScriptHeuristics(buffer);
    if (script) {
        kind = kind ?? script.kind;
        level = riskMax(level, "WARNING");
        reasons.push(script.reason);
    }

    if (reasons.length === 0) {
        reasons.push("No known dangerous signature detected (not a guarantee).");
    }
    return { level, kind, detected: ft ? { ext: ft.ext, mime: ft.mime } : undefined, reasons, details };
}
