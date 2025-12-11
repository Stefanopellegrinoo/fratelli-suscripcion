"use client"

import { Calendar, CreditCard, Package } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SubscriptionStatusProps {
  onBuildBox: () => void
}

export function SubscriptionStatus({ onBuildBox }: SubscriptionStatusProps) {
  const subscription = {
    plan: "Famiglia",
    status: "Activo",
    nextDelivery: "15 de Marzo, 2024",
    nextPayment: "10 de Marzo, 2024",
    boxesPerMonth: 8,
    price: "$45.000",
  }

  return (
    <Card className="border-0 card-elevated-lg rounded-3xl overflow-hidden">
      <CardHeader className="pb-0 pt-8 px-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">Tu Suscripción</p>
            <h2 className="text-3xl font-serif font-bold tracking-tight italic text-foreground">Plan Actual</h2>
          </div>
          <div className="flex items-center gap-2 bg-secondary/80 px-4 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-600" />
            <span className="text-sm font-medium text-foreground/80">{subscription.status}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 px-8 pb-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium">Plan</span>
            </div>
            <div>
              <p className="text-4xl font-serif font-bold text-foreground italic">{subscription.plan}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {subscription.boxesPerMonth} cajas por mes · {subscription.price}
              </p>
            </div>
          </div>

          <div className="space-y-3 md:border-l md:border-border md:pl-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium">Próxima Entrega</span>
            </div>
            <p className="text-2xl font-serif font-semibold text-foreground">{subscription.nextDelivery}</p>
          </div>

          <div className="space-y-3 md:border-l md:border-border md:pl-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="h-4 w-4" strokeWidth={1.5} />
              <span className="text-[11px] uppercase tracking-[0.15em] font-medium">Próximo Pago</span>
            </div>
            <p className="text-2xl font-serif font-semibold text-foreground">{subscription.nextPayment}</p>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="flex gap-4">
          <Button
            onClick={onBuildBox}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base rounded-xl font-medium tracking-wide"
          >
            Armá Tu Caja
          </Button>
          <Button
            variant="ghost"
            className="px-6 py-6 text-base text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl font-medium"
          >
            Pausar Suscripción
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
