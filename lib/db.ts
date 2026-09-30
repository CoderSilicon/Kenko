import "server-only";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import Database from "better-sqlite3";


const DB_PATH =
  process.env.KENKO_DB_PATH ?? join(process.cwd(), "data", "kenko.db");

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let db: Database.Database | null = null;

function open(): Database.Database {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");
  conn.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key         TEXT PRIMARY KEY,
      value       TEXT NOT NULL,
      expires_at  INTEGER NOT NULL,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cache_expires_at ON cache (expires_at);
  `);
  return conn;
}

export function getDb(): Database.Database | null {
  if (db) return db;
  try {
    db = open();
    return db;
  } catch (error) {
    console.warn("Cache unavailable, continuing without it:", error);
    return null;
  }
}

export function cacheGet(key: string): string | null {
  const conn = getDb();
  if (!conn) return null;
  try {
    const row = conn
      .prepare(
        "SELECT value, expires_at FROM cache WHERE key = ? AND expires_at > ?",
      )
      .get(key, Date.now()) as { value: string } | undefined;
    return row?.value ?? null;
  } catch (error) {
    console.warn("Cache read failed:", error);
    return null;
  }
}

export function cacheSet(
  key: string,
  value: string,
  ttlMs = CACHE_TTL_MS,
): void {
  const conn = getDb();
  if (!conn) return;
  const now = Date.now();
  try {
    conn
      .prepare(
        `INSERT INTO cache (key, value, expires_at, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           value = excluded.value,
           expires_at = excluded.expires_at,
           created_at = excluded.created_at`,
      )
      .run(key, value, now + ttlMs, now);
  } catch (error) {
    console.warn("Cache write failed:", error);
  }
}

export function cacheClear(): number {
  const conn = getDb();
  if (!conn) return 0;
  conn.prepare("DELETE FROM cache WHERE expires_at <= ?").run(Date.now());
  return conn.prepare("DELETE FROM cache").run().changes;
}
