import axiosInstance from "@/lib/axios"

interface PaymentLinkResponse {
  paymentUrl: string
  preferenceId: string
}

export const paymentService = {
  /**
   * Create Mercado Pago payment link for subscription
   * POST /pagos/crear/{subscriptionId}
   * Returns a URL that the frontend must redirect to
   */
  async createSubscriptionLink(subscriptionId: number): Promise<PaymentLinkResponse> {
    const response = await axiosInstance.post<PaymentLinkResponse>(`/pagos/crear/${subscriptionId}`)
    return response.data
  },

  /**
   * Redirect user to Mercado Pago payment
   */
  redirectToPayment(paymentUrl: string): void {
    if (typeof window !== "undefined") {
      window.location.href = paymentUrl
    }
  },

  /**
   * Verify payment status (called after redirect back from MP)
   * GET /pagos/verificar/{subscriptionId}
   */
  async verifyPayment(subscriptionId: number): Promise<{ status: string; paid: boolean }> {
    const response = await axiosInstance.get<{ status: string; paid: boolean }>(`/pagos/verificar/${subscriptionId}`)
    return response.data
  },
}
