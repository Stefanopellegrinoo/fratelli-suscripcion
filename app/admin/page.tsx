"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductionReport } from "@/components/admin/production-report"
import { DeliveryLogistics } from "@/components/admin/delivery-logistics"

export default function AdminDashboardPage() {
  const [activeView, setActiveView] = useState<"production" | "orders" | "plans" | "users">("production")

  return (
    <AdminLayout activeView={activeView} onNavigate={setActiveView}>
      {activeView === "production" && <ProductionReport />}
      {activeView === "orders" && <DeliveryLogistics />}
      {activeView === "plans" && (
        <div className="space-y-4">
          <h1 className="text-2xl font-serif italic text-foreground">Plans Management</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      )}
      {activeView === "users" && (
        <div className="space-y-4">
          <h1 className="text-2xl font-serif italic text-foreground">Users Management</h1>
          <p className="text-muted-foreground">Coming soon...</p>
        </div>
      )}
    </AdminLayout>
  )
}
