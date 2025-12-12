import axiosInstance from "@/lib/axios"
import type { User } from "@/context/AuthContext"

interface LoginCredentials {
  email: string
  password: string
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

interface AuthResponse {
  token: string
  user: User
}

export const authService = {
  /**
   * Login user
   * POST /auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>("/auth/login", credentials)
    return response.data
  },

  /**
   * Register new user
   * POST /auth/register
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>("/auth/register", userData)
    return response.data
  },

  /**
   * Logout (optional backend call)
   */
  async logout(): Promise<void> {
    // If backend has logout endpoint
    // await axiosInstance.post('/auth/logout')
  },
}
