import { Link } from "wouter";
import { format } from "date-fns";
import { Case } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FileText, Scale } from "lucide-react";

export function CaseCard({ data }: { data: Case }) {
  const isDraft = data.status === "draft";
  const statusColor = isDraft 
    ? "bg-muted text-muted-foreground"
    : data.status === "analyzed"
    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";

  return (
    <Link href={`/cases/${data.id}`}>
      <Card className="h-full hover-elevate transition-all duration-200 border-border/60 hover:border-primary/30 group cursor-pointer overflow-hidden flex flex-col">
        <CardHeader className="pb-3 flex-none">
          <div className="flex justify-between items-start mb-2 gap-2">
            <Badge variant="outline" className={`font-medium ${statusColor} border-none`}>
              {data.status.replace("_", " ").toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {format(new Date(data.created_at), "MMM d, yyyy")}
            </span>
          </div>
          <CardTitle className="font-serif text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {data.title || "Untitled Case"}
          </CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
            Complainant: {data.complainant_name}
          </p>
        </CardHeader>
        <CardContent className="pb-4 flex-1">
          <p className="text-sm text-foreground/80 line-clamp-3">
            {data.summary || data.incident_text}
          </p>
        </CardContent>
        <CardFooter className="pt-0 pb-4 border-t border-border/30 mt-auto bg-muted/10 flex justify-between items-center px-6">
          <div className="flex gap-3 text-muted-foreground">
            <div className="flex items-center text-xs gap-1">
              <Scale className="h-3.5 w-3.5" />
              <span>{data.ipc_sections?.length || 0} Sections</span>
            </div>
            <div className="flex items-center text-xs gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>{data.evidence?.length || 0} Evidence</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
        </CardFooter>
      </Card>
    </Link>
  );
}