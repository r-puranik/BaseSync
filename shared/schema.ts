import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pullRequests = pgTable("pull_requests", {
  id: serial("id").primaryKey(),
  githubId: integer("github_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  author: text("author").notNull(),
  repository: text("repository").notNull(),
  status: text("status").notNull(), // open, closed, merged
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const codeAnalysis = pgTable("code_analysis", {
  id: serial("id").primaryKey(),
  prId: integer("pr_id").notNull(),
  score: integer("score").notNull(),
  securityIssues: jsonb("security_issues").$type<Record<string, any>[]>().notNull(),
  performanceIssues: jsonb("performance_issues").$type<Record<string, any>[]>().notNull(),
  maintainabilityIssues: jsonb("maintainability_issues").$type<Record<string, any>[]>().notNull(),
  summary: text("summary").notNull(),
  aiCommentId: integer("ai_comment_id").notNull().default(0),
  createdAt: timestamp("created_at").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  githubToken: text("github_token").notNull(),
  webhookSecret: text("webhook_secret").notNull(),
  repositories: text("repositories").array().notNull().default([]),
});

export const insertPullRequestSchema = createInsertSchema(pullRequests).omit({
  id: true,
});

export const insertCodeAnalysisSchema = createInsertSchema(codeAnalysis).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type PullRequest = typeof pullRequests.$inferSelect;
export type InsertPullRequest = z.infer<typeof insertPullRequestSchema>;

export type CodeAnalysis = typeof codeAnalysis.$inferSelect;
export type InsertCodeAnalysis = z.infer<typeof insertCodeAnalysisSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;