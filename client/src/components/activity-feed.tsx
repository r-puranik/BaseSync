import { useQuery } from "@tanstack/react-query";
import { CodeAnalysis, PullRequest } from "@shared/schema";
import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TimelineItemProps {
  pr: PullRequest;
  analysis: CodeAnalysis;
}

function TimelineItem({ pr, analysis }: TimelineItemProps) {
  const totalIssues =
    analysis.securityIssues.length +
    analysis.performanceIssues.length +
    analysis.maintainabilityIssues.length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getIssueIcon = (type: string, count: number) => {
    const icons = {
      security: Shield,
      performance: Zap,
      maintainability: Wrench,
    };
    const Icon = icons[type as keyof typeof icons];
    const color =
      count > 0 ? "text-yellow-500" : "text-green-500";

    return (
      <div className="flex items-center gap-1">
        <Icon className={cn("h-4 w-4", color)} />
        <span className="text-sm">{count}</span>
      </div>
    );
  };

  return (
    <div className="mb-4 flex gap-4">
      <div
        className={cn(
          "mt-1 h-8 w-8 rounded-full flex items-center justify-center",
          totalIssues === 0
            ? "bg-green-100 text-green-600"
            : "bg-yellow-100 text-yellow-600"
        )}
      >
        {totalIssues === 0 ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
      </div>

      <div className="flex-1">
        <div className="mb-1">
          <span className="font-medium">{pr.title}</span>
          <span className="text-sm text-muted-foreground"> in {pr.repository}</span>
        </div>

        <div className="mb-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <time>{format(new Date(analysis.createdAt), "MMM d, yyyy 'at' h:mm a")}</time>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Quality Score</span>
            <span className={cn("font-bold", getScoreColor(analysis.score))}>
              {analysis.score}/100
            </span>
          </div>

          <div className="flex gap-6">
            {getIssueIcon("security", analysis.securityIssues.length)}
            {getIssueIcon("performance", analysis.performanceIssues.length)}
            {getIssueIcon("maintainability", analysis.maintainabilityIssues.length)}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ActivityFeed() {
  const { data: prs = [] } = useQuery<PullRequest[]>({
    queryKey: ["/api/pull-requests"],
  });

  const { data: analyses = [] } = useQuery<CodeAnalysis[]>({
    queryKey: ["/api/pull-requests/analysis"],
    enabled: prs.length > 0,
  });

  // Sort by most recent analysis
  const timelineItems = prs
    .map((pr) => ({
      pr,
      analysis: analyses.find((a) => a.prId === pr.id),
    }))
    .filter((item): item is { pr: PullRequest; analysis: CodeAnalysis } => !!item.analysis)
    .sort((a, b) => {
      return new Date(b.analysis.createdAt).getTime() - new Date(a.analysis.createdAt).getTime();
    });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {timelineItems.map(({ pr, analysis }) => (
            <TimelineItem key={pr.id} pr={pr} analysis={analysis} />
          ))}
          {timelineItems.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No activity yet
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}