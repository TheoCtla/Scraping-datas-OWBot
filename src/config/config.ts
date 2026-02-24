import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "database.sqlite");
const db: Database.Database = new Database(dbPath, { verbose: console.log });

db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS hero (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_hero INTEGER NOT NULL,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        code TEXT,
        isActive INTEGER DEFAULT 1,
        FOREIGN KEY (id_hero) REFERENCES hero(id) ON DELETE CASCADE
    );
`);

const heroCount = db.prepare("SELECT COUNT(*) as count FROM hero").get() as {
	count: number;
};

export default db;
