"use client"

import { useState, useEffect, use } from "react"
import { User, MapPin, Phone, Mail, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { usersService } from "@/services"
import { fi, se } from "date-fns/locale"
const initialData = {
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  direccion: "",
}
export function UserProfile() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(false)
const [originalData, setOriginalData] = useState({
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  direccion: "",
})
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profile = await usersService.getMyProfile()

        setFormData({
          nombre: profile.nombre,
          apellido: profile.apellido,
          email: profile.email,
          telefono: profile.telefono,
          direccion: profile.direccion,
        })

        setOriginalData({
          nombre: profile.nombre,
          apellido: profile.apellido,
          email: profile.email,
          telefono: profile.telefono,
          direccion: profile.direccion,
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el perfil",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await usersService.updateMyProfile({
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono,
        direccion: formData.direccion
      })
      toast({
        title: "Perfil actualizado",
        description: "Tus datos fueron guardados correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = JSON.stringify(originalData) !== JSON.stringify(formData)
  console.log("hasChanges", initialData, formData, hasChanges)
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-24 bg-secondary/40 rounded animate-pulse" />
        <Card className="border-0 card-elevated-lg rounded-2xl">
          <CardContent className="p-8 space-y-6 animate-pulse">
            <div className="h-10 bg-secondary/40 rounded" />
            <div className="h-10 bg-secondary/40 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">Tu Cuenta</p>
        <h1 className="text-4xl font-serif font-bold text-foreground italic">Perfil de Usuario</h1>
        <p className="text-muted-foreground text-lg mt-3">Actualizá tus datos personales y dirección de entrega.</p>
      </div>

      <Card className="border-0 card-elevated-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-serif italic flex items-center gap-2">
            <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Datos Personales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                Nombre
              </Label>
              <Input
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
                className="py-6 rounded-xl border-border/60 bg-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                Apellido
              </Label>
              <Input
                value={formData.apellido}
                onChange={(e) => handleChange("apellido", e.target.value)}
                className="py-6 rounded-xl border-border/60 bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Email
              </Label>
              <Input
                value={formData.email}
                disabled
                className="py-6 rounded-xl border-border/60 bg-secondary/50 text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">El email no se puede modificar</p>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Teléfono
              </Label>
              <Input
                value={formData.telefono}
                type="num"
                onChange={(e) => handleChange("telefono", e.target.value)}
                className="py-6 rounded-xl border-border/60 bg-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 card-elevated-lg rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-serif italic flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" strokeWidth={1.5} />
            Dirección de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground">Calle</Label>
              <Input
                value={formData.direccion}
                onChange={(e) => handleChange("direccion", e.target.value)}
                className="py-6 rounded-xl border-border/60 bg-transparent"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading || !hasChanges}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base rounded-xl font-medium tracking-wide"
        >
          <Save className="mr-2 h-5 w-5" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  )
}
