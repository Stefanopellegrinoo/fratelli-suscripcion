"use client"

import { useState } from "react"
import { LoginPage } from "@/components/auth/login-page"
import { ClientDashboard } from "@/components/dashboard/client-dashboard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export type UserRole = "CLIENT" | "ADMIN" | null

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole>(null)

  if (!userRole) {
    return <LoginPage onLogin={setUserRole} />
  }

  if (userRole === "CLIENT") {
    return <ClientDashboard onLogout={() => setUserRole(null)} />
  }

  if (userRole === "ADMIN") {
    return <AdminDashboard onLogout={() => setUserRole(null)} />
  }

  return null
}
