import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CaseCard } from "@/components/case-card";
import { DashboardStats } from "@/components/dashboard-stats";
import { ShieldAlert, FileText, ArrowRight, Activity, BookOpen, Search, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  useGetDashboardSummary, 
  useGetRecentActivity, 
  useGetTopLaws, 
  useListCases 
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Home() {
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity();
  const { data: topLaws, isLoading: isLoadingTopLaws } = useGetTopLaws();
  const { data: cases, isLoading: isLoadingCases } = useListCases();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 border-b border-border/50 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
          <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20 border-accent/30 rounded-full px-3 py-1 mb-4">
            AI Legal Assistant for India
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-tight tracking-tight">
            Describe what happened.<br />
            <span className="text-primary">Know your rights.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Nyaya AI analyzes your incident, identifies applicable IPC sections, drafts an FIR, and gives you a clear path forward in plain language.
          </p>
          <div className="pt-6 flex justify-center gap-4">
            <Link href="/new">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-md">
                Start a New Case
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-6 bg-background">
              How it works
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-7xl space-y-12">
        {/* Dashboard Stats */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Overview
            </h2>
          </div>
          {isLoadingSummary ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[120px] rounded-xl" />)}
            </div>
          ) : summary ? (
            <DashboardStats data={summary} />
          ) : (
            <div className="bg-muted/30 p-8 rounded-xl text-center text-muted-foreground">
              No data available
            </div>
          )}
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content - Recent Cases */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Cases
              </h2>
              <Link href="/new">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoadingCases ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[200px] rounded-xl" />)}
              </div>
            ) : cases && cases.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {cases.slice(0, 4).map(c => (
                  <CaseCard key={c.id} data={c} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed bg-transparent shadow-none">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-serif font-medium mb-2">No cases yet</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Start by describing an incident. We'll analyze it, identify laws, and help draft an FIR.
                  </p>
                  <Link href="/new">
                    <Button>Create your first case</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Activity & Top Laws */}
          <div className="space-y-8">
            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Activity className="h-4 w-4 text-accent" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingActivity ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-2 w-2 rounded-full mt-2" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activity && activity.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border">
                    {activity.map((item, i) => (
                      <div key={i} className="relative flex items-start space-x-3">
                        <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                        <div className="min-w-0 flex-1 py-0.5 text-sm">
                          <span className="font-medium text-foreground">{item.case_title}</span>
                          <span className="text-muted-foreground mx-1">{item.action.toLowerCase()}</span>
                          <div className="mt-1 flex text-xs text-muted-foreground">
                            {format(new Date(item.at), "MMM d, h:mm a")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/60">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Top Referenced Laws
                </CardTitle>
                <CardDescription>Most frequent in your cases</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTopLaws ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : topLaws && topLaws.length > 0 ? (
                  <div className="space-y-3">
                    {topLaws.map((law, i) => (
                      <div key={i} className="flex justify-between items-center bg-background rounded-md p-3 border border-border/50 text-sm">
                        <div className="font-medium text-foreground">{law.section}</div>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {law.count} uses
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Not enough data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
// Add the missing Badge import at the top
import { Badge } from "@/components/ui/badge";