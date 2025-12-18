import axios from "axios"

// Base URL for the Spring Boot backend
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://june-point-independently-fcc.trycloudflare.com/api"
// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
  },
  timeout: 10000,
})

// Request interceptor: Attach JWT token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("auth_token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor: Handle 401/403 errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status

      // Handle authentication errors
      if (status === 401 || status === 403) {
        // Clear token
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")

        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard"
        }
      }
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
export { BASE_URL }
