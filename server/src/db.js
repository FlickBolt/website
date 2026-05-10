import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const DB_PATH = join(__dirname, "../../data/flickbolt.db");
const SCHEMA_PATH = join(__dirname, "../../workers/migrations/0001_init.sql");

import { mkdirSync } from "fs";
mkdirSync(join(__dirname, "../../data"), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema = readFileSync(SCHEMA_PATH, "utf8");
db.exec(schema);
