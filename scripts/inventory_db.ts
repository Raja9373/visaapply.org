import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data_db', 'immigration_hub.db');
const db = new Database(DB_PATH);

async function runInventory() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
  const inventory: any = {};

  for (const table of tables) {
    const name = table.name;
    const count = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get() as any;
    const schema = db.prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${name}'`).get() as any;
    inventory[name] = {
      count: count.count,
      schema: schema.sql
    };
  }

  const integrity = db.pragma('integrity_check');
  const fkCheck = db.pragma('foreign_key_check');

  const stats = fs.statSync(DB_PATH);
  
  const fileBuffer = fs.readFileSync(DB_PATH);
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  console.log(JSON.stringify({
    inventory,
    integrity,
    fkCheck,
    sizeBytes: stats.size,
    sha256: hash
  }, null, 2));
}

runInventory().catch(console.error);
