"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation" // <--- Importamos los hooks

import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductionReport } from "@/components/admin/production-report"
import { DeliveryLogistics } from "@/components/admin/delivery-logistics"
import { ClientsManagement } from "@/components/admin/clients-management"
import { ProductManagement } from "@/components/admin/product-management"
import { PlansManagement } from "@/components/admin/plans-management"
import { Skeleton } from "@/components/ui/skeleton"

export type AdminViewType = "production" | "logistics" | "clients" | "products" | "plans"

interface AdminDashboardProps {
  onLogout: () => void
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  // 1. HOOKS DE NAVEGACIÓN
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // 2. ESTADO DERIVADO DE LA URL
  // Leemos el parámetro "tab". Si no existe, por defecto es "production".
  const activeView = (searchParams.get("tab") as AdminViewType) || "production"

  // Mantenemos el loading local para la transición suave
  const [isLoading, setIsLoading] = useState(false)

  // 3. FUNCIÓN DE NAVEGACIÓN ACTUALIZADA
  const handleNavigate = (view: AdminViewType) => {
    // Si ya estamos en esa vista, no hacemos nada para evitar recargas innecesarias
    if (view === activeView) return

    setIsLoading(true)

    // Construimos la nueva URL
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", view)

    // Actualizamos la URL sin recargar la página (scroll: false evita saltos)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })

    // Simulamos la carga suave (igual que tenías antes)
    setTimeout(() => setIsLoading(false), 400)
  }

  // Effect para apagar el loading si el admin usa las flechas del navegador (Atrás/Adelante)
  useEffect(() => {
    setIsLoading(false)
  }, [searchParams])

  return (
    <AdminLayout activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout}>
      {isLoading ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 bg-secondary/60" />
            <Skeleton className="h-9 w-56 bg-secondary/60" />
            <Skeleton className="h-4 w-72 bg-secondary/60" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-xl bg-secondary/60" />
            <Skeleton className="h-24 rounded-xl bg-secondary/60" />
            <Skeleton className="h-24 rounded-xl bg-secondary/60" />
            <Skeleton className="h-24 rounded-xl bg-secondary/60" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl bg-secondary/60" />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeView === "production" && <ProductionReport />}
          {activeView === "logistics" && <DeliveryLogistics />}
          {activeView === "clients" && <ClientsManagement />}
          {activeView === "products" && <ProductManagement />}
          {activeView === "plans" && <PlansManagement />}
        </div>
      )}
    </AdminLayout>
  )
}