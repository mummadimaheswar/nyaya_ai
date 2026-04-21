import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { EvidenceList } from "@/components/evidence-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { 
  useGetCase, 
  useDeleteCase, 
  useGenerateFir, 
  useTranslateCase 
} from "@workspace/api-client-react";
import { 
  Scale, BookOpen, AlertOctagon, ShieldAlert, FileText, 
  Trash2, FileSignature, Languages, ArrowLeft, Loader2, Sparkles, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CaseDetail() {
  const [, params] = useRoute("/cases/:id");
  const id = params?.id || "";
  const [, setLocation] = useLocation();
  const [targetLang, setTargetLang] = useState<"en" | "hi" | "te">("en");
  
  const { data: caseData, isLoading, isError } = useGetCase(id, { 
    query: { enabled: !!id } 
  });
  
  const deleteMutation = useDeleteCase();
  const generateFirMutation = useGenerateFir();
  const translateMutation = useTranslateCase();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-8">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !caseData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <AlertOctagon className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold mb-2">Case not found</h2>
          <p className="text-muted-foreground mb-6">The case you are looking for does not exist or an error occurred.</p>
          <Button onClick={() => setLocation("/")}>Return to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("Case deleted successfully");
          setLocation("/");
        },
        onError: () => toast.error("Failed to delete case")
      }
    );
  };

  const handleGenerateFir = () => {
    generateFirMutation.mutate(
      { id },
      {
        onSuccess: () => toast.success("FIR drafted successfully"),
        onError: () => toast.error("Failed to generate FIR draft")
      }
    );
  };

  const handleTranslate = (lang: "en" | "hi" | "te") => {
    if (lang === targetLang) return;
    
    translateMutation.mutate(
      { id, data: { target_language: lang } },
      {
        onSuccess: (data) => {
          setTargetLang(lang);
          toast.success(`Translated to ${lang.toUpperCase()}`);
          // In a real app, we might update the local cache or use the returned data
          // Here we just show the toast and rely on the mutation updating the backend
          // which might trigger a refetch if we configured it to do so
        },
        onError: () => toast.error("Translation failed")
      }
    );
  };

  const getStrengthColor = (score: number) => {
    if (score >= 75) return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900";
    if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-900";
    return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900";
  };

  const getStrengthProgressColor = (score: number) => {
    if (score >= 75) return "bg-green-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Layout>
      <div className="bg-muted/20 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")} className="text-muted-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="flex border border-border rounded-md overflow-hidden bg-background">
              <button 
                onClick={() => handleTranslate("en")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${targetLang === "en" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                EN
              </button>
              <button 
                onClick={() => handleTranslate("hi")}
                className={`px-3 py-1.5 text-xs font-medium border-l border-border transition-colors ${targetLang === "hi" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                HI
              </button>
              <button 
                onClick={() => handleTranslate("te")}
                className={`px-3 py-1.5 text-xs font-medium border-l border-border transition-colors ${targetLang === "te" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                TE
              </button>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Case</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this case? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
              {caseData.category}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground border-border">
              {format(new Date(caseData.created_at), "PPP")}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            {caseData.title || "Case Analysis"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed">
            {translateMutation.data?.summary || caseData.summary}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Explanation & Reasoning Panel */}
            <Card className="border-primary/20 bg-primary/5 shadow-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" />
                  Plain Language Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-sm dark:prose-invert max-w-none text-foreground/90">
                  <p className="leading-relaxed text-base">
                    {translateMutation.data?.explanation || caseData.explanation}
                  </p>
                </div>
                
                <div className="bg-background/80 rounded-lg p-4 border border-primary/10">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Scale className="h-4 w-4 text-primary" />
                    Why these laws apply:
                  </h4>
                  <div className="space-y-3">
                    {caseData.ipc_sections?.map((ipc, i) => (
                      <div key={i} className="flex gap-3 text-sm">
                        <div className="font-mono font-medium text-primary shrink-0 w-16">{ipc.section}</div>
                        <div>
                          <span className="text-foreground">{ipc.title}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            Triggered by: {ipc.triggered_by.join(", ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Tabs */}
            <Tabs defaultValue="laws" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent mb-6">
                <TabsTrigger value="laws" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                  Applicable Laws
                </TabsTrigger>
                <TabsTrigger value="fir" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                  FIR Draft
                </TabsTrigger>
                <TabsTrigger value="precedents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3">
                  Precedents
                </TabsTrigger>
                {caseData.rights_violations && caseData.rights_violations.length > 0 && (
                  <TabsTrigger value="rights" className="rounded-none border-b-2 border-transparent data-[state=active]:border-destructive data-[state=active]:text-destructive data-[state=active]:bg-transparent px-4 py-3">
                    Rights Alert
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="laws" className="space-y-6 outline-none focus:ring-0">
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                    <Scale className="h-5 w-5 text-muted-foreground" />
                    Indian Penal Code (IPC)
                  </h3>
                  <div className="grid gap-4">
                    {caseData.ipc_sections?.map((ipc, i) => (
                      <Card key={i} className="shadow-sm border-border/50 bg-card/50">
                        <CardHeader className="pb-2 flex flex-row items-start justify-between">
                          <div>
                            <CardTitle className="text-base text-primary font-mono">{ipc.section}</CardTitle>
                            <CardDescription className="font-medium text-foreground mt-1">{ipc.title}</CardDescription>
                          </div>
                          <Badge variant="outline" className={ipc.confidence > 0.8 ? "text-green-600 border-green-200" : "text-amber-600 border-amber-200"}>
                            {Math.round(ipc.confidence * 100)}% Match
                          </Badge>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{ipc.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {caseData.constitution_articles && caseData.constitution_articles.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-serif font-semibold text-foreground flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      Constitutional Rights
                    </h3>
                    <div className="grid gap-4">
                      {caseData.constitution_articles.map((art, i) => (
                        <Card key={i} className="shadow-sm border-border/50 bg-card/50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base text-accent font-serif">{art.article}</CardTitle>
                            <CardDescription className="font-medium text-foreground mt-1">{art.title}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{art.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fir" className="outline-none focus:ring-0">
                <Card className="border-border shadow-sm">
                  <CardHeader className="border-b border-border/50 bg-muted/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-serif">First Information Report (FIR)</CardTitle>
                        <CardDescription>Generated draft based on your statement</CardDescription>
                      </div>
                      {!caseData.fir_draft && (
                        <Button 
                          onClick={handleGenerateFir} 
                          disabled={generateFirMutation.isPending}
                        >
                          {generateFirMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <FileSignature className="h-4 w-4 mr-2" />
                          )}
                          Generate Draft
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {caseData.fir_draft ? (
                      <div className="font-mono text-sm leading-relaxed space-y-6 bg-[#fdfbf7] dark:bg-black/20 p-6 md:p-8 rounded-md border border-border/50 shadow-inner">
                        <div className="text-center mb-8 border-b pb-4">
                          <h2 className="font-bold text-lg uppercase tracking-wider">Draft First Information Report</h2>
                          <p className="text-muted-foreground mt-1">(Under Section 154 Cr.P.C.)</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                          <div>
                            <span className="font-semibold block mb-1">To:</span>
                            The Station House Officer<br/>
                            [Police Station Name]<br/>
                            [City/District]
                          </div>
                          <div>
                            <span className="font-semibold block mb-1">Date of Report:</span>
                            {format(new Date(), "dd-MMM-yyyy")}
                          </div>
                        </div>

                        <Separator className="bg-border/50" />

                        <div>
                          <span className="font-semibold block mb-1">1. Complainant Details:</span>
                          Name: {caseData.fir_draft.complainant_name}<br/>
                          Address: {caseData.fir_draft.complainant_address}
                        </div>

                        <div>
                          <span className="font-semibold block mb-1">2. Incident Details:</span>
                          Date/Time: {caseData.fir_draft.incident_date}<br/>
                          Location: {caseData.fir_draft.incident_location}
                        </div>

                        <div>
                          <span className="font-semibold block mb-1">3. Sections Invoked:</span>
                          {caseData.fir_draft.sections_invoked.join(", ")}
                        </div>

                        <div>
                          <span className="font-semibold block mb-2">4. Summary of Facts:</span>
                          <p className="whitespace-pre-wrap">{caseData.fir_draft.incident_summary}</p>
                        </div>

                        <div>
                          <span className="font-semibold block mb-2">5. Timeline of Events:</span>
                          <ul className="list-disc pl-5 space-y-2">
                            {caseData.fir_draft.timeline.map((t, i) => (
                              <li key={i}><strong>{t.when}:</strong> {t.event}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="font-semibold block mb-2">6. Details of Accused / Suspects:</span>
                          <p className="whitespace-pre-wrap">{caseData.fir_draft.accused_details}</p>
                        </div>

                        <div>
                          <span className="font-semibold block mb-2">7. Prayer:</span>
                          <p className="whitespace-pre-wrap">{caseData.fir_draft.prayer}</p>
                        </div>

                        <div className="pt-12 flex justify-end">
                          <div className="text-center">
                            <div className="w-48 border-b border-foreground mb-2"></div>
                            Signature of Complainant
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <FileSignature className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No FIR draft generated yet.</p>
                        <p className="text-sm mt-1">Click the button above to generate a draft using AI.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="precedents" className="outline-none focus:ring-0">
                <div className="space-y-4">
                  {caseData.precedents?.map((prec, i) => (
                    <Card key={i} className="shadow-sm border-border/50">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base text-foreground font-serif leading-tight">
                              {prec.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {prec.court} • {prec.year}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-medium text-muted-foreground mb-1">Relevance</div>
                            <div className="flex items-center gap-2">
                              <Progress value={prec.similarity * 100} className="w-16 h-2" />
                              <span className="text-xs font-mono">{Math.round(prec.similarity * 100)}%</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-foreground/80 mb-3">{prec.summary}</p>
                        <div className="bg-muted/30 p-2 rounded text-sm flex gap-2">
                          <span className="font-medium">Outcome:</span>
                          <span className="text-muted-foreground">{prec.outcome}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="rights" className="outline-none focus:ring-0">
                <div className="space-y-4">
                  <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 text-destructive-foreground">
                    <ShieldAlert className="h-5 w-5" />
                    <AlertTitle>Rights Violations Detected</AlertTitle>
                    <AlertDescription>
                      Based on your description, the following fundamental rights may have been violated.
                    </AlertDescription>
                  </Alert>

                  <div className="grid gap-4">
                    {caseData.rights_violations?.map((viol, i) => (
                      <Card key={i} className="border-destructive/20 shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base text-destructive flex items-center gap-2">
                            <AlertOctagon className="h-4 w-4" />
                            {viol.right}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-foreground/80">{viol.description}</p>
                          <div className="bg-destructive/5 p-3 rounded-md border border-destructive/10">
                            <span className="text-xs font-semibold text-destructive uppercase tracking-wider block mb-1">
                              Where to complain
                            </span>
                            <span className="text-sm text-destructive-foreground/90">{viol.complaint_channel}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* Case Strength Score */}
            <Card className={`border shadow-sm overflow-hidden ${getStrengthColor(caseData.strength.overall)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm uppercase tracking-wider opacity-80">Case Strength Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3 mb-6">
                  <span className="text-5xl font-serif font-bold tracking-tighter leading-none">
                    {caseData.strength.overall}
                  </span>
                  <span className="text-lg font-medium opacity-80 pb-1">/ 100</span>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Evidence Base</span>
                      <span>{caseData.strength.evidence}%</span>
                    </div>
                    <Progress value={caseData.strength.evidence} className="h-1.5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Legal Coverage</span>
                      <span>{caseData.strength.legal_coverage}%</span>
                    </div>
                    <Progress value={caseData.strength.legal_coverage} className="h-1.5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Precedent Match</span>
                      <span>{caseData.strength.precedent}%</span>
                    </div>
                    <Progress value={caseData.strength.precedent} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-black/5 dark:bg-white/5 py-3 border-t border-current/10">
                <div className="flex items-center gap-2 w-full">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">Verdict: {caseData.strength.verdict}</span>
                </div>
              </CardFooter>
            </Card>

            {/* Evidence Checklist */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Evidence Checklist
                </CardTitle>
                <CardDescription>What you need to prove your case</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                <div className="max-h-[500px] overflow-y-auto p-4 pt-2">
                  {caseData.evidence && caseData.evidence.length > 0 ? (
                    <EvidenceList items={caseData.evidence} caseId={caseData.id} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No specific evidence identified.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}