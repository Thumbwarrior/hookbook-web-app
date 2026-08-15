/**
 * SQLite connection and Hookbook schema.
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../../data/hookbook.db");
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      lyrics_text TEXT NOT NULL DEFAULT '',
      genre TEXT,
      mood TEXT,
      bpm_min INTEGER,
      bpm_max INTEGER,
      rhyme_scheme TEXT,
      status TEXT NOT NULL DEFAULT 'idea'
        CHECK (status IN ('idea', 'in progress', 'finished')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idea_id INTEGER NOT NULL,
      tag_name TEXT NOT NULL,
      FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
      UNIQUE(idea_id, tag_name)
    );
    CREATE INDEX IF NOT EXISTS idx_ideas_user ON ideas(user_id);
    CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
    CREATE INDEX IF NOT EXISTS idx_ideas_genre ON ideas(genre);
    CREATE INDEX IF NOT EXISTS idx_tags_idea ON tags(idea_id);
    CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(tag_name);
  `);
}

initSchema();
export default db;
