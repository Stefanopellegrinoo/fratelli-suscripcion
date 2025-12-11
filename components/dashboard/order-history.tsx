"use client"

import { Eye, Package, PackageOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Order {
  id: number
  date: string
  summary: string
  total: string
  status: "Entregado" | "En Camino" | "Preparando"
}

const orderHistory: Order[] = [
  {
    id: 1,
    date: "15 Oct 2025",
    summary: "4x Fettuccine, 2x Sorrentinos, 2x Ravioles",
    total: "$38.000",
    status: "Entregado",
  },
  { id: 2, date: "8 Oct 2025", summary: "3x Spaghetti, 3x Agnolotti, 2x Penne", total: "$36.000", status: "Entregado" },
  {
    id: 3,
    date: "1 Oct 2025",
    summary: "2x Tagliatelle Trufa, 4x Ravioles Ricota, 2x Fettuccine",
    total: "$45.000",
    status: "Entregado",
  },
  { id: 4, date: "24 Sep 2025", summary: "6x Sorrentinos Jamón, 2x Penne", total: "$40.000", status: "Entregado" },
  { id: 5, date: "17 Sep 2025", summary: "4x Spaghetti, 4x Fettuccine", total: "$28.000", status: "Entregado" },
]

const statusColors: Record<Order["status"], string> = {
  Entregado: "bg-emerald-100 text-emerald-800",
  "En Camino": "bg-amber-100 text-amber-800",
  Preparando: "bg-blue-100 text-blue-800",
}

export function OrderHistory() {
  const hasOrders = orderHistory.length > 0

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
    </div>
  )
}
