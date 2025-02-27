import { useQuery } from "@tanstack/react-query";
import { PullRequest, CodeAnalysis } from "@shared/schema";
import { StatsCards } from "@/components/stats-cards";
import { PRCard } from "@/components/pr-card";

export default function Dashboard() {
  const { data: prs = [] } = useQuery<PullRequest[]>({
    queryKey: ["/api/pull-requests"]
  });

  const analysisQueries = useQuery<CodeAnalysis[]>({
    queryKey: ["/api/pull-requests/analysis"],
    enabled: prs.length > 0
  });

  const analyses = analysisQueries.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and analyze your pull requests
        </p>
      </div>

      <StatsCards prs={prs} analyses={analyses} />

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Pull Requests</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {prs.map(pr => (
            <PRCard 
              key={pr.id}
              pr={pr}
              analysis={analyses.find(a => a.prId === pr.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
