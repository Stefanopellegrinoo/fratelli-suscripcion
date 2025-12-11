"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { HeroSection } from "@/components/landing/hero-section"
import { PlansSection } from "@/components/landing/plans-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <nav className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-serif font-bold text-foreground italic">
            Fratelli
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="#planes" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Planes
            </Link>
            <Link
              href="#como-funciona"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cómo Funciona
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="rounded-full bg-transparent">
                Ingresar
              </Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-card">
                <nav className="flex flex-col gap-6 mt-8">
                  <Link
                    href="#planes"
                    className="text-base text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Planes
                  </Link>
                  <Link
                    href="#como-funciona"
                    className="text-base text-foreground hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cómo Funciona
                  </Link>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full bg-transparent">
                      Ingresar
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <main>
        <HeroSection />
        <PlansSection />
        <HowItWorksSection />
      </main>

      <Footer />
    </div>
  )
}
