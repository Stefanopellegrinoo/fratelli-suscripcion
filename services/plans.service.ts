import axiosInstance from "@/lib/axios"

export interface Plan {
  id: number
  nombre: string
  description: string
  price: number
  cantidadCajas: number
  beneficios: string[]
  categoriasPermitidas: string[]
  active: boolean
}

interface CreatePlanData {
  name: string
  description: string
  price: number
  boxesPerMonth: number
  benefits: string[]
  active: boolean
}

export const plansService = {
  /**
   * Get all plans
   * GET /planes
   */
  async getAll(): Promise<Plan[]> {
    const response = await axiosInstance.get<Plan[]>("/planes")
    return response.data
  },

  /**
   * Get single plan
   * GET /planes/{id}
   */
  async getById(id: number): Promise<Plan> {
    const response = await axiosInstance.get<Plan>(`/planes/${id}`)
    return response.data
  },

  /**
   * Create new plan (Admin)
   * POST /planes
   */
  async create(planData: CreatePlanData): Promise<Plan> {
    const response = await axiosInstance.post<Plan>("/planes", planData)
    return response.data
  },

  /**
   * Update plan (Admin)
   * PUT /planes/{id}
   */
  async update(id: number, planData: Partial<CreatePlanData>): Promise<Plan> {
    const response = await axiosInstance.put<Plan>(`/planes/${id}`, planData)
    return response.data
  },

  /**
   * Delete plan (Admin)
   * DELETE /planes/{id}
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/planes/${id}`)
  },
}
