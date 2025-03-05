import { defineConfig } from "drizzle-kit";

// Use provided Neon connection string or fall back to environment variable
const connectionString = "postgresql://neondb_owner:npg_FewYiln8NdA7@ep-crimson-thunder-a5f34fur-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Database connection string must be available");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
