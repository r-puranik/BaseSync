
import fs from 'fs';
import path from 'path';
import { pool } from '../db';

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    
    // Get list of already applied migrations
    const { rows: appliedMigrations } = await pool.query('SELECT name FROM migrations');
    const appliedMigrationNames = appliedMigrations.map(m => m.name);
    
    // Read migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Important to apply migrations in order
    
    // Apply each migration that hasn't been applied yet
    for (const file of migrationFiles) {
      if (appliedMigrationNames.includes(file)) {
        console.log(`Migration ${file} already applied, skipping`);
        continue;
      }
      
      console.log(`Applying migration: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Start a transaction for each migration
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`Migration ${file} applied successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error applying migration ${file}:`, error);
        throw error;
      } finally {
        client.release();
      }
    }
    
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

export default runMigrations;
