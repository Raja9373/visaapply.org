import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data_db', 'immigration_hub.db');
const db = new Database(DB_PATH);

function exportData() {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as any[];
  const data: any = {};
  
  for (const table of tables) {
    data[table.name] = db.prepare(`SELECT * FROM ${table.name}`).all();
  }
  
  fs.writeFileSync('migration_export.json', JSON.stringify(data, null, 2));
  console.log('Data exported to migration_export.json');
}

exportData();
