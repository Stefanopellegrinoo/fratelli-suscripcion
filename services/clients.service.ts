import axiosInstance from "@/lib/axios"


export const clientsService = {
  // Obtenemos todas las suscripciones del sistema (Admin)
  getAll: async () => {
  
    const response = await axiosInstance.get("/suscripciones") 
    return response.data
  },
}