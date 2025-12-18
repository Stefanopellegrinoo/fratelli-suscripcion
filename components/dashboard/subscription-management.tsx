"use client"

import { useState, useEffect } from "react"
import { Check, Pause, AlertCircle, PlayCircle, Calendar, CreditCard, Truck, CalendarClock, MessageCircle, Clock, ArrowRightLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { subscriptionService, plansService } from "@/services"

// --- HELPER: CALCULAR FECHA ---
const getNextFridayDate = (fridayIndex: number): Date => {
    const today = new Date()
    let targetDate = new Date(today.getFullYear(), today.getMonth(), 1)

    while (targetDate.getDay() !== 5) {
        targetDate.setDate(targetDate.getDate() + 1)
    }

    targetDate.setDate(targetDate.getDate() + (fridayIndex - 1) * 7)

    if (targetDate <= today) {
        targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
        while (targetDate.getDay() !== 5) {
            targetDate.setDate(targetDate.getDate() + 1)
        }
        targetDate.setDate(targetDate.getDate() + (fridayIndex - 1) * 7)
    }
    return targetDate
}

interface Plan {
  id: string
  name: string
  boxes: number
  price: string
  priceNum: number
  features: string[]
  categories: string[]
  popular?: boolean
}

// Interfaz para el objeto de cambio pendiente
interface CambioPendiente {
    nombreNuevoPlan: string;
    precioNuevo: number;
    fechaEfectiva: string;
}

export function SubscriptionManagement() {
  const { toast } = useToast()
  
  // Estados de Datos
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [currentSubscriptionId, setCurrentSubscriptionId] = useState<number | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [nextPayment, setNextPayment] = useState<string | null>(null)
  
  // Estado para bloquear UI si hay cambio
  const [cambioPendiente, setCambioPendiente] = useState<CambioPendiente | null>(null)

  // Estados de UI - Diálogos
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  
  // Estados para el Flujo de Alta
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false)
  const [selectedFriday, setSelectedFriday] = useState<string>("1")
  const [planToSubscribe, setPlanToSubscribe] = useState<Plan | null>(null)
  const [selectedPlanToChange, setSelectedPlanToChange] = useState<Plan | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [plansData, subData] = await Promise.all([
            plansService.getAll(), 
            subscriptionService.getMySubscription()
        ])

        const formattedPlans = plansData.map((p: any) => ({
          id: p.id.toString(),
          name: p.nombre,
          description: p.descripcion,
          boxes: p.cantidadCajas,
          price: `$${p.precioMensual?.toLocaleString("es-AR")}`,
          priceNum: p.precioMensual,
          features: p.beneficios,
          categories : p.categoriasPermitidas,
          popular: p.nombre === "Famiglia",
        }))
        
        setPlans(formattedPlans)

        if (subData) {
          setCurrentPlan(subData.planId.toString())
          setCurrentSubscriptionId(subData.id)
          setSubscriptionStatus(subData.status)
          setNextPayment(subData.nextPaymentDate)
          // Asignamos el cambio pendiente si existe
          setCambioPendiente(subData.cambioPendiente || null)
        } else {
          setCurrentPlan(null)
          setCurrentSubscriptionId(null)
          setNextPayment(null)
          setCambioPendiente(null)
        }

      } catch (error) {
        console.error("Error:", error)
        toast({ title: "Error", description: "No se pudieron cargar los datos.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubscribeClick = (plan: Plan) => {
    setPlanToSubscribe(plan)
    setShowSubscribeDialog(true)
  }
const handleConfirmSubscription = async () => {
   if (!planToSubscribe) return

   try {
     setLoading(true)
     const calculatedStartDate = getNextFridayDate(parseInt(selectedFriday))
  
     const newSub = await subscriptionService.create({
        planId: Number(planToSubscribe.id),
        startDate: calculatedStartDate.toISOString().split('T')[0],
 preferenciaEntrega: selectedFriday,
     })
  
     const mpUrl = newSub?.url;

     if (mpUrl) {
            toast({
     title: "¡Redirigiendo a Mercado Pago!",
     description: "Completá el pago para finalizar.",
         })
            
        window.location.href = mpUrl;
            

            return; 

     } else {
        throw new Error("El backend no devolvió la URL de pago.");
     }

        // Este código de abajo ya no se ejecutará si hay URL, 
        // evitando el error de "toString" o actualizaciones en componente desmontado.
        /*      setCurrentPlan(newSub.planId.toString())
     setCurrentSubscriptionId(newSub.id)
     setSubscriptionStatus("ACTIVE")
     setShowSubscribeDialog(false)
        */

   } catch (error) {
        console.error(error);
     toast({
        title: "Error en el pago",
        description: "No se pudo procesar la suscripción. Intentá nuevamente.",
        variant: "destructive",
     })
        setLoading(false) 
   } 
 
  }

  const handleChangePlanClick = (plan: Plan) => {
    // PROTECCIÓN EXTRA: Si hay cambio pendiente, no hacemos nada
    if (cambioPendiente) return;
    
    setSelectedPlanToChange(plan)
    setShowChangePlanDialog(true)
  }

  const handlePauseClick = () => setShowPauseDialog(true)

  const handleConfirmPause = async () => {
    if (!currentSubscriptionId) return
    try {
      await subscriptionService.pause(currentSubscriptionId)
      setSubscriptionStatus("PAUSED")
      toast({ title: "Suscripción pausada", description: "No recibirás tu caja el próximo mes." })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo pausar.", variant: "destructive" })
    }
    setShowPauseDialog(false)
  }

  const handleResumeClick = async () => {
    if (!currentSubscriptionId) return
    try {
      setLoading(true)
      await subscriptionService.resume(currentSubscriptionId)
      setSubscriptionStatus("ACTIVE")
      toast({ title: "¡Bienvenido de vuelta!", description: "Suscripción reanudada." })
    } catch (error) {
      toast({ title: "Error", description: "No se pudo reanudar.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmChangePlan = async () => {
    if (!selectedPlanToChange) return
    try {
      setLoading(true)
      
      const response = await subscriptionService.changePlan(Number(selectedPlanToChange.id))
      
      // Actualizamos UI "Optimista" o basándonos en respuesta
      // Si el backend te devuelve que se generó un cambio pendiente:
      /* setCambioPendiente({
             nombreNuevoPlan: selectedPlanToChange.name,
             precioNuevo: selectedPlanToChange.priceNum,
             fechaEfectiva: nextPayment || "Próximo ciclo"
         }) 
      */

      toast({ 
        title: "Cambio Programado", 
        description: `Tu plan cambiará a ${selectedPlanToChange.name} en el próximo cobro.` 
      })
      
      // Forzar recarga de datos para asegurar consistencia
      window.location.reload(); 

    } catch (error) {
        toast({ title: "Error", description: "No se pudo cambiar el plan.", variant: "destructive" })
    } finally {
        setLoading(false)
    }
    setShowChangePlanDialog(false)
  }
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-secondary/40 rounded animate-pulse" />
        <Card className="border-0 card-elevated-lg rounded-2xl">
          <CardContent className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-secondary/40 rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }
  // --- RENDER ---
  return (
    <div className="space-y-8">
      
      {!currentPlan ? (
        <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in duration-500">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-3 font-medium">Bienvenido a Fratelli</p>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground italic mb-6">Elegí tu Plan Ideal</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Seleccioná tu plan, elegí qué viernes del mes querés recibir tu caja y nosotros nos encargamos del resto.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Gestión</p>
          <h1 className="text-4xl font-serif font-bold text-foreground italic">Mi Suscripción</h1>
          <p className="text-muted-foreground text-lg mt-3">Administrá tu plan y explorá otras opciones.</p>
        </div>
      )}

      {/* TARJETA DE ESTADO DE SUSCRIPCIÓN */}
      {subscriptionStatus === "CANCELLED" ? (
        <Card className="border-0 card-elevated-lg rounded-2xl overflow-hidden mb-8 border-l-4 border-l-muted bg-muted/10">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground italic mb-2">
                ¡Te extrañamos!
              </h2>
              <p className="text-muted-foreground">
                Tu suscripción al plan <strong>{plans.find(p => p.id === currentPlan)?.name}</strong> fue cancelada.
                <br />
                Elegí un nuevo plan abajo para volver a recibir nuestras pastas.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        currentPlan && (
          <Card className="border-0 card-elevated-lg rounded-2xl overflow-hidden">
            <div className="bg-primary/5 px-8 py-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">Tu Plan Actual</p>
                <h2 className="text-3xl font-serif font-bold text-foreground italic">
                  {plans.find((p) => p.id === currentPlan)?.name || "Plan Famiglia"}
                </h2>
              </div>
              <Badge className={cn("px-4 py-2 text-sm", subscriptionStatus === "PAUSED" ? "bg-amber-500 hover:bg-amber-600" : "bg-primary")}>
                  {subscriptionStatus}
              </Badge>
            </div>
            
            {/* --- AQUÍ INSERTAMOS EL BANNER DE CAMBIO PENDIENTE --- */}
            {cambioPendiente && (
                <div className="bg-amber-50 border-y border-amber-100 px-8 py-4 flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0 animate-pulse" />
                    <div>
                        <p className="font-bold text-amber-800 text-sm">Cambio de plan programado</p>
                        <p className="text-sm text-amber-700/80">
                            Tu cuenta pasará al plan <strong>{cambioPendiente.nombreNuevoPlan}</strong> automáticamente el día <strong>{new Date(cambioPendiente.fechaEfectiva).toLocaleDateString("es-AR")}</strong>.
                        </p>
                    </div>
                </div>
            )}

            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">Cajas por Mes</p>
                  <p className="text-2xl font-serif font-bold text-foreground">{plans.find((p) => p.id === currentPlan)?.boxes || 8}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">Precio Mensual</p>
                  <p className="text-2xl font-serif font-bold text-foreground">{plans.find((p) => p.id === currentPlan)?.price}</p>
                </div>
                <div>
                    <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
                        Próxima Renovación
                    </p>
                    <p className="text-2xl font-serif font-bold text-foreground">
                        {nextPayment ? (
                            new Date(nextPayment + "T00:00:00").toLocaleDateString("es-AR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            })
                        ) : (
                            <span className="text-muted-foreground text-lg italic">--/--/--</span>
                        )}
                    </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* GRILLA DE PLANES */}
      <div>
        <h2 className={cn("text-xl font-serif font-bold text-foreground italic mb-6", !currentPlan && "text-center text-2xl mt-8")}>
          {currentPlan ? "Cambiar de Plan" : "Nuestros Planes Disponibles"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan
            // Lógica para saber si este plan es el "futuro"
            const isFuturePlan = cambioPendiente && cambioPendiente.nombreNuevoPlan === plan.name;

            return (
              <Card key={plan.id} className={cn("border-0 card-elevated rounded-2xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1", isCurrent && "ring-2 ring-primary", plan.popular && !isCurrent && "ring-1 ring-accent/50", !currentPlan && plan.popular && "transform scale-105 shadow-xl z-10")}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-bl-xl">Más Popular</div>
                )}
                <CardContent className="p-6 space-y-5 flex flex-col h-full">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-foreground italic">{plan.name}</h3>
                    <p className="text-3xl font-serif font-bold text-primary mt-2">{plan.price}<span className="text-sm text-muted-foreground font-normal">/mes</span></p>
                  </div>
                  <ul className="space-y-2.5 flex-grow">
                    <h3>Beneficios Incluidos</h3>
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-accent flex-shrink-0" />{feature}</li>
                    ))}
                  </ul>
                  <ul className="space-y-2.5 flex-grow">
                      <h3>Categorias de Pastas Incluidas</h3>
                    {plan.categories?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Check className="h-4 w-4 text-accent flex-shrink-0" />{feature}</li>
                    ))}
                  </ul>
                  
                  <div className="pt-4">
                    {/* LOGICA DE BOTONES BLOQUEADOS */}
                    
                    {isCurrent && subscriptionStatus !== "CANCELLED" ? (
                      // CASO 1: Plan Actual
                      <Button disabled className="w-full py-6 rounded-xl bg-secondary text-secondary-foreground opacity-50 cursor-not-allowed">
                        Plan Actual
                      </Button>

                    ) : cambioPendiente ? (
                        // CASO 2: HAY UN CAMBIO PENDIENTE (BLOQUEO TOTAL)
                        <Button 
                            disabled 
                            variant="outline"
                            className={cn(
                                "w-full py-6 rounded-xl border-dashed",
                                isFuturePlan ? "border-amber-500 text-amber-600 bg-amber-50" : "border-muted text-muted-foreground"
                            )}
                        >
                            {isFuturePlan ? (
                                <span className="flex items-center gap-2"><Clock className="h-4 w-4"/> Próximo Plan</span>
                            ) : (
                                "Cambio Programado"
                            )}
                        </Button>

                    ) : !currentPlan || subscriptionStatus === "CANCELLED" ? (
                      // CASO 3: Sin plan o cancelado (Compra)
                      <Button 
                        onClick={() => handleSubscribeClick(plan)} 
                        className="w-full py-6 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-serif italic shadow-lg"
                      >
                        {subscriptionStatus === "CANCELLED" && isCurrent ? "Reactivar este Plan" : "Suscribirme Ahora"}
                      </Button>
                    ) : (
                      // CASO 4: Cambio de plan normal (Disponible)
                      <Button 
                        onClick={() => handleChangePlanClick(plan)} 
                        variant="outline" 
                        className="w-full py-6 rounded-xl border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        Cambiar a {plan.name}
                      </Button>
                    )}
                  </div> 
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ZONA DE PELIGRO (Pausa) - Solo visible si no está cancelado */}
      {currentPlan && subscriptionStatus !== "CANCELLED" && (
        // Si hay cambio pendiente, también podrías querer bloquear la pausa, 
        // o dejarla habilitada bajo responsabilidad del usuario. 
        // Aquí la dejo, pero podrías agregar "disabled={!!cambioPendiente}" al botón.
        
        subscriptionStatus === "PAUSED" ? (
          <Card className="border-0 card-elevated rounded-2xl border-amber-500/20 bg-amber-50/30 mt-12">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center"><PlayCircle className="h-6 w-6 text-amber-600" /></div>
                <div>
                  <h3 className="font-serif font-bold text-foreground italic text-lg">Tu suscripción está pausada</h3>
                  <p className="text-sm text-muted-foreground">Reactivala para volver a disfrutar.</p>
                </div>
              </div>
              <Button onClick={handleResumeClick} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 py-6 text-base font-medium shadow-lg w-full md:w-auto">Reanudar Suscripción</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 card-elevated rounded-2xl border-destructive/20 mt-12">
            <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center"><AlertCircle className="h-6 w-6 text-destructive" /></div>
                <div>
                  <h3 className="font-semibold text-foreground">Pausar Suscripción</h3>
                  <p className="text-sm text-muted-foreground">Podés pausar tu suscripción temporalmente.</p>
                </div>
              </div>
              <Button 
                onClick={handlePauseClick} 
                disabled={!!cambioPendiente} // OPCIONAL: Bloquear pausa si hay cambio de plan
                variant="outline" 
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl px-6 bg-transparent w-full md:w-auto disabled:opacity-50"
              >
                {cambioPendiente ? "Cambio Pendiente" : <><Pause className="h-4 w-4 mr-2" />Pausar</>}
              </Button>
            </CardContent>
          </Card>
        )
      )}
      {/* --- DIÁLOGO DE PAGO Y SELECCIÓN DE FECHA --- */}
      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent className="sm:max-w-[500px] border-0 card-elevated-lg rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-serif text-2xl italic text-foreground">Configurá tu Suscripción</DialogTitle>
            <DialogDescription>
              Estás a un paso de unirte al plan <span className="font-bold text-primary">{planToSubscribe?.name}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-6 space-y-6">
            {/* SELECCIÓN DE DÍA DE ENTREGA */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2">
                <Truck className="h-4 w-4" /> Preferencia de Entrega
              </Label>
              <p className="text-sm text-muted-foreground">Elegí qué viernes de cada mes querés recibir tu caja.</p>
              
              <RadioGroup value={selectedFriday} onValueChange={setSelectedFriday} className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { val: "1", label: "1º Viernes" },
                  { val: "2", label: "2º Viernes" },
                  { val: "3", label: "3º Viernes" },
                  { val: "4", label: "4º Viernes" },
                ].map((opt) => (
                  <Label
                    key={opt.val}
                    className={cn(
                      "border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-secondary/40",
                      selectedFriday === opt.val ? "border-primary bg-primary/5 text-primary" : "border-border"
                    )}
                  >
                    <RadioGroupItem value={opt.val} className="sr-only" />
                    <span className="font-bold text-lg">{opt.val}º</span>
                    <span className="text-xs uppercase font-medium">Viernes</span>
                  </Label>
                ))}
              </RadioGroup>
              
              {/* Fecha calculada dinámica */}
              <div className="bg-secondary/30 rounded-lg p-3 flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Tu primera entrega sería el: <strong className="text-foreground">{getNextFridayDate(parseInt(selectedFriday)).toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}</strong></span>
              </div>
            </div>

            {/* RESUMEN DE PAGO */}
            <div className="space-y-3 pt-2">
                <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Resumen de Pago
                </Label>
                <div className="bg-secondary/10 border border-border rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plan {planToSubscribe?.name}</span>
                        <span>{planToSubscribe?.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Envío</span>
                        <span className="text-green-600 font-medium">Bonificado</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground">Total a Pagar</span>
                        <span className="font-serif text-xl font-bold text-primary italic">{planToSubscribe?.price}</span>
                    </div>
                </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2">
            {loading ? (
          <p className="text-sm text-muted-foreground italic mr-auto">Procesando...</p>
            ) : (
              <>
            <Button variant="outline" disabled={loading} onClick={() => setShowSubscribeDialog(false)} className="rounded-xl h-12">Cancelar</Button>
            <Button onClick={handleConfirmSubscription} disabled={loading} className="rounded-xl h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base shadow-lg">
                Confirmar y Pagar
            </Button>
              </>
          )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogos de Cambio de Plan y Pausa (sin cambios mayores) */}
<AlertDialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
  <AlertDialogContent className="rounded-2xl border-0 card-elevated-lg max-w-md">
    <AlertDialogHeader>
      <AlertDialogTitle className="font-serif text-2xl italic text-center mb-2">
        Confirmar cambio de plan
      </AlertDialogTitle>
      
      <div className="flex flex-col gap-4 text-left">
        {/* Sección 1: Confirmación básica */}
        <AlertDialogDescription className="text-base text-foreground/80">
          Estás por cambiarte al plan <span className="font-bold text-primary">{selectedPlanToChange?.name}</span>.
        </AlertDialogDescription>

        {/* Sección 2: Explicación del tiempo (Regla General) */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl border border-border/50">
          <CalendarClock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">¿Cuándo se aplica?</p>
            El cambio de precio y beneficios se hará efectivo automáticamente en tu <strong>próximo ciclo de cobro</strong>.
          </div>
        </div>

        {/* Sección 3: Call to Action para urgencias (WhatsApp) */}
        <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/50">
          <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-green-800 dark:text-green-300">¿Lo necesitás para este pedido?</p>
            <p className="text-green-700/80 dark:text-green-400/80 mb-2">
              Si querés que el cambio impacte en un pedido en curso, contactanos manualmente.
            </p>
            <a 
              href="https://wa.me/549XXXXXXXXX?text=Hola,%20quiero%20cambiar%20mi%20plan%20ya%20mismo" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-green-700 hover:underline inline-flex items-center"
            >
              Hablar por WhatsApp &rarr;
            </a>
          </div>
        </div>
      </div>
    </AlertDialogHeader>

    <AlertDialogFooter className="mt-4 sm:justify-between gap-2">
      <AlertDialogCancel className="rounded-xl border-2 flex-1 mt-0">
        Ahora no
      </AlertDialogCancel>
      <AlertDialogAction 
        onClick={handleConfirmChangePlan} 
        className="rounded-xl bg-primary flex-1"
      >
        Entendido, confirmar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

      <AlertDialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <AlertDialogContent className="rounded-2xl border-0 card-elevated-lg">
            <AlertDialogHeader>
                <AlertDialogTitle className="font-serif text-2xl italic">¿Pausar suscripción?</AlertDialogTitle>
                <AlertDialogDescription>No recibirás cajas hasta que reactives.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Volver</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmPause} className="rounded-xl bg-destructive hover:bg-destructive/90">Sí, Pausar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}