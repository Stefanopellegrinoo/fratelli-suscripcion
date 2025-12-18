"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { authService, usersService } from "@/services"
// Importa tus tipos User, LoginResponse, etc.

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: any) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // 1. VERIFICACIÓN REAL AL MONTAR
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        // 🔒 SEGURIDAD: No confiamos en localStorage. 
        // Usamos el token para pedir los datos frescos al backend.
        // Si el token es falso o expiró, esto lanzará error.
        const userData = await usersService.getMyProfile()
        setUser(userData)
      } catch (error) {
        console.error("Sesión inválida o expirada:", error)
        logout() // Si falla, limpiamos todo
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })

      // Guardamos SOLO el token. Los datos del usuario van a memoria (State).
      localStorage.setItem("auth_token", response.token)
      
      // Axios Interceptor ahora usará este token para las siguientes peticiones.
      
      // Opcional: Si el login devuelve el usuario completo, lo usamos.
      // Si solo devuelve token, hacemos una llamada extra a getMyProfile().
      // Asumiremos que tu login devuelve User + Token:
      setUser(response) 

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al iniciar sesión",
      }
    }
  }

  const register = async (userData: any) => {
    try {
      const response = await authService.register(userData)
      
      localStorage.setItem("auth_token", response.token)
      setUser(response)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al registrarse",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
    
    if (typeof window !== "undefined") {
        window.location.href = "/login"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}