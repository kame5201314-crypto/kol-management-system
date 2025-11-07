import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting database migrations...\n');

    // Read and execute SQL files in order
    const migrations = [
      '001_create_tables.sql',
      '002_seed_data.sql'
    ];

    for (const migration of migrations) {
      const filePath = path.join(__dirname, migration);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`📝 Running migration: ${migration}`);
      await client.query(sql);
      console.log(`✅ Completed: ${migration}\n`);
    }

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
