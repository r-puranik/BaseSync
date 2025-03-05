CREATE TABLE "code_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"pr_id" integer NOT NULL,
	"score" integer NOT NULL,
	"security_issues" jsonb NOT NULL,
	"performance_issues" jsonb NOT NULL,
	"maintainability_issues" jsonb NOT NULL,
	"summary" text NOT NULL,
	"ai_comment_id" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pull_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"author" text NOT NULL,
	"repository" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"github_token" text NOT NULL,
	"webhook_secret" text NOT NULL,
	"repositories" text[] DEFAULT '{}' NOT NULL
);
