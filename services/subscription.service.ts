import axiosInstance from "@/lib/axios"

export interface Subscription {
  nextPaymentDate: SetStateAction<string | null>
  id: number
  userId: number
  planId: number
  status: "ACTIVE" | "PAUSED" | "CANCELLED"
  startDate: string
  endDate?: string
  deliveryPreference?: string
  nextDeliveryDate?: string
}

interface CreateSubscriptionData {
  planId: number
  startDate?: string
  preferenciaEntrega?: string
}

export const subscriptionService = {
  /**
   * Create new subscription (Client)
   * POST /suscripciones
   */
  async create(data: CreateSubscriptionData): Promise<Subscription> {
    const response = await axiosInstance.post<Subscription>("/suscripciones", data)
    return response.data
  },

  /**
   * Get current user's subscription (Client)
   * GET /suscripciones/me
   */
  async getMySubscription(): Promise<Subscription | null> {
    try {
      const response = await axiosInstance.get<Subscription>("/suscripciones/me")
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null // No active subscription
      }
      throw error
    }
  },

  /**
   * Get subscription by ID
   * GET /suscripciones/{id}
   */
  async getById(id: number): Promise<Subscription> {
    const response = await axiosInstance.get<Subscription>(`/suscripciones/${id}`)
    return response.data
  },

  /**
   * Cancel subscription (Client)
   * PUT /suscripciones/{id}/cancelar
   */
  async cancel(id: number): Promise<Subscription> {
    const response = await axiosInstance.put<Subscription>(`/suscripciones/${id}/cancelar`)
    return response.data
  },

  /**
   * Pause subscription (Client)
   * PUT /suscripciones/{id}/pausar
   */
  async pause(id: number): Promise<Subscription> {
    const response = await axiosInstance.put<Subscription>(`/suscripciones/${id}/pausar`)
    return response.data
  },

  /**
   * Resume subscription (Client)
   * PUT /suscripciones/{id}/reanudar
   */
  async resume(id: number): Promise<Subscription> {
    const response = await axiosInstance.put<Subscription>(`/suscripciones/${id}/reanudar`)
    return response.data
  },
  // subscriptionService
async changePlan(newPlanId: number): Promise<Subscription> {
    const response = await axiosInstance.put<Subscription>("/suscripciones/me/change-plan", { newPlanId })
    return response.data
},
}
