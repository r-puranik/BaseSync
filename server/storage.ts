import { 
  PullRequest, InsertPullRequest,
  CodeAnalysis, InsertCodeAnalysis,
  Settings, InsertSettings,
  pullRequests,
  codeAnalysis,
  settings
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Pull Requests
  getPullRequest(id: number): Promise<PullRequest | undefined>;
  getPullRequests(): Promise<PullRequest[]>;
  createPullRequest(pr: InsertPullRequest): Promise<PullRequest>;
  updatePullRequest(id: number, pr: Partial<PullRequest>): Promise<PullRequest>;

  // Code Analysis
  getCodeAnalysis(id: number): Promise<CodeAnalysis | undefined>;
  getAnalysisForPR(prId: number): Promise<CodeAnalysis | undefined>;
  createCodeAnalysis(analysis: InsertCodeAnalysis): Promise<CodeAnalysis>;

  // Settings
  getSettings(): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getPullRequest(id: number): Promise<PullRequest | undefined> {
    const [pr] = await db
      .select()
      .from(pullRequests)
      .where(eq(pullRequests.id, id));
    return pr;
  }

  async getPullRequests(): Promise<PullRequest[]> {
    return db.select().from(pullRequests);
  }

  async createPullRequest(pr: InsertPullRequest): Promise<PullRequest> {
    const [created] = await db
      .insert(pullRequests)
      .values(pr)
      .returning();
    return created;
  }

  async updatePullRequest(id: number, pr: Partial<PullRequest>): Promise<PullRequest> {
    const [updated] = await db
      .update(pullRequests)
      .set(pr)
      .where(eq(pullRequests.id, id))
      .returning();

    if (!updated) {
      throw new Error('PR not found');
    }

    return updated;
  }

  async getCodeAnalysis(id: number): Promise<CodeAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(codeAnalysis)
      .where(eq(codeAnalysis.id, id));
    return analysis;
  }

  async getAnalysisForPR(prId: number): Promise<CodeAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(codeAnalysis)
      .where(eq(codeAnalysis.prId, prId));
    return analysis;
  }

  async createCodeAnalysis(analysis: InsertCodeAnalysis): Promise<CodeAnalysis> {
    const [created] = await db
      .insert(codeAnalysis)
      .values([analysis]) 
      .returning();
    return created;
  }

  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings);
    return setting;
  }

  async createSettings(setting: InsertSettings): Promise<Settings> {
    const [created] = await db
      .insert(settings)
      .values(setting)
      .returning();
    return created;
  }

  async updateSettings(update: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    if (!current) {
      throw new Error('Settings not initialized');
    }

    const [updated] = await db
      .update(settings)
      .set(update)
      .where(eq(settings.id, current.id))
      .returning();

    return updated;
  }
}

export const storage = new DatabaseStorage();