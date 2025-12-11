"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChefHat } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const productionData = [
  { id: 1, name: "Spaghetti", category: "Clásica", units: 85, inStock: true },
  { id: 2, name: "Fettuccine", category: "Clásica", units: 62, inStock: true },
  { id: 3, name: "Penne", category: "Clásica", units: 48, inStock: true },
  { id: 4, name: "Sorrentinos Jamón y Queso", category: "Rellena", units: 150, inStock: true },
  { id: 5, name: "Ravioles Ricota y Espinaca", category: "Rellena", units: 124, inStock: true },
  { id: 6, name: "Tortellini Boloñesa", category: "Rellena", units: 98, inStock: true },
  { id: 7, name: "Agnolotti del Plin", category: "Rellena", units: 76, inStock: true },
  { id: 8, name: "Tagliatelle Trufa", category: "Premium", units: 32, inStock: false },
  { id: 9, name: "Ravioles de Langosta", category: "Premium", units: 28, inStock: true },
  { id: 10, name: "Pappardelle Porcini", category: "Premium", units: 24, inStock: true },
]

const categoryColors: Record<string, string> = {
  Clásica: "bg-secondary text-secondary-foreground",
  Rellena: "bg-primary/10 text-primary",
  Premium: "bg-accent/20 text-accent",
}

export function ProductionReport() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [stockStatus, setStockStatus] = useState<Record<number, boolean>>(
    Object.fromEntries(productionData.map((p) => [p.id, p.inStock])),
  )
  const { toast } = useToast()

  const totalUnits = productionData.reduce((sum, item) => sum + item.units, 0)

  const handleStockToggle = (productId: number, newStatus: boolean) => {
    setStockStatus((prev) => ({ ...prev, [productId]: newStatus }))
    const product = productionData.find((p) => p.id === productId)
    toast({
      title: "Stock actualizado",
      description: `${product?.name} marcado como ${newStatus ? "disponible" : "agotado"}`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Cocina</p>
          <h1 className="text-3xl font-serif italic text-foreground">Lista de Producción</h1>
          <p className="text-sm text-muted-foreground mt-1">Qué cocinar para las entregas del día</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-xl bg-transparent">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 rounded-xl" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Total Unidades</p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">{totalUnits}</p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Clásica</p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">
              {productionData.filter((p) => p.category === "Clásica").reduce((s, p) => s + p.units, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Rellena</p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">
              {productionData.filter((p) => p.category === "Rellena").reduce((s, p) => s + p.units, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-elevated rounded-xl border-0">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Premium</p>
            <p className="text-3xl font-serif font-bold text-foreground mt-1">
              {productionData.filter((p) => p.category === "Premium").reduce((s, p) => s + p.units, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-elevated rounded-xl border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif italic flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Lista de Cocina · Gestión de Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Producto
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Categoría
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right">
                    Unidades
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-center">
                    Stock
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionData.map((item) => (
                  <TableRow key={item.id} className="border-border/30">
                    <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("rounded-lg font-medium", categoryColors[item.category])}
                      >
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-serif font-bold text-lg text-foreground">{item.units}</span>
                      <span className="text-muted-foreground text-sm ml-1">u</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={stockStatus[item.id]}
                          onCheckedChange={(checked) => handleStockToggle(item.id, checked)}
                        />
                        <Label className="text-xs text-muted-foreground cursor-pointer">
                          {stockStatus[item.id] ? "Disponible" : "Agotado"}
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
  )
}
