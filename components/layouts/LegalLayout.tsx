// src/components/layouts/LegalLayout.tsx
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  lastUpdated: string;
}

export function LegalLayout({ children, title, lastUpdated }: LegalLayoutProps) {
  return (
    <div className="min-h-screen bg-secondary/20 font-sans">
      {/* Navbar Minimalista */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2 font-serif font-bold italic text-lg text-foreground">
            Fratelli <span className="not-italic text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-1">Legales</span>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm p-8 md:p-12">
          {/* Cabecera del Documento */}
          <div className="text-center mb-12 border-b border-border/40 pb-8">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest">
              Última actualización: {lastUpdated}
            </p>
          </div>

          {/* Texto Legal */}
          <div className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-primary">
            {children}
          </div>
        </div>

        {/* Footer Legal */}
        <div className="mt-8 text-center text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          <p>
            Fratelli Pastas opera bajo la normativa vigente de la República Argentina. 
            Todas las transacciones son procesadas de forma segura.
          </p>
        </div>
      </main>
    </div>
  );
}