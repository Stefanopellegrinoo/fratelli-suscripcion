import axiosInstance from "@/lib/axios"

export interface Product {
  id: number
  name: string
  description: string
  category: "CLASICA" | "RELLENA" | "PREMIUM"
  price: number
  imageUrl: string
  inStock: boolean
}

interface CreateProductData {
  name: string
  description: string
  category: string
  price: number
  imageUrl?: string
  inStock: boolean
}

export const productsService = {
  /**
   * Get all products (Public)
   * GET /productos
   */
  async getAll(): Promise<Product[]> {
    const response = await axiosInstance.get<Product[]>("/productos")
    return response.data
  },

  /**
   * Get single product
   * GET /productos/{id}
   */
  async getById(id: number): Promise<Product> {
    const response = await axiosInstance.get<Product>(`/productos/${id}`)
    return response.data
  },

  /**
   * Create new product (Admin)
   * POST /productos
   * Note: For image upload, use FormData with multipart/form-data
   */
  async create(productData: CreateProductData): Promise<Product> {
    const response = await axiosInstance.post<Product>("/productos", productData)
    return response.data
  },

  /**
   * Update product (Admin)
   * PUT /productos/{id}
   */
  async update(id: number, productData: Partial<CreateProductData>): Promise<Product> {
    const response = await axiosInstance.put<Product>(`/productos/${id}`, productData)
    return response.data
  },

  /**
   * Toggle stock availability (Admin)
   * PATCH /productos/{id}/stock
   */
  async toggleStock(id: number): Promise<Product> {
    const response = await axiosInstance.patch<Product>(`/productos/${id}/stock`)
    return response.data
  },

  /**
   * Delete product (Admin)
   * DELETE /productos/{id}
   */
  async delete(id: number): Promise<void> {
    await axiosInstance.delete(`/productos/${id}`)
  },

  /**
   * Upload product image (Multipart)
   * POST /productos/upload
   */
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await axiosInstance.post<{ imageUrl: string }>("/productos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    return response.data
  },
}
