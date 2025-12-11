import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

const plans = [
  {
    name: "Piccolo",
    tagline: "Perfecto para uno",
    price: "$25.000",
    period: "/mes",
    boxes: 4,
    features: ["4 cajas por mes", "Selección de pastas clásicas", "Entrega semanal", "Recetas incluidas"],
    popular: false,
  },
  {
    name: "Famiglia",
    tagline: "El más popular",
    price: "$45.000",
    period: "/mes",
    boxes: 8,
    features: [
      "8 cajas por mes",
      "Pastas clásicas y rellenas",
      "Acceso a selecciones premium",
      "Horarios de entrega prioritarios",
      "Recetas exclusivas",
    ],
    popular: true,
  },
  {
    name: "Medio",
    tagline: "Para amantes de la pasta",
    price: "$35.000",
    period: "/mes",
    boxes: 6,
    features: ["6 cajas por mes", "Pastas clásicas y rellenas", "Entrega flexible", "Recetas incluidas"],
    popular: false,
  },
]

export function PlansSection() {
  return (
    <section id="planes" className="py-24 px-6 bg-secondary/30">
      <div className="container max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Elegí Tu Plan</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            <span className="italic">Pasta Fresca,</span> a Tu Medida
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Seleccioná la suscripción perfecta para tu hogar. Todos los planes incluyen envío gratuito y pueden pausarse
            en cualquier momento.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative bg-card rounded-2xl p-8 card-elevated transition-all duration-300 hover:card-elevated-lg",
                plan.popular && "ring-2 ring-primary md:scale-105 md:-my-4",
              )}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs uppercase tracking-wider px-4 py-1.5 rounded-full font-medium">
                    Más Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8 pt-2">
                <h3 className="text-2xl font-serif font-bold text-foreground italic mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-serif font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.boxes} cajas incluidas</p>
              </div>

              {/* Divider */}
              <div className="border-t border-border/50 my-6" />

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href="/dashboard" className="block">
                <Button
                  className={cn(
                    "w-full rounded-full py-6",
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                  )}
                >
                  Comenzar
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
