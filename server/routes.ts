import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GitHubClient } from "./lib/github";
import { analyzePRDiff, generatePRComment } from "./lib/openai";
import { insertPullRequestSchema, insertCodeAnalysisSchema, insertSettingsSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Settings endpoints
  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings || {});
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const data = insertSettingsSchema.parse(req.body);
      const settings = await storage.createSettings(data);
      res.json(settings);
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ error: e.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // PR endpoints
  app.get("/api/pull-requests", async (req, res) => {
    const prs = await storage.getPullRequests();
    res.json(prs);
  });

  app.get("/api/pull-requests/:id", async (req, res) => {
    const pr = await storage.getPullRequest(parseInt(req.params.id));
    if (!pr) {
      res.status(404).json({ error: "PR not found" });
      return;
    }
    res.json(pr);
  });

  app.get("/api/pull-requests/:id/analysis", async (req, res) => {
    const analysis = await storage.getAnalysisForPR(parseInt(req.params.id));
    if (!analysis) {
      res.status(404).json({ error: "Analysis not found" });
      return;
    }
    res.json(analysis);
  });

  // GitHub webhook
  app.post("/api/webhook", async (req, res) => {
    const settings = await storage.getSettings();
    if (!settings) {
      res.status(500).json({ error: "Settings not configured" });
      return;
    }

    const signature = req.headers["x-hub-signature-256"];
    const github = new GitHubClient(settings.githubToken, settings.webhookSecret);

    if (!github.verifyWebhookSignature(JSON.stringify(req.body), signature as string)) {
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const event = req.headers["x-github-event"];
    if (event === "pull_request") {
      const { pull_request: pr, repository } = req.body;
      
      try {
        // Create PR record
        const pullRequest = await storage.createPullRequest({
          githubId: pr.id,
          title: pr.title,
          description: pr.body || "",
          author: pr.user.login,
          repository: repository.full_name,
          status: pr.state,
          createdAt: new Date(pr.created_at),
          updatedAt: new Date(pr.updated_at)
        });

        // Get diff and analyze
        const diff = await github.getPullRequestDiff(
          repository.owner.login,
          repository.name,
          pr.number
        );

        const analysis = await analyzePRDiff(diff);
        
        // Store analysis
        const codeAnalysis = await storage.createCodeAnalysis({
          prId: pullRequest.id,
          ...analysis,
          createdAt: new Date()
        });

        // Post comment
        const comment = generatePRComment(analysis);
        const commentId = await github.createPRComment(
          repository.owner.login,
          repository.name,
          pr.number,
          comment
        );

        // Update analysis with comment ID
        await storage.updatePullRequest(pullRequest.id, {
          ...pullRequest,
          aiCommentId: commentId
        });

        res.json({ success: true });
      } catch (e) {
        console.error("Error processing webhook:", e);
        res.status(500).json({ error: "Failed to process webhook" });
      }
    } else {
      res.json({ success: true }); // Acknowledge but ignore other events
    }
  });

  return httpServer;
}
