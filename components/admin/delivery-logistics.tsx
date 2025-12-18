"use client"

import { useState, useEffect, useMemo } from "react"
import { Check, Package, MapPin, Eye, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
import { ordersService } from "@/services"
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  addMonths, 
  subMonths, 
  isSameWeek, 
  parseISO,
  isBefore 
} from "date-fns"
import { es } from "date-fns/locale"

// Interfaces
interface OrderItem {
  name: string
  quantity: number
}

interface Order {
  id: number
  userName: string
  address: string
  boxContent: string
  status: "PENDIENTE" | "ENTREGADO"
  deliveryDateString: string 
  rawDate: Date 
  items?: OrderItem[]
}

interface WeekGroup {
  id: string
  startDate: Date
  endDate: Date
  isCurrentWeek: boolean
  isPast: boolean
  orders: Order[]
}

export function DeliveryLogistics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [currentViewDate, setCurrentViewDate] = useState(new Date())

  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const { toast } = useToast()

  // 1. FETCH DATA
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const data = await ordersService.getAll()
        
        const formattedOrders = data.map((order: any) => {
          const dateObj = typeof order.deliveryDate === 'string' ? parseISO(order.deliveryDate) : new Date(order.deliveryDate)
          return {
            id: order.id,
            userName: order.comprador,
            address: order.deliveryAddress,
            boxContent: order.items.map((item: any) => `${item.quantity}x ${item.productName}`).join(", "),
            status: order.status,
            rawDate: dateObj,
            deliveryDateString: format(dateObj, "dd 'de' MMM", { locale: es }),
            items: order.items.map((item: any) => ({
              name: item.productName,
              quantity: item.quantity,
            })),
          }
        })
        setOrders(formattedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({ title: "Error", description: "No se pudieron cargar los pedidos", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // 2. AGRUPAMIENTO
  const groupedOrders = useMemo(() => {
    const ordersInMonth = orders.filter(o => isSameMonth(o.rawDate, currentViewDate))
    const groups: Record<string, WeekGroup> = {}

    ordersInMonth.forEach(order => {
      const weekStart = startOfWeek(order.rawDate, { weekStartsOn: 1 }) 
      const weekKey = weekStart.toISOString()

      if (!groups[weekKey]) {
        groups[weekKey] = {
          id: weekKey,
          startDate: weekStart,
          endDate: endOfWeek(order.rawDate, { weekStartsOn: 1 }),
          isCurrentWeek: isSameWeek(weekStart, new Date(), { weekStartsOn: 1 }),
          isPast: isBefore(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 })),
          orders: []
        }
      }
      groups[weekKey].orders.push(order)
    })

    let groupsArray = Object.values(groups)
    groupsArray.forEach(g => g.orders.sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime()))

    const isCurrentMonthView = isSameMonth(currentViewDate, new Date())
    if (isCurrentMonthView) {
      groupsArray.sort((a, b) => {
        if (a.isCurrentWeek) return -1
        if (b.isCurrentWeek) return 1
        if (!a.isPast && b.isPast) return -1
        if (a.isPast && !b.isPast) return 1
        return a.startDate.getTime() - b.startDate.getTime()
      })
    } else {
      groupsArray.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    }

    return groupsArray
  }, [orders, currentViewDate])

  const handlePrevMonth = () => setCurrentViewDate(prev => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentViewDate(prev => addMonths(prev, 1))
  const handleCurrentMonth = () => setCurrentViewDate(new Date())

  const handleMarkDeliveredClick = (orderId: number) => {
    setSelectedOrderId(orderId)
    setShowDeliveryDialog(true)
  }

  const handleConfirmDelivered = async () => {
    if (selectedOrderId) {
      try {
        await ordersService.markAsDelivered(selectedOrderId)
        setOrders((prev) =>
          prev.map((order) => (order.id === selectedOrderId ? { ...order, status: "ENTREGADO" as const } : order)),
        )
        toast({ title: "Pedido entregado", description: `Pedido #${selectedOrderId} marcado como entregado.` })
      } catch (error) {
        toast({ title: "Error", description: "No se pudo marcar como entregado", variant: "destructive" })
      }
    }
    setShowDeliveryDialog(false)
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setIsDetailsOpen(true)
  }

  if (loading) {
    return <div className="space-y-6 p-8"><div className="h-10 w-48 bg-secondary/40 rounded animate-pulse" /><div className="h-64 bg-secondary/40 rounded animate-pulse" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Header y Filtro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Entregas</p>
          <h1 className="text-3xl font-serif italic text-foreground">Logística de Entregas</h1>
        </div>

        <div className="flex items-center bg-card border border-border/50 rounded-xl p-1 shadow-sm">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <div className="px-4 min-w-[140px] text-center">
                <span className="font-medium capitalize block">{format(currentViewDate, "MMMM yyyy", { locale: es })}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth}><ChevronRight className="h-4 w-4" /></Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button variant="ghost" size="sm" onClick={handleCurrentMonth} className="text-xs">Hoy</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <Package className="h-5 w-5 text-foreground" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Total Mes</p>
              <p className="text-2xl font-serif font-bold text-foreground">
                {orders.filter(o => isSameMonth(o.rawDate, currentViewDate)).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- LISTA DE SEMANAS --- */}
      <div className="space-y-8">
        {groupedOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No hay pedidos para este mes.</p>
            </div>
        ) : (
            groupedOrders.map((group) => (
                <div key={group.id} className={cn("space-y-3 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4")}>
                    
                    {/* ENCABEZADO DE LA SEMANA */}
                    <div className="flex items-center gap-3 px-1">
                        <div className={cn("h-2 w-2 rounded-full", group.isCurrentWeek ? "bg-primary animate-pulse" : "bg-muted-foreground/30")} />
                        <h3 className={cn("text-lg font-medium", group.isCurrentWeek ? "text-primary font-bold" : "text-muted-foreground")}>
                            {group.isCurrentWeek ? "Esta Semana" : `Semana del ${format(group.startDate, "d")} al ${format(group.endDate, "d 'de' MMMM", { locale: es })}`}
                        </h3>
                        {group.isCurrentWeek && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Prioridad</Badge>}
                    </div>

                    {/* VISTA ESCRITORIO (TABLA) */}
                    <Card className={cn("hidden lg:block card-elevated rounded-xl border-0 overflow-hidden", group.isCurrentWeek && "ring-2 ring-primary/20 shadow-lg")}>
                        <CardContent className="p-0">
                             <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-secondary/20">
                                        <TableRow className="border-border/50 hover:bg-transparent">
                                            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Cliente</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Día</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Dirección</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Contenido</TableHead>
                                            <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Estado</TableHead>
                                            <TableHead className="text-right">Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.orders.map((order) => (
                                            <TableRow key={order.id} className="border-border/30 hover:bg-secondary/10">
                                                <TableCell className="font-medium text-foreground">{order.userName}</TableCell>
                                                <TableCell className="text-sm font-medium">{format(order.rawDate, "EEE d", { locale: es })}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm max-w-[180px] truncate">{order.address}</TableCell>
                                                <TableCell className="text-sm text-foreground/80 max-w-[200px] truncate">{order.boxContent}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={cn("rounded-lg font-medium", order.status === "PENDIENTE" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="sm" variant="ghost" onClick={() => handleViewDetails(order)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {order.status === "PENDIENTE" && (
                                                            <Button size="sm" onClick={() => handleMarkDeliveredClick(order.id)} className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-3">
                                                                <Check className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                             </div>
                        </CardContent>
                    </Card>

                    {/* VISTA MÓVIL (TUS TARJETAS INTEGRADAS) */}
                    {/* Aquí iteramos sobre group.orders para mantener la separación por semanas */}
                    <div className="lg:hidden space-y-4 pt-2">
                        {group.orders.map((order) => (
                          <Card key={order.id} className="card-elevated rounded-2xl border-0">
                            <CardContent className="p-5 space-y-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <p className="font-serif font-semibold text-lg text-foreground mb-1">{order.userName}</p>
                                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{order.address}</span>
                                  </p>
                                  {/* Agregué la fecha aquí para contexto en mobile */}
                                  <p className="text-xs text-primary font-medium mt-1 flex items-center gap-2">
                                     <Calendar className="h-3 w-3" />
                                     {format(order.rawDate, "EEEE d", { locale: es })}
                                  </p>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "rounded-lg font-medium shrink-0",
                                    order.status === "PENDIENTE" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800",
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

                              <div className="flex gap-3">
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="flex-1 rounded-xl py-5"
                                    onClick={() => handleViewDetails(order)}
                                >
                                    <Eye className="h-4 w-4 mr-2" /> Detalle
                                </Button>
                                {order.status === "PENDIENTE" && (
                                    <Button
                                    size="sm"
                                    onClick={() => handleMarkDeliveredClick(order.id)}
                                    className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground py-5"
                                    >
                                    <Check className="h-4 w-4 mr-2" />
                                    Entregado
                                    </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>

      <AlertDialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <AlertDialogContent className="rounded-2xl border-0 card-elevated-lg">
             <AlertDialogHeader>
                <AlertDialogTitle>¿Confirmar entrega?</AlertDialogTitle>
                <AlertDialogDescription>Marcar pedido #{selectedOrderId} como entregado.</AlertDialogDescription>
             </AlertDialogHeader>
             <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelivered} className="rounded-xl">Confirmar</AlertDialogAction>
             </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  <Badge variant="secondary" className={cn("rounded-lg font-medium w-fit", selectedOrder.status === "PENDIENTE" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800")}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-secondary/30 rounded-xl">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Cliente</p>
                  <p className="text-lg font-serif font-semibold text-foreground">{selectedOrder.userName}</p>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Dirección</p>
                    <p className="text-foreground font-medium">{selectedOrder.address}</p>
                  </div>
                </div>
              </div>

              {selectedOrder.items && (
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Productos</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold">{item.quantity}</span>
                        </div>
                        <p className="font-medium text-foreground">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}