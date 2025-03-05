// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config(); // Ensure environment variables are loaded
console.log("🔍 OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Loaded ✅" : "MISSING ❌");
console.log("🔍 MISTRAL_API_KEY:", process.env.MISTRAL_API_KEY ? "Loaded ✅" : "MISSING ❌");
console.log("MISTRAL_API_KEY:", process.env.MISTRAL_API_KEY ? "✅ Loaded" : "❌ MISSING");
console.log("NODE_ENV:", process.env.NODE_ENV || "Not Set");

import "reflect-metadata";
import { createConnection, useContainer, ConnectionOptions } from "typeorm";
import { Container } from "typedi";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { DataSource } from "typeorm";
import path from 'path';
import './lib/openai';

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




useContainer(Container);

// Database connection options (replace with your actual details)
const dbOptions: ConnectionOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [path.join(__dirname, "/entities/*{.ts,.js}")],
  migrations: [path.join(__dirname, "/migrations/*{.ts,.js}")],
  synchronize: false, // Set to false in production!
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// async function runMigrations() {
//   const dataSource = new DataSource(dbOptions);
//   try {
//     await dataSource.initialize();
//     await dataSource.runMigrations();
//   } catch (error) {
//     console.error('Error initializing data source or running migrations:', error);
//     throw error;
//   } finally {
//     await dataSource.destroy();
//   }
// }

async function runMigrations() {
  let retries = 3;
  while (retries > 0) {
    try {
      await runMigrations();
      console.log("Migrations completed successfully");
      return; 
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log("Connection refused. Retrying in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        retries--;
      } else {
        console.error("Error running migrations:", error);
        return; // Fail on other errors
      }
    }
  }
  console.error("Failed to run migrations after multiple retries.");
}

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Run migrations before starting the server
  try {
    await runMigrations();
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    // Continue anyway, as the database might already be set up
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();