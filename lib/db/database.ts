import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath = path.join(process.cwd(), "data", "servers.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      host TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      server_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      ports TEXT NOT NULL,
      icon TEXT,
      image TEXT,
      color TEXT,
      protocol TEXT DEFAULT 'http',
      tags TEXT,
      healthcheck_url TEXT,
      healthcheck_expected_status INTEGER,
      FOREIGN KEY (server_id) REFERENCES servers(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_services_server_id ON services(server_id);
  `);

  // Migrate existing services table if needed
  try {
    const tableInfo = db.prepare("PRAGMA table_info(services)").all() as any[];
    const hasImage = tableInfo.some((col) => col.name === "image");
    const hasHealthcheckUrl = tableInfo.some((col) => col.name === "healthcheck_url");
    const hasHealthcheckStatus = tableInfo.some((col) => col.name === "healthcheck_expected_status");
    const hasHealthcheckEnabled = tableInfo.some((col) => col.name === "healthcheck_enabled");
    const hasPublicUrl = tableInfo.some((col) => col.name === "public_url");

    if (!hasImage) {
      db.exec("ALTER TABLE services ADD COLUMN image TEXT");
    }
    if (!hasHealthcheckUrl) {
      db.exec("ALTER TABLE services ADD COLUMN healthcheck_url TEXT");
    }
    if (!hasHealthcheckStatus) {
      db.exec("ALTER TABLE services ADD COLUMN healthcheck_expected_status INTEGER");
    }
    if (!hasHealthcheckEnabled) {
      db.exec("ALTER TABLE services ADD COLUMN healthcheck_enabled INTEGER DEFAULT 0");
    }
    if (!hasPublicUrl) {
      db.exec("ALTER TABLE services ADD COLUMN public_url TEXT");
    }
  } catch (error) {
    // Table might not exist yet, which is fine
  }

  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

