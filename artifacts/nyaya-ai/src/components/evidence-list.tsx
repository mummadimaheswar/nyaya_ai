import { useState } from "react";
import { EvidenceItem, Case, useUpdateEvidenceItem, getGetCaseQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FileText, Camera, Users, Package, HeartPulse, HelpCircle } from "lucide-react";
import { toast } from "sonner";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  document: <FileText className="h-4 w-4" />,
  digital: <Camera className="h-4 w-4" />,
  witness: <Users className="h-4 w-4" />,
  physical: <Package className="h-4 w-4" />,
  medical: <HeartPulse className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  important: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  optional: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
};

export function EvidenceList({ 
  items, 
  caseId 
}: { 
  items: EvidenceItem[]; 
  caseId: string;
}) {
  const queryClient = useQueryClient();
  const updateEvidence = useUpdateEvidenceItem<
    Error,
    { previousCase: Case | undefined }
  >({
    mutation: {
      onMutate: async (variables) => {
        const queryKey = getGetCaseQueryKey(caseId);
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey });
        // Snapshot the previous value
        const previousCase = queryClient.getQueryData<Case>(queryKey);
        // Optimistically update to the new value
        queryClient.setQueryData<Case>(queryKey, (old) => {
          if (!old) return old;
          return {
            ...old,
            evidence: old.evidence?.map((item) =>
              item.id === variables.data.evidence_id
                ? { ...item, collected: variables.data.collected }
                : item
            ),
          };
        });
        return { previousCase };
      },
      onError: (_err, _variables, context) => {
        if (context?.previousCase) {
          queryClient.setQueryData(getGetCaseQueryKey(caseId), context.previousCase);
        }
        toast.error("Failed to update evidence status");
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
      },
    },
  });

  const handleToggle = (id: string, collected: boolean) => {
    updateEvidence.mutate({ id: caseId, data: { evidence_id: id, collected } });
  };

  const critical = items.filter(i => i.priority === "critical");
  const important = items.filter(i => i.priority === "important");
  const optional = items.filter(i => i.priority === "optional");

  const Section = ({ title, data }: { title: string, data: EvidenceItem[] }) => {
    if (data.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h4>
        <div className="space-y-2">
          {data.map((item) => (
            <div 
              key={item.id} 
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                item.collected 
                  ? "bg-muted/30 border-transparent opacity-60" 
                  : "bg-card border-border hover:border-primary/30 hover:shadow-sm"
              }`}
            >
              <Checkbox 
                id={`evidence-${item.id}`} 
                checked={item.collected}
                onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <label 
                  htmlFor={`evidence-${item.id}`}
                  className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                    item.collected ? "line-through text-muted-foreground" : "text-foreground"
                  }`}
                >
                  {item.description}
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    {TYPE_ICONS[item.type] || TYPE_ICONS.other}
                    <span className="capitalize">{item.type}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase border-none px-1.5 py-0 h-4 ${PRIORITY_COLORS[item.priority]}`}>
                    {item.priority}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <Section title="Critical Evidence" data={critical} />
      <Section title="Important Evidence" data={important} />
      <Section title="Optional / Corroborating" data={optional} />
    </div>
  );
}