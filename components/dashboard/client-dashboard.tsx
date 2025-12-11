"use client"

import { useState } from "react"
import { MainLayout } from "@/components/dashboard/main-layout"
import { SubscriptionStatus } from "@/components/dashboard/subscription-status"
import { BuildYourBox } from "@/components/dashboard/build-your-box"
import { OrderHistory } from "@/components/dashboard/order-history"
import { UserProfile } from "@/components/dashboard/user-profile"
import { SubscriptionManagement } from "@/components/dashboard/subscription-management"
import { Skeleton } from "@/components/ui/skeleton"

export type ClientViewType = "overview" | "build-box" | "history" | "profile" | "subscription"

interface ClientDashboardProps {
  onLogout: () => void
}

export function ClientDashboard({ onLogout }: ClientDashboardProps) {
  const [activeView, setActiveView] = useState<ClientViewType>("overview")
  const [isLoading, setIsLoading] = useState(false)

  const handleNavigate = (view: ClientViewType) => {
    setIsLoading(true)
    setActiveView(view)
    // Simulate loading for smooth UX
    setTimeout(() => setIsLoading(false), 400)
  }

  return (
    <MainLayout activeView={activeView} onNavigate={handleNavigate} onLogout={onLogout}>
      {isLoading ? (
        <div className="space-y-8">
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
        <>
          {activeView === "overview" && (
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
                  Bienvenido de nuevo
                </p>
                <h1 className="text-4xl font-serif font-bold text-foreground mb-3 italic">Hola, Mario</h1>
                <p className="text-muted-foreground text-lg">
                  Gestioná tu suscripción y armá tu caja semanal de pastas.
                </p>
              </div>
              <SubscriptionStatus onBuildBox={() => handleNavigate("build-box")} />
            </div>
          )}

          {activeView === "build-box" && <BuildYourBox />}
          {activeView === "history" && <OrderHistory />}
          {activeView === "profile" && <UserProfile />}
          {activeView === "subscription" && <SubscriptionManagement />}
        </>
      )}
    </MainLayout>
  )
}
