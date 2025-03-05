
-- Create pull_requests table
CREATE TABLE IF NOT EXISTS "pull_requests" (
  "id" SERIAL PRIMARY KEY,
  "github_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "author" TEXT NOT NULL,
  "repository" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TIMESTAMP NOT NULL,
  "updated_at" TIMESTAMP NOT NULL
);

-- Create code_analysis table
CREATE TABLE IF NOT EXISTS "code_analysis" (
  "id" SERIAL PRIMARY KEY,
  "pr_id" INTEGER NOT NULL,
  "score" INTEGER NOT NULL,
  "security_issues" JSONB NOT NULL,
  "performance_issues" JSONB NOT NULL,
  "maintainability_issues" JSONB NOT NULL,
  "summary" TEXT NOT NULL,
  "ai_comment_id" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL
);

-- Create settings table
CREATE TABLE IF NOT EXISTS "settings" (
  "id" SERIAL PRIMARY KEY,
  "github_token" TEXT NOT NULL,
  "webhook_secret" TEXT NOT NULL,
  "repositories" TEXT[] NOT NULL DEFAULT '{}'
);
