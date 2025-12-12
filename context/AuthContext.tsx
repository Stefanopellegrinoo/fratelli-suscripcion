"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService } from "@/services"

export interface User {
  id: number
  name: string
  lastName: string
  email: string
  role: "CLIENT" | "ADMIN"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

interface RegisterData {
  name: string
  lastName: string
  email: string
  password: string
  street: string
  number: string
  city: string
  phone: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const token = localStorage.getItem("auth_token")
        const userData = localStorage.getItem("user_data")

        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error loading user session:", error)
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password })

      // Store token and user data
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("user_data", JSON.stringify(response.user))

      setUser(response.user)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || "Error al iniciar sesión",
      }
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData)

      // Auto-login after successful registration
      localStorage.setItem("auth_token", response.token)
      localStorage.setItem("user_data", JSON.stringify(response.user))

      setUser(response.user)

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
    localStorage.removeItem("user_data")
    setUser(null)

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard"
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
