import { Link } from "wouter";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Scale className="h-6 w-6" />
            <span className="font-serif text-xl font-semibold tracking-tight">Nyaya AI</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Select defaultValue="en">
              <SelectTrigger className="w-[120px] bg-transparent border-none shadow-none focus:ring-0">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/new">
              <Button className="font-medium">New Case</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-muted/30 mt-auto py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Nyaya AI provides general legal information, not legal advice. 
            Always consult with a qualified advocate for official legal representation.
          </p>
        </div>
      </footer>
    </div>
  );
}