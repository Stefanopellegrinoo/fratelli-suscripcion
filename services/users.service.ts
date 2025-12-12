import axiosInstance from "@/lib/axios"

export interface UserProfile {
  id: number
  nombre: string
  apellido: string
  email: string
  telefono: string
  calle: string
  numero: string
  ciudad: string
  role: "CLIENT" | "ADMIN"
}

export interface UpdateProfileData {
  nombre?: string
  apellido?: string
  telefono?: string
  calle?: string
  numero?: string
  ciudad?: string
}

export const usersService = {
  /**
   * Get current user profile
   * GET /usuarios/me
   */
  async getMyProfile(): Promise<UserProfile> {
    const response = await axiosInstance.get<UserProfile>("/usuarios/me")
    return response.data
  },

  /**
   * Update current user profile
   * PUT /usuarios/me
   */
  async updateMyProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await axiosInstance.put<UserProfile>("/usuarios/me", data)
    return response.data
  },

  /**
   * Get all users (Admin)
   * GET /usuarios
   */
  async getAll(): Promise<UserProfile[]> {
    const response = await axiosInstance.get<UserProfile[]>("/usuarios")
    return response.data
  },

  /**
   * Get user by ID (Admin)
   * GET /usuarios/{id}
   */
  async getById(id: number): Promise<UserProfile> {
    const response = await axiosInstance.get<UserProfile>(`/usuarios/${id}`)
    return response.data
  },
}
