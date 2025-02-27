import { 
  PullRequest, InsertPullRequest,
  CodeAnalysis, InsertCodeAnalysis,
  Settings, InsertSettings
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private prs: Map<number, PullRequest>;
  private analyses: Map<number, CodeAnalysis>;
  private settings: Settings | undefined;
  private currentPrId: number;
  private currentAnalysisId: number;

  constructor() {
    this.prs = new Map();
    this.analyses = new Map();
    this.currentPrId = 1;
    this.currentAnalysisId = 1;
  }

  async getPullRequest(id: number): Promise<PullRequest | undefined> {
    return this.prs.get(id);
  }

  async getPullRequests(): Promise<PullRequest[]> {
    return Array.from(this.prs.values());
  }

  async createPullRequest(pr: InsertPullRequest): Promise<PullRequest> {
    const id = this.currentPrId++;
    const newPr = { ...pr, id };
    this.prs.set(id, newPr);
    return newPr;
  }

  async updatePullRequest(id: number, pr: Partial<PullRequest>): Promise<PullRequest> {
    const existing = await this.getPullRequest(id);
    if (!existing) throw new Error('PR not found');
    
    const updated = { ...existing, ...pr };
    this.prs.set(id, updated);
    return updated;
  }

  async getCodeAnalysis(id: number): Promise<CodeAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getAnalysisForPR(prId: number): Promise<CodeAnalysis | undefined> {
    return Array.from(this.analyses.values()).find(a => a.prId === prId);
  }

  async createCodeAnalysis(analysis: InsertCodeAnalysis): Promise<CodeAnalysis> {
    const id = this.currentAnalysisId++;
    const newAnalysis = { ...analysis, id };
    this.analyses.set(id, newAnalysis);
    return newAnalysis;
  }

  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async createSettings(settings: InsertSettings): Promise<Settings> {
    const newSettings = { ...settings, id: 1 };
    this.settings = newSettings;
    return newSettings;
  }

  async updateSettings(update: Partial<Settings>): Promise<Settings> {
    if (!this.settings) throw new Error('Settings not initialized');
    this.settings = { ...this.settings, ...update };
    return this.settings;
  }
}

export const storage = new MemStorage();
