import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react" // Agregué Loader2
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { plansService } from "@/services/plans.service"

// --- TIPOS ---
interface Plan {
  id: string
  name: string
  price: number
  boxLimit: number
  category: "CLASICA" | "PREMIUM"
  benefits: string[]
}

// --- HELPERS ---
const formatPlanFromApi = (p: any): Plan => ({
  id: p.id,
  name: p.nombre,
  price: p.precioMensual,
  boxLimit: p.cantidadCajas,
  category: p.categoria || "CLASICA",
  benefits: p.beneficios || [],
})

const initialFormData = {
  name: "",
  price: "",
  boxLimit: "",
  category: "CLASICA" as "CLASICA" | "PREMIUM",
  benefits: [""] as string[],
}

// --- COMPONENTE PRINCIPAL ---
export function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false) // NUEVO ESTADO PARA LOADER
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState(initialFormData)
  const { toast } = useToast()

  // 1. Cargar Planes
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        const data = await plansService.getAll()
        setPlans(data.map(formatPlanFromApi))
      } catch (error) {
        console.error("Error fetching plans:", error)
        toast({ title: "Error", description: "No se pudieron cargar los planes", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [toast])

  // 2. Abrir Dialogo
  const handleOpenDialog = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        price: plan.price.toString(),
        boxLimit: plan.boxLimit.toString(),
        category: plan.category,
        benefits: plan.benefits.length > 0 ? plan.benefits : [""],
      })
    } else {
      setEditingPlan(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  // 3. Manejar Beneficios
  const modifyBenefit = (action: "add" | "remove" | "change", index?: number, value?: string) => {
    setFormData((prev) => {
      const newBenefits = [...prev.benefits]
      if (action === "add") newBenefits.push("")
      if (action === "remove" && typeof index === "number") newBenefits.splice(index, 1)
      if (action === "change" && typeof index === "number" && value !== undefined) newBenefits[index] = value
      return { ...prev, benefits: newBenefits }
    })
  }

  // 4. Guardar
  const handleSubmit = async () => {
    if (!formData.name.trim()) return toast({ title: "Error", description: "Falta el nombre", variant: "destructive" })
    const price = Number.parseFloat(formData.price)
    if (isNaN(price) || price <= 0) return toast({ title: "Error", description: "Precio inválido", variant: "destructive" })
    const boxLimit = Number.parseInt(formData.boxLimit)
    if (isNaN(boxLimit) || boxLimit <= 0) return toast({ title: "Error", description: "Límite de cajas inválido", variant: "destructive" })

    const filteredBenefits = formData.benefits.filter((b) => b.trim() !== "")
    
    const payload = {
      name: formData.name,
      description: "",
      price,
      boxesPerMonth: boxLimit,
      category: formData.category,
      benefits: filteredBenefits,
      active: true,
    }

    setIsSaving(true) // ACTIVAR LOADER Y BLOQUEAR BOTONES

    try {
      if (editingPlan) {
        await plansService.update(editingPlan.id, payload)
        setPlans((prev) =>
          prev.map((p) =>
            p.id === editingPlan.id 
              ? { ...p, ...payload, price: payload.price, boxLimit: payload.boxesPerMonth, category: formData.category } 
              : p,
          ),
        )
        toast({ title: "Plan actualizado", description: "Cambios guardados." })
      } else {
        const newPlanApi = await plansService.create(payload)
        const newPlanFormatted = formatPlanFromApi(newPlanApi)
        setPlans((prev) => [...prev, newPlanFormatted])
        toast({ title: "Plan creado", description: "Agregado al catálogo." })
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "Falló el guardado", variant: "destructive" })
    } finally {
      setIsSaving(false) // DESACTIVAR LOADER SIEMPRE
    }
  }

  if (loading) return <PlansLoadingSkeleton />

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">
            Gestión de Planes
          </p>
          <h1 className="text-3xl font-serif font-bold text-foreground italic mb-2">Planes de Suscripción</h1>
          <p className="text-muted-foreground">Administrá los planes y beneficios de las suscripciones</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => !isSaving && setIsDialogOpen(open)}> 
          {/* Evitamos cerrar el modal haciendo click afuera si está guardando */}
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan ? "Modificá los detalles del plan" : "Completá los detalles para el nuevo plan"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Categoría Selector */}
              <div className="space-y-2">
                <Label htmlFor="category" className="uppercase text-xs tracking-wider">Categoría</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    onClick={() => !isSaving && setFormData(prev => ({ ...prev, category: "CLASICA" }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                      formData.category === "CLASICA" 
                        ? "border-primary bg-primary/5 text-primary font-bold" 
                        : "border-muted hover:border-primary/50 text-muted-foreground"
                    } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    CLASICA
                  </div>
                  <div 
                    onClick={() => !isSaving && setFormData(prev => ({ ...prev, category: "PREMIUM" }))}
                    className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${
                      formData.category === "PREMIUM" 
                        ? "border-primary bg-primary/5 text-primary font-bold" 
                        : "border-muted hover:border-primary/50 text-muted-foreground"
                    } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    PREMIUM
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="uppercase text-xs tracking-wider">Nombre del Plan</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ej: Famiglia"
                  className="rounded-xl"
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="uppercase text-xs tracking-wider">Precio Mensual</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                      className="rounded-xl pl-7"
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="boxLimit" className="uppercase text-xs tracking-wider">Cantidad de Cajas</Label>
                  <Input
                    id="boxLimit"
                    type="number"
                    value={formData.boxLimit}
                    onChange={(e) => setFormData((p) => ({ ...p, boxLimit: e.target.value }))}
                    className="rounded-xl"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="uppercase text-xs tracking-wider">Beneficios del Plan</Label>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => modifyBenefit("change", index, e.target.value)}
                        placeholder="ej: Envíos gratis"
                        className="rounded-xl"
                        disabled={isSaving}
                      />
                      {formData.benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => modifyBenefit("remove", index)}
                          className="shrink-0 text-destructive hover:bg-destructive/10"
                          disabled={isSaving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => modifyBenefit("add")}
                  className="w-full rounded-xl bg-transparent"
                  disabled={isSaving}
                >
                  <Plus className="h-4 w-4 mr-2" /> Agregar Beneficio
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                className="rounded-xl"
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl min-w-[140px]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingPlan ? "Actualizando..." : "Guardando..."}
                  </>
                ) : (
                  editingPlan ? "Actualizar Plan" : "Crear Plan"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onEdit={() => handleOpenDialog(plan)} />
        ))}
      </div>
    </div>
  )
}

// --- SUB-COMPONENTES ---

function PlansLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-24 bg-secondary/40 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-secondary/40 rounded animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function PlanCard({ plan, onEdit }: { plan: Plan; onEdit: () => void }) {
  return (
    <Card className="card-elevated hover:card-elevated-lg transition-all duration-300 border-0 rounded-2xl overflow-hidden relative group">
      <CardHeader className="bg-gradient-to-br from-secondary/50 to-secondary/20 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-2xl font-serif italic">{plan.name}</CardTitle>
              <Badge variant={plan.category === "PREMIUM" ? "default" : "secondary"} className="text-[10px] tracking-widest">
                {plan.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{plan.boxLimit} cajas por mes</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit} className="text-muted-foreground hover:text-primary">
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-serif font-bold text-primary">${plan.price?.toLocaleString("es-AR")}</span>
          <span className="text-muted-foreground ml-1">/mes</span>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Beneficios</p>
          <ul className="space-y-2">
            {plan.benefits?.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="text-primary mt-0.5">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" onClick={onEdit} className="w-full rounded-xl">
          Editar Plan
        </Button>
      </CardFooter>
    </Card>
  )
}