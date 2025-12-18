"use client"

import { useState, useEffect } from "react"
import { Search, Users, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { plansService, usersService } from "@/services"

// Interfaces del Frontend
interface Client {
  id: number
  name: string
  email: string
  plan: string | null
  status: string 
  joinedDate: string
}

// Mapa de colores actualizado con los nuevos estados
const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200", // Activo
  PAUSED: "bg-amber-100 text-amber-800 border-amber-200",       // Pausado
  CANCELLED: "bg-red-50 text-red-700 border-red-200",           // Cancelado
  SIN_SUSCRIPCION: "bg-slate-100 text-slate-500 border-slate-200", // Sin plan
}

// Etiquetas legibles para el usuario
const statusLabels: Record<string, string> = {
    ACTIVE: "Activo",
    PAUSED: "Pausada",
    CANCELLED: "Cancelada",
    SIN_SUSCRIPCION: "Sin Suscripción",
    PENDING: "Pendiente"
}

export function ClientsManagement() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [planes, setPlanes] = useState<string[]>([])
  const [planFilter, setPlanFilter] = useState<string>("all")
  const { toast } = useToast()

  // 1. CARGA DE DATOS
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true)
        const [usersData, plansData] = await Promise.all([
            usersService.getAll(), // Ahora trae UserProfile[] (plano)
            plansService.getAll()
        ])
        
        // Mapeamos la data PLANA del backend a nuestra interfaz de tabla
        const formattedClients: Client[] = usersData.map((user: any) => ({
            id: user.id,
            name: `${user.nombre} ${user.apellido}`,
            email: user.email,
            // Usamos los campos nuevos del DTO
            plan: user.planActual || null, 
            status: user.estadoSuscripcion || "SIN_SUSCRIPCION",
            // Nota: El DTO actual no trae fecha de inicio, ponemos guión por ahora
            joinedDate: "-" 
        }))

        setClients(formattedClients)
        setPlanes(plansData.map((plan: any) => plan.nombre))
      } catch (error) {
        console.error("Error fetching clients:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el listado de clientes.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  // 2. FILTRADO LOCAL
  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Si filtra por plan, revisamos el plan o si busca "Sin Plan"
    const matchesPlan = planFilter === "all" || 
                        (client.plan === planFilter) ||
                        (planFilter === "SIN_PLAN" && !client.plan)
    
    return matchesSearch && matchesPlan
  })

  // 3. RENDERIZADO DE SKELETON (CARGA)
  if (loading) {
    return (
      <div className="space-y-6">
         <div className="h-24 bg-secondary/40 rounded animate-pulse" />
         <div className="space-y-2">
           {[1, 2, 3, 4, 5].map(i => (
             <Skeleton key={i} className="h-16 w-full bg-secondary/40" />
           ))}
         </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Administración</p>
        <h1 className="text-3xl font-serif italic text-foreground">Gestión de Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Listado total de usuarios registrados y su estado.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
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
            <SelectItem value="SIN_PLAN">Sin Plan</SelectItem>
            {planes.map((plan) => (
                <SelectItem key={plan} value={plan}>{plan}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabla */}
      <Card className="border-0 card-elevated-lg rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif italic flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Usuarios Registrados ({filteredClients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Cliente / Email
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Plan Actual
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Estado
                  </TableHead>
                  {/* Opcional: Si el backend luego trae fecha, descomentar */}
                  {/* <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Fecha Alta
                  </TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-2">
                                <AlertCircle className="h-6 w-6 opacity-20" />
                                <p>No se encontraron clientes con esos filtros.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredClients.map((client) => (
                    <TableRow key={client.id} className="border-border/30 hover:bg-secondary/10 transition-colors">
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium text-foreground">{client.name}</span>
                                <span className="text-xs text-muted-foreground">{client.email}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {client.plan ? (
                                <span className="font-serif italic text-foreground font-medium">{client.plan}</span>
                            ) : (
                                <span className="text-xs text-muted-foreground italic">--</span>
                            )}
                        </TableCell>
                        <TableCell>
                        <Badge variant="outline" className={cn("rounded-lg font-medium border shadow-sm", statusColors[client.status] || statusColors.SIN_SUSCRIPCION)}>
                            {statusLabels[client.status] || client.status}
                        </Badge>
                        </TableCell>
                        {/* <TableCell className="text-muted-foreground text-sm">{client.joinedDate}</TableCell> */}
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}