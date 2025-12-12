"use client"

import { useState, useEffect } from "react"
import { Check, Pause, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { subscriptionService, plansService } from "@/services"

interface Plan {
  id: string
  name: string
  boxes: number
  price: string
  features: string[]
  popular?: boolean
}

export function SubscriptionManagement() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [currentPlan, setCurrentPlan] = useState("famiglia")
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [plansData, subData] = await Promise.all([plansService.getAll(), subscriptionService.getMySubscription()])

        // Transform plans to component format
        const formattedPlans = plansData.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          boxes: p.boxesPerMonth,
          price: `$${p.price.toLocaleString("es-AR")}`,
          features: p.benefits,
          popular: p.name === "Famiglia",
        }))
        setPlans(formattedPlans)

        if (subData) {
          setCurrentPlan(subData.planId.toString())
          setCurrentSubscriptionId(subData.id)
        }
      } catch (error) {
        console.error("Error fetching plans:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los planes",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleChangePlanClick = (plan: Plan) => {
    setSelectedPlan(plan)
    setShowChangePlanDialog(true)
  }

  const handleConfirmChangePlan = () => {
    if (selectedPlan) {
      toast({
        title: "Plan cambiado",
        description: `Tu suscripción al plan ${selectedPlan.name} será efectiva desde el próximo mes.`,
      })
    }
    setShowChangePlanDialog(false)
  }

  const handleConfirmPause = async () => {
    if (!currentSubscriptionId) return
    try {
      await subscriptionService.pause(currentSubscriptionId)
      toast({
        title: "Suscripción pausada",
        description: "No recibirás tu caja el próximo mes. Podés reactivarla cuando quieras.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo pausar la suscripción",
        variant: "destructive",
      })
    }
    setShowPauseDialog(false)
  }

  const handlePauseClick = () => {
    setShowPauseDialog(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Gestión</p>
        <h1 className="text-4xl font-serif font-bold text-foreground italic">Mi Suscripción</h1>
        <p className="text-muted-foreground text-lg mt-3">Administrá tu plan y explorá otras opciones.</p>
      </div>

      {/* Current Plan */}
      <Card className="border-0 card-elevated-lg rounded-2xl overflow-hidden">
        <div className="bg-primary/5 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
                Tu Plan Actual
              </p>
              <h2 className="text-3xl font-serif font-bold text-foreground italic">
                {plans.find((p) => p.id === currentPlan)?.name || "Plan Famiglia"}
              </h2>
            </div>
            <Badge className="bg-accent text-accent-foreground px-4 py-2 text-sm">Activo</Badge>
          </div>
        </div>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
                Cajas por Mes
              </p>
              <p className="text-2xl font-serif font-bold text-foreground">
                {plans.find((p) => p.id === currentPlan)?.boxes || 8}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
                Precio Mensual
              </p>
              <p className="text-2xl font-serif font-bold text-foreground">
                {plans.find((p) => p.id === currentPlan)?.price || "$45.000"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
                Próxima Renovación
              </p>
              <p className="text-2xl font-serif font-bold text-foreground">10 Mar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-serif font-bold text-foreground italic mb-6">Cambiar de Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan
            return (
              <Card
                key={plan.id}
                className={cn(
                  "border-0 card-elevated rounded-2xl relative overflow-hidden transition-all",
                  isCurrent && "ring-2 ring-primary",
                  plan.popular && !isCurrent && "ring-1 ring-accent/50",
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-bl-xl">
                    Más Popular
                  </div>
                )}
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground italic">{plan.name}</h3>
                    <p className="text-3xl font-serif font-bold text-primary mt-2">
                      {plan.price}
                      <span className="text-sm text-muted-foreground font-normal">/mes</span>
                    </p>
                  </div>

                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-accent" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button disabled className="w-full py-5 rounded-xl bg-secondary text-secondary-foreground">
                      Plan Actual
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleChangePlanClick(plan)}
                      variant="outline"
                      className="w-full py-5 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      Cambiar a {plan.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pause Subscription */}
      <Card className="border-0 card-elevated rounded-2xl border-destructive/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pausar Suscripción</h3>
                <p className="text-sm text-muted-foreground">Podés pausar tu suscripción temporalmente</p>
              </div>
            </div>
            <Button
              onClick={handlePauseClick}
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl px-6 bg-transparent"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pause Confirmation Dialog */}
      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent className="rounded-2xl border-0 card-elevated-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl italic text-foreground">
              ¿Estás seguro que querés pausar?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              No recibirás tu caja el próximo mes. Podés reactivar tu suscripción en cualquier momento desde esta
              sección.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPause}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Sí, Pausar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Plan Confirmation Dialog */}
      <AlertDialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <AlertDialogContent className="rounded-2xl border-0 card-elevated-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl italic text-foreground">
              Confirmar cambio de plan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              {selectedPlan && (
                <>
                  Estás por cambiar al plan <strong className="text-foreground">{selectedPlan.name}</strong> por{" "}
                  <strong className="text-foreground">{selectedPlan.price}/mes</strong>. El cambio será efectivo desde
                  el próximo período de facturación.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmChangePlan}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              Confirmar Cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
