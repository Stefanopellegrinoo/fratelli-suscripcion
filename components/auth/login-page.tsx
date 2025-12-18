"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

interface LoginPageProps {
  onLogin: (role: "CLIENTE" | "ADMIN") => void
}

export function LoginPageForm() {
    const router = useRouter()
  
    const { login, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Campos requeridos",
        description: "Por favor ingresá tu email y contraseña.",
        variant: "destructive",
      })
      return
    }

   setIsLoading(true)

    // 1. Llamamos al login y esperamos el RESULTADO (objeto)
    const result = await login(email, password)

    // 2. Verificamos el flag de éxito que devuelve AuthProvider
    if (result.success) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente.",
      })

      // 3. REDIRECCIÓN SIMPLIFICADA
      // No chequeamos el rol aquí. Mandamos a todos al Dashboard.
      // El componente DashboardPage (que arreglamos antes) se encarga 
      // de decidir qué mostrar (Admin o Cliente) según el rol.
      router.push("/dashboard") 
      
    } else {
      // 4. MANEJO DE ERROR
      // Aquí mostramos el mensaje que vino del AuthProvider
      toast({
        title: "Error al iniciar sesión",
        description: result.error || "Credenciales inválidas.",
        variant: "destructive",
      })
    }
    
    // Nota: No hace falta setIsLoading(false) en el éxito 
    // porque al redirigir el componente se desmonta. 
    // Solo lo bajamos si falló.
    if (!result.success) {
      setIsLoading(false)
    }
  }

  return (
    <div className=" bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border-none shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div>
                <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-serif font-bold text-primary italic">Fratelli</h1>
          </Link>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-medium">Pasta Artesanal</p>
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-2xl font-serif text-foreground">Bienvenido de nuevo</CardTitle>
            <CardDescription className="text-sm">Ingresá a tu cuenta para continuar</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary/40 bg-background"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider font-medium">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-border/60 focus:border-primary/40 bg-background"
                disabled={isLoading}
              />
            </div>

            <div className="text-right">
              <Link href="#" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold tracking-wide text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 transition-colors font-semibold">
                Registrate
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
