"use client"

import { useEffect, useState } from "react"
import { LoginPageForm } from "@/components/auth/login-page"
import { ClientDashboard } from "@/components/dashboard/client-dashboard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { useAuth } from "@/context/AuthContext"

export type UserRole = "CLIENTE" | "ADMIN" | null

export default function DashboardPage() {
  const { user, logout, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {

      logout() 
    }
  }, [loading, user, logout])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }


  if (!user) {
    return <LoginPageForm />
  }

  if (user.rol === "CLIENTE") {
    return <ClientDashboard onLogout={logout} /> 
  }

  if (user.rol === "ADMIN") {
    return <AdminDashboard onLogout={logout} />
  }

  // Fallback por si tiene un rol raro
  return (
    <div className="p-10 text-center">
        <h1 className="text-xl font-bold">Acceso Denegado</h1>
        <p>Tu rol ({user.rol}) no tiene permisos para ver este panel.</p>
        <button onClick={logout} className="mt-4 btn btn-primary">Salir</button>
    </div>
  )
}