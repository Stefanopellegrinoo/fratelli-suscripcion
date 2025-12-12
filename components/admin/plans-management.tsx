"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface Plan {
  id: number
  name: string
  price: number
  boxLimit: number
  benefits: string[]
}

const initialPlans: Plan[] = [
  {
    id: 1,
    name: "Piccolo",
    price: 25000,
    boxLimit: 4,
    benefits: ["4 cajas por mes", "Selección de pastas clásicas", "Entrega semanal", "Recetas incluidas"],
  },
  {
    id: 2,
    name: "Medio",
    price: 35000,
    boxLimit: 6,
    benefits: ["6 cajas por mes", "Pastas clásicas y rellenas", "Entrega flexible", "Recetas incluidas"],
  },
  {
    id: 3,
    name: "Famiglia",
    price: 45000,
    boxLimit: 8,
    benefits: [
      "8 cajas por mes",
      "Pastas clásicas y rellenas",
      "Acceso a selecciones premium",
      "Horarios de entrega prioritarios",
      "Recetas exclusivas",
    ],
  },
]

export function PlansManagement() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    boxLimit: "",
    benefits: [""],
  })
  const { toast } = useToast()

  const openCreateDialog = () => {
    setEditingPlan(null)
    setFormData({
      name: "",
      price: "",
      boxLimit: "",
      benefits: [""],
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      boxLimit: plan.boxLimit.toString(),
      benefits: plan.benefits.length > 0 ? plan.benefits : [""],
    })
    setIsDialogOpen(true)
  }

  const handleAddBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, ""],
    }))
  }

  const handleRemoveBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }))
  }

  const handleBenefitChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.map((benefit, i) => (i === index ? value : benefit)),
    }))
  }

  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del plan es obligatorio",
        variant: "destructive",
      })
      return
    }

    const price = Number.parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser un número válido mayor a 0",
        variant: "destructive",
      })
      return
    }

    const boxLimit = Number.parseInt(formData.boxLimit)
    if (isNaN(boxLimit) || boxLimit <= 0) {
      toast({
        title: "Error",
        description: "La cantidad de cajas debe ser un número válido mayor a 0",
        variant: "destructive",
      })
      return
    }

    // Filter out empty benefits
    const filteredBenefits = formData.benefits.filter((b) => b.trim() !== "")

    if (editingPlan) {
      // Update existing plan
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === editingPlan.id
            ? { ...plan, name: formData.name, price, boxLimit, benefits: filteredBenefits }
            : plan,
        ),
      )
      toast({
        title: "Plan actualizado",
        description: `El plan ${formData.name} se actualizó correctamente`,
      })
    } else {
      // Create new plan
      const newPlan: Plan = {
        id: Math.max(...plans.map((p) => p.id), 0) + 1,
        name: formData.name,
        price,
        boxLimit,
        benefits: filteredBenefits,
      }
      setPlans((prev) => [...prev, newPlan])
      toast({
        title: "Plan creado",
        description: `El plan ${formData.name} se creó correctamente`,
      })
    }

    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">
            Gestión de Planes
          </p>
          <h1 className="text-3xl font-serif font-bold text-foreground italic mb-2">Planes de Suscripción</h1>
          <p className="text-muted-foreground">Administrá los planes y beneficios de las suscripciones</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingPlan ? "Editar Plan" : "Crear Nuevo Plan"}
              </DialogTitle>
              <DialogDescription>
                {editingPlan
                  ? "Modificá los detalles del plan de suscripción"
                  : "Completá los detalles para crear un nuevo plan"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="uppercase text-xs tracking-wider">
                  Nombre del Plan
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="ej: Famiglia"
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="uppercase text-xs tracking-wider">
                    Precio Mensual
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="45000"
                      className="rounded-xl pl-7"
                    />
                  </div>
                </div>

                {/* Box Limit */}
                <div className="space-y-2">
                  <Label htmlFor="boxLimit" className="uppercase text-xs tracking-wider">
                    Cantidad de Cajas
                  </Label>
                  <Input
                    id="boxLimit"
                    type="number"
                    value={formData.boxLimit}
                    onChange={(e) => setFormData((prev) => ({ ...prev, boxLimit: e.target.value }))}
                    placeholder="8"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Dynamic Benefits */}
              <div className="space-y-3">
                <Label className="uppercase text-xs tracking-wider">Beneficios del Plan</Label>

                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={benefit}
                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                        placeholder="ej: Envíos gratis"
                        className="rounded-xl"
                      />
                      {formData.benefits.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBenefit(index)}
                          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                  onClick={handleAddBenefit}
                  className="w-full rounded-xl bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Beneficio
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                {editingPlan ? "Actualizar Plan" : "Crear Plan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="card-elevated hover:card-elevated-lg transition-all duration-300 border-0 rounded-2xl overflow-hidden"
          >
            <CardHeader className="bg-gradient-to-br from-secondary/50 to-secondary/20 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-serif italic mb-1">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.boxLimit} cajas por mes</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(plan)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-serif font-bold text-primary">
                  ${plan.price.toLocaleString("es-AR")}
                </span>
                <span className="text-muted-foreground ml-1">/mes</span>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Beneficios</p>
                <ul className="space-y-2">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button variant="outline" onClick={() => openEditDialog(plan)} className="w-full rounded-xl">
                Editar Plan
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
