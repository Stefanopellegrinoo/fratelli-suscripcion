import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/artisanal-fresh-pasta-italian-kitchen-warm-lightin.jpg"
          alt="Fresh artisanal pasta"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container max-w-4xl mx-auto px-6 text-center pt-20">
        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-6">
          Desde 1987 · Hecho a Mano en Italia
        </p>

        <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-tight mb-6">
          <span className="italic">Pasta Fresca Artesanal,</span>
          <br />
          <span className="text-primary">a Tu Puerta</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Experimentá el sabor de la tradición. Pasta fresca hecha a mano por artesanos italianos, entregada
          semanalmente en tu hogar.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="rounded-full px-10 py-6 text-base bg-primary text-primary-foreground hover:bg-primary/90 card-elevated"
            >
              Suscribirme Ahora
            </Button>
          </Link>
          <Link href="#planes">
            <Button variant="outline" size="lg" className="rounded-full px-10 py-6 text-base bg-transparent">
              Ver Planes
            </Button>
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  )
}
