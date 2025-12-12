"use client"

import { useState } from "react"
import { ShieldCheck, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { paymentService } from "@/services"

interface CheckoutItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
}

interface CheckoutSummaryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CheckoutItem[]
  deliveryDate?: string
  timeSlot?: string
  subscriptionId?: number
}

export function CheckoutSummary({
  open,
  onOpenChange,
  items,
  deliveryDate,
  timeSlot,
  subscriptionId,
}: CheckoutSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handlePayment = async () => {
    if (!subscriptionId) {
      toast({
        title: "Error",
        description: "No se encontró la suscripción.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Call backend to create Mercado Pago payment link
      const { paymentUrl } = await paymentService.createSubscriptionLink(subscriptionId)

      toast({
        title: "Redirigiendo a Mercado Pago",
        description: "Serás redirigido al sitio de pago seguro...",
      })

      // Redirect to Mercado Pago
      setTimeout(() => {
        paymentService.redirectToPayment(paymentUrl)
      }, 1000)
    } catch (error) {
      console.error("[v0] Error creating payment link:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar el pago. Intentá nuevamente.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-0 card-elevated-lg rounded-2xl p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <DialogHeader>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-1">
              Resumen del Pedido
            </p>
            <DialogTitle className="text-3xl font-serif font-bold text-foreground italic">Tu Selección</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Revisá tu selección de pastas antes de pagar.
            </DialogDescription>
          </DialogHeader>
        </div>

        <Separator className="bg-border/50" />

        <div className="p-6 space-y-4 max-h-[280px] overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center">
                  <Package className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground font-serif">{item.name}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {item.category} · Cant: {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-foreground">${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-border/50" />

        {deliveryDate && (
          <>
            <div className="px-6 py-4 bg-secondary/30">
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">Entrega</p>
              <p className="font-medium text-foreground">
                {deliveryDate} · <span className="text-muted-foreground">{timeSlot}</span>
              </p>
            </div>
            <Separator className="bg-border/50" />
          </>
        )}

        <div className="p-6 space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium">Total Mensual</p>
              <p className="text-xs text-muted-foreground mt-1">
                {totalItems} {totalItems === 1 ? "caja" : "cajas"} seleccionadas
              </p>
            </div>
            <p className="text-4xl font-serif font-bold text-foreground">${totalPrice.toLocaleString()}</p>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-6 text-base font-semibold rounded-xl transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: "#009EE3", color: "#FFFFFF" }}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            {isProcessing ? "Procesando..." : "Pagar con Mercado Pago"}
          </Button>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-[#009EE3]" />
            <span>Pago seguro procesado por Mercado Pago</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
