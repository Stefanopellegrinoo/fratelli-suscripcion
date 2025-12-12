import axiosInstance from "@/lib/axios"

export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  price: number
}

export interface Order {
  id: number
  userId: number
  subscriptionId: number
  status: "PENDING" | "DELIVERED" | "CANCELLED"
  deliveryDate: string
  deliveryTime: string
  items: OrderItem[]
  totalAmount: number
  deliveryAddress: string
  createdAt: string
}

export interface CreateOrderData {
  subscriptionId: number
  deliveryDate: string
  deliveryTime: string
  items: {
    productId: number
    quantity: number
  }[]
}

export const ordersService = {
  /**
   * Create new order (Client)
   * POST /pedidos
   */
  async create(orderData: CreateOrderData): Promise<Order> {
    const response = await axiosInstance.post<Order>("/pedidos", orderData)
    return response.data
  },

  /**
   * Get current user's orders (Client)
   * GET /pedidos/me
   */
  async getMyOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>("/pedidos/me")
    return response.data
  },

  /**
   * Get order by ID
   * GET /pedidos/{id}
   */
  async getById(id: number): Promise<Order> {
    const response = await axiosInstance.get<Order>(`/pedidos/${id}`)
    return response.data
  },

  /**
   * Get all orders (Admin)
   * GET /pedidos
   */
  async getAll(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>("/pedidos")
    return response.data
  },

  /**
   * Mark order as delivered (Admin)
   * PUT /pedidos/{id}/entregar
   */
  async markAsDelivered(id: number): Promise<Order> {
    const response = await axiosInstance.put<Order>(`/pedidos/${id}/entregar`)
    return response.data
  },

  /**
   * Get production report by date (Admin)
   * GET /pedidos/produccion?fecha={date}
   */
  async getProductionReport(date: string): Promise<{ productName: string; category: string; totalUnits: number }[]> {
    const response = await axiosInstance.get(`/pedidos/produccion`, {
      params: { fecha: date },
    })
    return response.data
  },
}
