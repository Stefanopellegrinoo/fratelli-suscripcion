"use client"

import { useState } from "react"
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
  const [activeView, setActiveView] = useState<AdminViewType>("production")
  const [isLoading, setIsLoading] = useState(false)

  const handleNavigate = (view: AdminViewType) => {
    setIsLoading(true)
    setActiveView(view)
    // Simulate loading for smooth UX
    setTimeout(() => setIsLoading(false), 400)
  }

  return (
    <AdminLayout activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout}>
      {isLoading ? (
        <div className="space-y-6">
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
        <>
          {activeView === "production" && <ProductionReport />}
          {activeView === "logistics" && <DeliveryLogistics />}
          {activeView === "clients" && <ClientsManagement />}
          {activeView === "products" && <ProductManagement />}
          {activeView === "plans" && <PlansManagement />}
        </>
      )}
    </AdminLayout>
  )
}
