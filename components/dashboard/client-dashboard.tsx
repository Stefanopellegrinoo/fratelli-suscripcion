import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation" // <--- IMPORTANTE

import { MainLayout } from "@/components/dashboard/main-layout"
import { SubscriptionStatus } from "@/components/dashboard/subscription-status"
import { BuildYourBox } from "@/components/dashboard/build-your-box"
import { OrderHistory } from "@/components/dashboard/order-history"
import { UserProfile } from "@/components/dashboard/user-profile"
import { SubscriptionManagement } from "@/components/dashboard/subscription-management"
import { Skeleton } from "@/components/ui/skeleton"

// Exportamos el tipo para que MainLayout lo pueda usar
export type ClientViewType = "overview" | "build-box" | "history" | "profile" 

interface ClientDashboardProps {
  onLogout: () => void
}

export function ClientDashboard({ onLogout }: ClientDashboardProps) {
  // 1. HOOKS DE NAVEGACIÓN
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // 2. ESTADO DERIVADO DE LA URL
  // Si la URL es /dashboard?tab=history, activeView será "history".
  // Si no hay parámetro tab, será "overview" por defecto.
  const activeView = (searchParams.get("tab") as ClientViewType) || "overview"

  // Mantenemos el loading local para la transición suave
  const [isLoading, setIsLoading] = useState(false)

  // 3. FUNCIÓN DE NAVEGACIÓN ACTUALIZADA
  const handleNavigate = (view: ClientViewType) => {
    // Si ya estamos en esa vista, no hacemos nada
    if (view === activeView) return

    setIsLoading(true)
    
    // Actualizamos la URL sin recargar la página
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", view)
    
    // { scroll: false } evita que la página salte hacia arriba al cambiar de tab
    router.push(`${pathname}?${params.toString()}`, { scroll: false })

    // Simular carga suave (igual que tenías antes)
    setTimeout(() => setIsLoading(false), 400)
  }

  // Effect para apagar el loading si el usuario usa las flechas del navegador (Atrás/Adelante)
  useEffect(() => {
    setIsLoading(false)
  }, [searchParams])

  return (
    <MainLayout activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout}>
      {isLoading ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 bg-secondary/60" />
            <Skeleton className="h-10 w-64 bg-secondary/60" />
            <Skeleton className="h-5 w-96 bg-secondary/60" />
          </div>
          <Skeleton className="h-64 w-full rounded-2xl bg-secondary/60" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-2xl bg-secondary/60" />
            <Skeleton className="h-48 rounded-2xl bg-secondary/60" />
            <Skeleton className="h-48 rounded-2xl bg-secondary/60" />
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeView === "overview" && (
            <div className="space-y-8">
             <SubscriptionManagement />
            </div>
          )}

          {activeView === "build-box" && <BuildYourBox onNavigateToPlans={() => handleNavigate("overview")}/>}
          {activeView === "history" && <OrderHistory />}
          {activeView === "profile" && <UserProfile />}
          {/* {activeView === "subscription" && <SubscriptionManagement />} */}
        </div>
      )}
    </MainLayout>
  )
}