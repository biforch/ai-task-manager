const sqlite3 = require("sqlite3").verbose();

const dbPath = process.env.DATABASE_PATH || "./tasks.db";

const db = new sqlite3.Database(dbPath);

db.run("PRAGMA foreign_keys = ON");

module.exports = db;
