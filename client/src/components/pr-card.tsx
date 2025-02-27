import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeAnalysis, PullRequest } from "@shared/schema";
import { format } from "date-fns";

interface PRCardProps {
  pr: PullRequest;
  analysis?: CodeAnalysis;
}

export function PRCard({ pr, analysis }: PRCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{pr.title}</h3>
            <p className="text-sm text-muted-foreground">{pr.repository}</p>
          </div>
          <Badge variant={pr.status === 'open' ? 'default' : 'secondary'}>
            {pr.status}
          </Badge>
        </div>
      </CardHeader>
      
      {analysis && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Quality Score</span>
                <span className="text-sm">{analysis.score}/100</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary"
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm font-medium">Security</p>
                <p className="text-2xl font-bold">{analysis.securityIssues.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Performance</p>
                <p className="text-2xl font-bold">{analysis.performanceIssues.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Maintainability</p>
                <p className="text-2xl font-bold">{analysis.maintainabilityIssues.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex items-center justify-between w-full">
          <span>By {pr.author}</span>
          <time>{format(new Date(pr.createdAt), 'MMM d, yyyy')}</time>
        </div>
      </CardFooter>
    </Card>
  );
}
