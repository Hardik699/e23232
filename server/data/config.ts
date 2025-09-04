import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "config.json");

export type GoogleSheetsConfig = {
  itSpreadsheetId?: string;
  hrSpreadsheetId?: string;
};

export type AppConfig = {
  googleSheets?: GoogleSheetsConfig;
};

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FILE_PATH);
  } catch {
    const initial: AppConfig = { googleSheets: {} };
    await fs.writeFile(FILE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readConfig(): Promise<AppConfig> {
  await ensureFile();
  const raw = await fs.readFile(FILE_PATH, "utf8");
  try {
    return JSON.parse(raw) as AppConfig;
  } catch {
    return { googleSheets: {} };
  }
}

async function writeConfig(cfg: AppConfig): Promise<void> {
  await ensureFile();
  await fs.writeFile(FILE_PATH, JSON.stringify(cfg, null, 2), "utf8");
}

export async function getGoogleSheetsConfig(): Promise<GoogleSheetsConfig> {
  const cfg = await readConfig();
  return cfg.googleSheets || {};
}

export async function setGoogleSheetsConfig(update: GoogleSheetsConfig) {
  const current = await readConfig();
  const next: AppConfig = {
    ...current,
    googleSheets: { ...current.googleSheets, ...update },
  };
  await writeConfig(next);
}

export function extractSpreadsheetId(input: string): string {
  // Accept raw ID or full URL like https://docs.google.com/spreadsheets/d/<id>/edit
  const trimmed = (input || "").trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return trimmed;
}

export function getServiceAccountEmail(): string | null {
  try {
    const raw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
    if (!raw) return null;
    const json = JSON.parse(raw);
    return json.client_email || null;
  } catch {
    return null;
  }
}
