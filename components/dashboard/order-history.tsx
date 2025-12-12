"use client"

import { useState, useEffect } from "react"
import { Eye, Package, PackageOpen, MapPin, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ordersService } from "@/services"
import { useToast } from "@/hooks/use-toast"

interface OrderItem {
  name: string
  quantity: number
  price: string
}

interface Order {
  id: number
  date: string
  summary: string
  total: string
  status: "Entregado" | "En Camino" | "Preparando"
  deliveryAddress?: string
  deliveryTime?: string
  items: OrderItem[]
}

const statusColors: Record<Order["status"], string> = {
  Entregado: "bg-emerald-100 text-emerald-800",
  "En Camino": "bg-amber-100 text-amber-800",
  Preparando: "bg-blue-100 text-blue-800",
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await ordersService.getMyOrders()
        const formattedOrders = data.map((order) => ({
          id: order.id,
          date: new Date(order.deliveryDate).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          summary: order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", "),
          total: `$${order.totalAmount.toLocaleString("es-AR")}`,
          status:
            order.status === "DELIVERED"
              ? ("Entregado" as const)
              : order.status === "PENDING"
                ? ("En Camino" as const)
                : ("Preparando" as const),
          deliveryAddress: order.deliveryAddress,
          deliveryTime: order.deliveryTime,
          items: order.items.map((item) => ({
            name: item.productName,
            quantity: item.quantity,
            price: `$${item.price.toLocaleString("es-AR")}`,
          })),
        }))
        setOrders(formattedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const hasOrders = orders.length > 0

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
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

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Tus Entregas</p>
        <h1 className="text-4xl font-serif font-bold text-foreground italic">Historial de Pedidos</h1>
        <p className="text-muted-foreground text-lg mt-3">Revisá tus entregas anteriores y repetí tus favoritos.</p>
      </div>

      <Card className="border-0 card-elevated-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-serif italic flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Pedidos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasOrders ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <PackageOpen className="h-16 w-16 text-muted-foreground/40 mb-4" strokeWidth={1.5} />
              <h3 className="text-lg font-serif font-semibold text-foreground mb-2">Aún no tenés pedidos</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Una vez que realices tu primer pedido, lo verás listado aquí.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-secondary/30 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-serif font-semibold text-foreground text-lg">{order.date}</p>
                    <Badge variant="secondary" className={cn("rounded-lg font-medium", statusColors[order.status])}>
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.summary}</p>
                </div>
                <div className="flex items-center gap-4 justify-between md:justify-end">
                  <p className="text-xl font-serif font-bold text-foreground">{order.total}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                    onClick={() => handleViewDetails(order)}
                  >
                    <Eye className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Ver Detalle</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl rounded-2xl border-0 card-elevated-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-serif font-bold text-foreground italic">
              Detalle del Pedido
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                    Número de Pedido
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    #{selectedOrder.id.toString().padStart(6, "0")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Estado</p>
                  <Badge
                    variant="secondary"
                    className={cn("rounded-lg font-medium w-fit", statusColors[selectedOrder.status])}
                  >
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                      Fecha de Entrega
                    </p>
                    <p className="text-foreground font-medium">
                      {selectedOrder.date} · {selectedOrder.deliveryTime}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Dirección</p>
                    <p className="text-foreground font-medium">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Productos</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">{item.quantity}</span>
                        </div>
                        <p className="font-medium text-foreground">{item.name}</p>
                      </div>
                      <p className="font-serif font-semibold text-foreground">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <p className="text-lg font-medium text-muted-foreground">Total</p>
                </div>
                <p className="text-3xl font-serif font-bold text-foreground">{selectedOrder.total}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl py-6 bg-transparent"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Cerrar
                </Button>
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-6">
                  Repetir Pedido
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
