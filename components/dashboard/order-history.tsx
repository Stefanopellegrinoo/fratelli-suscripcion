"use client"

import { useState } from "react"
import { Eye, Package, PackageOpen, MapPin, Calendar, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

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

const orderHistory: Order[] = [
  {
    id: 1,
    date: "15 Oct 2025",
    summary: "4x Fettuccine, 2x Sorrentinos, 2x Ravioles",
    total: "$38.000",
    status: "Entregado",
    deliveryAddress: "Av. Corrientes 1234, Buenos Aires",
    deliveryTime: "14:30 hs",
    items: [
      { name: "Fettuccine", quantity: 4, price: "$14.000" },
      { name: "Sorrentinos Jamón y Queso", quantity: 2, price: "$11.000" },
      { name: "Ravioles Ricota y Espinaca", quantity: 2, price: "$11.000" },
    ],
  },
  {
    id: 2,
    date: "8 Oct 2025",
    summary: "3x Spaghetti, 3x Agnolotti, 2x Penne",
    total: "$36.000",
    status: "Entregado",
    deliveryAddress: "Av. Corrientes 1234, Buenos Aires",
    deliveryTime: "16:45 hs",
    items: [
      { name: "Spaghetti", quantity: 3, price: "$10.500" },
      { name: "Agnolotti del Plin", quantity: 3, price: "$15.000" },
      { name: "Penne", quantity: 2, price: "$7.000" },
    ],
  },
  {
    id: 3,
    date: "1 Oct 2025",
    summary: "2x Tagliatelle Trufa, 4x Ravioles Ricota, 2x Fettuccine",
    total: "$45.000",
    status: "Entregado",
    deliveryAddress: "Av. Corrientes 1234, Buenos Aires",
    deliveryTime: "15:20 hs",
    items: [
      { name: "Tagliatelle con Trufa", quantity: 2, price: "$17.000" },
      { name: "Ravioles Ricota y Espinaca", quantity: 4, price: "$20.000" },
      { name: "Fettuccine", quantity: 2, price: "$7.000" },
    ],
  },
  {
    id: 4,
    date: "24 Sep 2025",
    summary: "6x Sorrentinos Jamón, 2x Penne",
    total: "$40.000",
    status: "Entregado",
    deliveryAddress: "Av. Corrientes 1234, Buenos Aires",
    deliveryTime: "17:10 hs",
    items: [
      { name: "Sorrentinos Jamón y Queso", quantity: 6, price: "$33.000" },
      { name: "Penne", quantity: 2, price: "$7.000" },
    ],
  },
  {
    id: 5,
    date: "17 Sep 2025",
    summary: "4x Spaghetti, 4x Fettuccine",
    total: "$28.000",
    status: "Entregado",
    deliveryAddress: "Av. Corrientes 1234, Buenos Aires",
    deliveryTime: "14:00 hs",
    items: [
      { name: "Spaghetti", quantity: 4, price: "$14.000" },
      { name: "Fettuccine", quantity: 4, price: "$14.000" },
    ],
  },
]

const statusColors: Record<Order["status"], string> = {
  Entregado: "bg-emerald-100 text-emerald-800",
  "En Camino": "bg-amber-100 text-amber-800",
  Preparando: "bg-blue-100 text-blue-800",
}

export function OrderHistory() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const hasOrders = orderHistory.length > 0

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
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
            orderHistory.map((order) => (
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
