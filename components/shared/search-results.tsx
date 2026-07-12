import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, Boxes, AlertTriangle } from "lucide-react";

export interface AssetResult {
  id: string;
  name: string;
  assetCode: string;
  status: string;
  condition: string;
  category: { name: string } | null;
  location: { name: string } | null;
}

export interface IssueResult {
  id: string;
  issueNumber: string;
  title: string;
  priority: string;
  status: string;
  asset: { name: string } | null;
}

interface SearchResultsProps {
  query: string;
  assets: AssetResult[];
  issues: IssueResult[];
}

export function SearchResults({ query, assets, issues }: SearchResultsProps) {
  const hasResults = assets.length > 0 || issues.length > 0;

  if (!hasResults) {
    return (
      <EmptyState
        icon={Search}
        title="No results found"
        description={
          query
            ? `No results matching "${query}"`
            : "Enter a search term to find assets and issues"
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {assets.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Boxes className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Assets ({assets.length})
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => (
              <Link key={asset.id} href={`/assets/${asset.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{asset.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground font-mono text-xs">
                      {asset.assetCode}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{asset.status}</Badge>
                      <Badge variant="outline">{asset.condition}</Badge>
                    </div>
                    {asset.category && (
                      <p className="text-muted-foreground text-xs">
                        {asset.category.name}
                      </p>
                    )}
                    {asset.location && (
                      <p className="text-muted-foreground text-xs">
                        {asset.location.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {issues.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              Issues ({issues.length})
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {issues.map((issue) => (
              <Link key={issue.id} href={`/issues/${issue.id}`}>
                <Card className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-base">{issue.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-muted-foreground font-mono text-xs">
                      {issue.issueNumber}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{issue.priority}</Badge>
                      <Badge variant="outline">{issue.status}</Badge>
                    </div>
                    {issue.asset && (
                      <p className="text-muted-foreground text-xs">
                        Asset: {issue.asset.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
