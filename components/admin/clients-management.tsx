"use client"

import { useState } from "react"
import { Search, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

const clientsData = [
  { id: 1, name: "Mario Rossi", plan: "Famiglia", status: "Activo", joinedDate: "15 Ene 2025" },
  { id: 2, name: "Lucia Bianchi", plan: "Medio", status: "Activo", joinedDate: "8 Ene 2025" },
  { id: 3, name: "Giuseppe Verdi", plan: "Piccolo", status: "Pausado", joinedDate: "3 Dic 2024" },
  { id: 4, name: "Sofia Ferrari", plan: "Famiglia", status: "Activo", joinedDate: "28 Nov 2024" },
  { id: 5, name: "Alessandro Conti", plan: "Medio", status: "Activo", joinedDate: "20 Nov 2024" },
  { id: 6, name: "Francesca Romano", plan: "Famiglia", status: "Activo", joinedDate: "15 Nov 2024" },
  { id: 7, name: "Marco Esposito", plan: "Piccolo", status: "Activo", joinedDate: "10 Nov 2024" },
]

const statusColors: Record<string, string> = {
  Activo: "bg-emerald-100 text-emerald-800",
  Pausado: "bg-amber-100 text-amber-800",
}

export function ClientsManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [planFilter, setPlanFilter] = useState<string>("all")

  const filteredClients = clientsData.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPlan = planFilter === "all" || client.plan === planFilter
    return matchesSearch && matchesPlan
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Administración</p>
        <h1 className="text-3xl font-serif italic text-foreground">Gestión de Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Listado de suscriptores y sus planes activos</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl bg-transparent"
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full md:w-48 rounded-xl bg-transparent">
            <SelectValue placeholder="Filtrar por plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los planes</SelectItem>
            <SelectItem value="Famiglia">Famiglia</SelectItem>
            <SelectItem value="Medio">Medio</SelectItem>
            <SelectItem value="Piccolo">Piccolo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 card-elevated-lg rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif italic flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Clientes ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Cliente
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Plan Actual
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Estado
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Fecha de Alta
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} className="border-border/30">
                    <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                    <TableCell>
                      <span className="font-serif italic text-foreground">{client.plan}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn("rounded-lg font-medium", statusColors[client.status])}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{client.joinedDate}</TableCell>
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
