import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Use provided Neon connection string or fall back to environment variable
const connectionString = "postgresql://neondb_owner:npg_FewYiln8NdA7@ep-crimson-thunder-a5f34fur-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Database connection string must be available",
  );
}

// Configure pool with reasonable defaults
export const pool = new Pool({ 
  connectionString,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Add event handlers for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Closing pool...');
  pool.end().then(() => {
    console.log('Pool has ended');
    process.exit(0);
  });
});

// Test the connection
pool.connect()
  .then(client => {
    console.log('Successfully connected to database');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to the database', err);
    process.exit(-1);
  });

export const db = drizzle({ client: pool, schema });

// Helper function to check database health
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}