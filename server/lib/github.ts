import { createHmac } from "crypto";

export class GitHubClient {
  private token: string;
  private webhookSecret: string;

  constructor(token: string, webhookSecret: string) {
    this.token = token;
    this.webhookSecret = webhookSecret;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hmac = createHmac("sha256", this.webhookSecret);
    const digest = `sha256=${hmac.update(payload).digest("hex")}`;
    return signature === digest;
  }

  async getPullRequestDiff(owner: string, repo: string, pullNumber: number): Promise<string> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`,
      {
        headers: {
          Accept: "application/vnd.github.v3.diff",
          Authorization: `Bearer ${this.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get PR diff: ${response.statusText}`);
    }

    return response.text();
  }

  async createPRComment(owner: string, repo: string, pullNumber: number, body: string): Promise<number> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ body }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create PR comment: ${response.statusText}`);
    }

    const data = await response.json();
    return data.id;
  }

  async updatePRComment(owner: string, repo: string, commentId: number, body: string): Promise<void> {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues/comments/${commentId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/vnd.github.v3+json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({ body }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update PR comment: ${response.statusText}`);
    }
  }
}
