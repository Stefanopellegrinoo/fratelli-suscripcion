import { Package, ChefHat, Truck } from "lucide-react"

const steps = [
  {
    icon: ChefHat,
    title: "Elige Tu Plan",
    description: "Seleccioná entre nuestros planes de suscripción según el tamaño de tu hogar y preferencias de pasta.",
  },
  {
    icon: Package,
    title: "Armá Tu Caja",
    description:
      "Personalizá tu caja semanal con nuestra selección de pastas artesanales clásicas, rellenas y premium.",
  },
  {
    icon: Truck,
    title: "Recibí Semanalmente",
    description: "Recibí tu pasta artesanal en la puerta de tu casa, perfectamente empaquetada y lista para cocinar.",
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="container max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-4">Simple y Delicioso</p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground">
            <span className="italic">Cómo Funciona</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="text-center">
                {/* Step Number & Icon */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                    <Icon className="h-8 w-8 text-accent" strokeWidth={1.5} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-serif font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-serif font-bold text-foreground mb-3 italic">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            )
          })}
        </div>

        {/* Decorative line connecting steps on desktop */}
        <div
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-1/2 w-2/3 h-px bg-border/30"
          style={{ maxWidth: "600px" }}
        />
      </div>
    </section>
  )
}
