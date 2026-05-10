import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DATA_DIR = join(__dirname, "../../data");
const DB_PATH = join(DATA_DIR, "flickbolt.db");
const SCHEMA_PATH = join(__dirname, "../../workers/migrations/0001_init.sql");

mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = readFileSync(SCHEMA_PATH, "utf8");
const statements = schema
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s + ";")
  .map((s) => s.replace(/CREATE TABLE /g, "CREATE TABLE IF NOT EXISTS "))
  .map((s) => s.replace(/CREATE INDEX /g, "CREATE INDEX IF NOT EXISTS "))
  .map((s) => s.replace(/CREATE UNIQUE INDEX /g, "CREATE UNIQUE INDEX IF NOT EXISTS "));

for (const stmt of statements) {
  try {
    db.exec(stmt);
  } catch (e) {
    if (!e.message.includes("already exists")) throw e;
  }
}
