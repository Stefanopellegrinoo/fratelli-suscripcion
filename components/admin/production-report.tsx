"use client"

import { useState, useEffect, useMemo } from "react"
import { format, startOfWeek, endOfWeek, isSameMonth, addMonths, subMonths, isSameWeek, parseISO, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { ChefHat, Calendar, ChevronLeft, ChevronRight, Package, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { ordersService, productsService } from "@/services"

// Definimos colores por categoría
const categoryColors: Record<string, string> = {
  Clásica: "bg-secondary text-secondary-foreground",
  Rellena: "bg-primary/10 text-primary",
  Premium: "bg-accent/20 text-accent",
}

// Interfaces para la lógica de agrupación
interface ProductInfo {
  id: number
  name: string
  category: string
  inStock: boolean
}

interface ProductionItem {
  productId: number
  name: string
  category: string
  units: number
  inStock: boolean
}

interface WeekGroup {
  id: string
  startDate: Date
  endDate: Date
  isCurrentWeek: boolean
  isPast: boolean
  items: ProductionItem[] // Lista de QUÉ cocinar esa semana
}

export function ProductionReport() {
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState(true)
  
  // Datos crudos
  const [orders, setOrders] = useState<any[]>([])
  const [productsMap, setProductsMap] = useState<Record<number, ProductInfo>>({})
  
  const { toast } = useToast()

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Ejecutamos en paralelo para velocidad
        const [ordersData, productsData] = await Promise.all([
            ordersService.getAll(),
            productsService.getAll()
        ])

        // A. Mapa de Productos (para saber categoría y stock rápido)
        const pMap: Record<number, ProductInfo> = {}
        productsData.forEach((p: any) => {
            pMap[p.id] = { 
                id: p.id, 
                name: p.name, 
                category: p.category || "Clásica", // Fallback
                inStock: p.inStock ?? true 
            }
        })
        setProductsMap(pMap)

        // B. Guardamos órdenes crudas (el filtrado lo hacemos en memoria)
        setOrders(ordersData)

      } catch (error) {
        console.error("Error loading data:", error)
        toast({ title: "Error", description: "No se pudieron cargar los datos de producción", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 2. LÓGICA DE AGRUPACIÓN (Hooks potentes)
  const { weeklyProduction, monthlyTotals } = useMemo(() => {
    if (orders.length === 0 || Object.keys(productsMap).length === 0) {
        return { weeklyProduction: [], monthlyTotals: { total: 0, byCategory: {} as Record<string, number> } }
    }

    // A. Filtrar órdenes del mes seleccionado que NO estén canceladas
    const monthOrders = orders.filter(o => {
        const d = typeof o.deliveryDate === 'string' ? parseISO(o.deliveryDate) : new Date(o.deliveryDate)
        return isSameMonth(d, currentViewDate) && o.status !== "CANCELADO"
    })

    // B. Estructuras para acumular
    const weeksMap: Record<string, WeekGroup> = {}
    const totalByCategory: Record<string, number> = { Clásica: 0, Rellena: 0, Premium: 0 }
    let grandTotal = 0

    // C. Iterar Órdenes -> Items
    monthOrders.forEach(order => {
        const dateObj = typeof order.deliveryDate === 'string' ? parseISO(order.deliveryDate) : new Date(order.deliveryDate)
        
        // Identificar Semana
        const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 })
        const weekKey = weekStart.toISOString()

        // Inicializar grupo de semana si no existe
        if (!weeksMap[weekKey]) {
            weeksMap[weekKey] = {
                id: weekKey,
                startDate: weekStart,
                endDate: endOfWeek(dateObj, { weekStartsOn: 1 }),
                isCurrentWeek: isSameWeek(weekStart, new Date(), { weekStartsOn: 1 }),
                isPast: isBefore(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 })),
                items: [] // Aquí acumularemos los productos
            }
        }

        // Procesar Items del pedido
        order.items.forEach((item: any) => {
            const pid = item.productId || item.productoId // Compatibilidad de nombres
            const productInfo = productsMap[pid]
            
            if (productInfo) {
                const qty = item.quantity
                
                // 1. Acumular al Total Mensual
                grandTotal += qty
                totalByCategory[productInfo.category] = (totalByCategory[productInfo.category] || 0) + qty

                // 2. Acumular a la Semana Específica
                const weekItems = weeksMap[weekKey].items
                const existingItem = weekItems.find(i => i.productId === pid)

                if (existingItem) {
                    existingItem.units += qty
                } else {
                    weekItems.push({
                        productId: pid,
                        name: productInfo.name,
                        category: productInfo.category,
                        units: qty,
                        inStock: productInfo.inStock
                    })
                }
            }
        })
    })

    // D. Ordenar Resultados
    const sortedWeeks = Object.values(weeksMap).sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    
    // Ordenar productos dentro de cada semana (por categoría y nombre)
    sortedWeeks.forEach(w => {
        w.items.sort((a, b) => {
            if (a.category !== b.category) return a.category.localeCompare(b.category)
            return a.name.localeCompare(b.name)
        })
    })

    return {
        weeklyProduction: sortedWeeks,
        monthlyTotals: { total: grandTotal, byCategory: totalByCategory }
    }

  }, [orders, productsMap, currentViewDate])


  // Handlers
  const handlePrevMonth = () => setCurrentViewDate(prev => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentViewDate(prev => addMonths(prev, 1))
  const handleCurrentMonth = () => setCurrentViewDate(new Date())

  // Toggle Stock (Actualiza globalmente)
  const handleStockToggle = async (productId: number, currentStatus: boolean) => {
    // Optimistic Update
    const newStatus = !currentStatus
    setProductsMap(prev => ({
        ...prev,
        [productId]: { ...prev[productId], inStock: newStatus }
    }))

    try {
      await productsService.toggleStock(productId, newStatus)
      toast({ title: "Stock actualizado", description: "Estado de producto modificado correctamente." })
    } catch (error) {
      // Revertir si falla
      setProductsMap(prev => ({
        ...prev,
        [productId]: { ...prev[productId], inStock: currentStatus }
    }))
      toast({ title: "Error", description: "No se pudo actualizar el stock", variant: "destructive" })
    }
  }

  if (loading) {
    return <div className="space-y-6 p-8"><div className="h-10 w-48 bg-secondary/40 rounded animate-pulse" /><div className="grid grid-cols-4 gap-4"><div className="h-24 bg-secondary/40 rounded animate-pulse" /><div className="h-24 bg-secondary/40 rounded animate-pulse" /></div></div>
  }

  return (
    <div className="space-y-8">
      {/* Header y Selector de Mes */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Cocina</p>
          <h1 className="text-3xl font-serif italic text-foreground">Plan de Producción</h1>
          <p className="text-sm text-muted-foreground mt-1">Qué cocinar mes a mes y semana a semana</p>
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

      {/* Tarjetas de Totales Mensuales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-elevated rounded-xl border-0 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Total Mes</p>
            <p className="text-3xl font-serif font-bold text-primary mt-1">{monthlyTotals.total}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Clásica</p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">{monthlyTotals.byCategory["CLASICA"] || 0}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Rellena</p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">{monthlyTotals.byCategory["RELLENA"] || 0}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Premium</p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">{monthlyTotals.byCategory["PREMIUM"] || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* LISTADO SEMANAL */}
      <div className="space-y-8">
        {weeklyProduction.length === 0 ? (
             <div className="text-center py-16 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                <ChefHat className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No hay pedidos programados para este mes.</p>
                <p className="text-xs mt-1">Esperando nuevas órdenes...</p>
            </div>
        ) : (
            weeklyProduction.map((week) => (
                <div key={week.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Título de la Semana */}
                    <div className="flex items-center gap-3 mb-3 px-1">
                         <div className={cn("h-2 w-2 rounded-full", week.isCurrentWeek ? "bg-primary animate-pulse" : "bg-muted-foreground/30")} />
                         <h3 className={cn("text-lg font-medium", week.isCurrentWeek ? "text-primary font-bold" : "text-muted-foreground")}>
                            {week.isCurrentWeek ? "Producción para Esta Semana" : `Semana del ${format(week.startDate, "d")} al ${format(week.endDate, "d 'de' MMMM", { locale: es })}`}
                         </h3>
                    </div>

                    {/* Tabla de Producción Semanal */}
                    <Card className={cn("card-elevated rounded-xl border-0 overflow-hidden", week.isCurrentWeek && "ring-2 ring-primary/20 shadow-lg")}>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader className="bg-secondary/20">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                  <TableHead className="w-[40%] text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Producto</TableHead>
                                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Categoría</TableHead>
                                  <TableHead className="text-right text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">A Producir</TableHead>
                                  <TableHead className="text-center text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Stock Global</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {week.items.map((item) => (
                                  <TableRow key={item.productId} className="border-border/30 hover:bg-secondary/10">
                                    <TableCell className="font-medium text-foreground">
                                        {item.name}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary" className={cn("rounded-lg font-medium", categoryColors[item.category])}>
                                        {item.category}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <span className="font-serif font-bold text-lg text-foreground">{item.units}</span>
                                      <span className="text-muted-foreground text-xs ml-1">u</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <Switch
                                          checked={productsMap[item.productId]?.inStock ?? true}
                                          onCheckedChange={(checked) => handleStockToggle(item.productId, checked)}
                                          className="scale-90"
                                        />
                                        <Label className={cn("text-xs w-16 text-left", productsMap[item.productId]?.inStock ? "text-emerald-600 font-medium" : "text-destructive font-medium")}>
                                          {productsMap[item.productId]?.inStock ? "Disponible" : "Agotado"}
                                        </Label>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                    </Card>
                </div>
            ))
        )}
      </div>
    </div>
  )
}