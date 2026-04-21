import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldAlert, Scale, Search } from "lucide-react";
import { DashboardSummary } from "@workspace/api-client-react";

export function DashboardStats({ data }: { data: DashboardSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-card/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif">{data.total_cases}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Registered in system
          </p>
        </CardContent>
      </Card>
      
      <Card className="border-border/60 bg-card/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">FIRs Drafted</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif text-primary">{data.firs_generated}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Ready for filing
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Evidence Collected</CardTitle>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif text-accent">{data.evidence_collected}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.evidence_pending} pending collection
          </p>
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Case Strength</CardTitle>
          <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-serif text-green-600">
            {Math.round(data.avg_strength)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across analyzed cases
          </p>
        </CardContent>
      </Card>
    </div>
  );
}