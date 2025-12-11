"use client"

import { useState } from "react"
import { Check, Package, MapPin, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

interface Order {
  id: number
  userName: string
  address: string
  boxContent: string
  status: "Pendiente" | "Entregado"
}

// Dummy delivery data
const initialOrders: Order[] = [
  {
    id: 1,
    userName: "Mario Rossi",
    address: "Av. Corrientes 1234, CABA",
    boxContent: "2x Spaghetti, 3x Ravioles Ricota",
    status: "Pendiente",
  },
  {
    id: 2,
    userName: "Giulia Bianchi",
    address: "Av. Santa Fe 456, CABA",
    boxContent: "4x Fettuccine, 2x Tortellini",
    status: "Pendiente",
  },
  {
    id: 3,
    userName: "Luca Verdi",
    address: "Av. Cabildo 789, CABA",
    boxContent: "1x Tagliatelle Trufa, 2x Penne",
    status: "Pendiente",
  },
  {
    id: 4,
    userName: "Sofia Colombo",
    address: "Av. Rivadavia 321, CABA",
    boxContent: "3x Sorrentinos, 2x Agnolotti",
    status: "Entregado",
  },
  {
    id: 5,
    userName: "Marco Ferrari",
    address: "Av. Belgrano 654, CABA",
    boxContent: "2x Ravioles Langosta, 1x Pappardelle",
    status: "Pendiente",
  },
  {
    id: 6,
    userName: "Elena Ricci",
    address: "Av. Callao 987, CABA",
    boxContent: "4x Mix Clásica, 2x Premium",
    status: "Entregado",
  },
  {
    id: 7,
    userName: "Andrea Marino",
    address: "Av. Pueyrredón 147, CABA",
    boxContent: "3x Mix Rellena, 1x Spaghetti",
    status: "Pendiente",
  },
  {
    id: 8,
    userName: "Chiara Greco",
    address: "Av. Las Heras 258, CABA",
    boxContent: "2x Ravioles, 2x Tortellini, 2x Penne",
    status: "Pendiente",
  },
]

export function DeliveryLogistics() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const { toast } = useToast()

  const pendingCount = orders.filter((o) => o.status === "Pendiente").length
  const deliveredCount = orders.filter((o) => o.status === "Entregado").length

  const handleMarkDeliveredClick = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowDeliveryDialog(true)
  }

  const handleConfirmDelivered = () => {
    if (selectedOrderId) {
      setOrders((prev) =>
        prev.map((order) => (order.id === selectedOrderId ? { ...order, status: "Entregado" as const } : order)),
      )

      toast({ title: "Pedido entregado", description: `Pedido #${selectedOrderId} marcado como entregado.` })
    }
    setShowDeliveryDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Entregas</p>
        <h1 className="text-3xl font-serif italic text-foreground">Logística de Entregas</h1>
        <p className="text-sm text-muted-foreground mt-1">Pedidos listos para despachar</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <Package className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Total Pedidos</p>
              <p className="text-2xl font-serif font-bold text-foreground">{orders.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Pendientes</p>
              <p className="text-2xl font-serif font-bold text-amber-700">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-emerald-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Entregados</p>
              <p className="text-2xl font-serif font-bold text-emerald-700">{deliveredCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table - Desktop */}
      <Card className="hidden lg:block card-elevated rounded-xl border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif italic flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Pedidos para Despachar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Cliente
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Dirección
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Contenido
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Estado
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} className="border-border/30">
                    <TableCell className="font-medium text-foreground">{order.userName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">
                      {order.address}
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80 max-w-[200px]">
                      <span className="line-clamp-1">{order.boxContent}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-lg font-medium",
                          order.status === "Pendiente"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800",
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "Pendiente" ? (
                        <Button
                          size="sm"
                          onClick={() => handleMarkDeliveredClick(order.id)}
                          className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Marcar Entregado
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Completado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Orders Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <h2 className="text-lg font-serif italic text-foreground">Pedidos para Despachar</h2>
        </div>
        {orders.map((order) => (
          <Card key={order.id} className="card-elevated rounded-2xl border-0">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="font-serif font-semibold text-lg text-foreground mb-1">{order.userName}</p>
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{order.address}</span>
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "rounded-lg font-medium shrink-0",
                    order.status === "Pendiente" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
                  )}
                >
                  {order.status}
                </Badge>
              </div>

              <div className="pt-3 border-t border-border/50">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">
                  Contenido
                </p>
                <p className="text-sm text-foreground">{order.boxContent}</p>
              </div>

              {order.status === "Pendiente" && (
                <Button
                  size="sm"
                  onClick={() => handleMarkDeliveredClick(order.id)}
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-5"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Marcar como Entregado
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delivery Confirmation Dialog */}
      <AlertDialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <AlertDialogContent className="rounded-2xl border-0 card-elevated-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl italic text-foreground">
              ¿Confirmar entrega?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-muted-foreground">
              Estás por marcar el pedido #{selectedOrderId} como entregado. Esta acción actualizará el estado del
              pedido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelivered}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              Sí, Marcar como Entregado
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
