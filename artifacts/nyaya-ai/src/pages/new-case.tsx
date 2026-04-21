import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout";
import { VoiceRecorder } from "@/components/voice-recorder";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateCase } from "@workspace/api-client-react";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  complainant_name: z.string().min(2, "Name must be at least 2 characters."),
  input_language: z.enum(["en", "hi", "te"]),
  incident_text: z.string().min(20, "Please provide more details about the incident."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewCase() {
  const [, setLocation] = useLocation();
  const createCase = useCreateCase();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      complainant_name: "",
      input_language: "en",
      incident_text: "",
    },
  });

  const language = form.watch("input_language");

  function onSubmit(values: FormValues) {
    createCase.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          setLocation(`/cases/${data.id}`);
        },
      }
    );
  }

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">New Incident Report</h1>
          <p className="text-muted-foreground">
            Describe what happened in as much detail as possible. Our AI will analyze the facts and identify the relevant laws.
          </p>
        </div>

        {createCase.isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to analyze the incident. Please try again.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-border/60 shadow-sm overflow-hidden">
          <div className="h-2 w-full bg-primary" />
          <CardHeader className="bg-muted/10 pb-4">
            <CardTitle className="text-xl">Complainant Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="complainant_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" className="bg-background" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="input_language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Preferred Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="hi">Hindi (हिंदी)</SelectItem>
                            <SelectItem value="te">Telugu (తెలుగు)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          We can process incidents described in these languages.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-medium">Incident Description</h3>
                  </div>
                  
                  <div className="bg-muted/20 p-4 rounded-lg border border-dashed border-border/60 mb-4">
                    <div className="text-foreground mb-3 block font-semibold text-sm">Option 1: Record Voice</div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Speak naturally about what happened. We'll transcribe it automatically.
                    </p>
                    <VoiceRecorder 
                      language={language} 
                      onTranscription={(text) => {
                        const current = form.getValues("incident_text");
                        form.setValue("incident_text", current ? `${current}\n\n${text}` : text, { 
                          shouldValidate: true,
                          shouldDirty: true
                        });
                      }} 
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="incident_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-semibold">Option 2: Type Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="I was contacted on WhatsApp by someone claiming to be from my bank..." 
                            className="min-h-[200px] resize-y bg-background font-sans text-base leading-relaxed" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Include dates, times, amounts, names, and exact sequence of events.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full md:w-auto h-12 px-8"
                    disabled={createCase.isPending}
                  >
                    {createCase.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing Case...
                      </>
                    ) : (
                      <>
                        Analyze Incident & Identify Laws
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}