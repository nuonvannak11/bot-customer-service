import fs from "fs";

const filePath = "./log.json";

type LogFile = {
  logs: any[];
};

export function readLogFile(): LogFile {
  try {
    if (!fs.existsSync(filePath)) {
      return { logs: [] };
    }

    const text = fs.readFileSync(filePath, "utf8").trim();
    if (!text) return { logs: [] };

    const data = JSON.parse(text);
    if (!Array.isArray(data.logs)) data.logs = [];

    return data;
  } catch (err) {
    console.error("Invalid log.json, resetting file");
    return { logs: [] };
  }
}

export function writeLogFile(data: LogFile) {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
}
