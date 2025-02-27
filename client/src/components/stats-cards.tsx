import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PullRequest, CodeAnalysis } from "@shared/schema";
import { GitPullRequest, ShieldCheck, Zap, FileCode } from "lucide-react";

interface StatsCardsProps {
  prs: PullRequest[];
  analyses: CodeAnalysis[];
}

export function StatsCards({ prs, analyses }: StatsCardsProps) {
  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length)
    : 0;

  const totalIssues = analyses.reduce((sum, a) => 
    sum + a.securityIssues.length + 
    a.performanceIssues.length + 
    a.maintainabilityIssues.length, 0
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total PRs</CardTitle>
          <GitPullRequest className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{prs.length}</div>
          <p className="text-xs text-muted-foreground">
            {prs.filter(pr => pr.status === 'open').length} open
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Quality Score</CardTitle>
          <FileCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgScore}/100</div>
          <p className="text-xs text-muted-foreground">
            From {analyses.length} analyses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Security Score</CardTitle>
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {analyses.length > 0 ? Math.round(
              analyses.filter(a => a.securityIssues.length === 0).length / 
              analyses.length * 100
            ) : 0}%
          </div>
          <p className="text-xs text-muted-foreground">
            PRs with no security issues
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalIssues}</div>
          <p className="text-xs text-muted-foreground">
            Across all analyses
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
