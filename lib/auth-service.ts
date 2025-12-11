// Mock authentication service that simulates API calls
// This will be replaced with real JWT-based backend calls later

export interface User {
  name: string
  email: string
  role: "CLIENT" | "ADMIN"
}

interface LoginResponse {
  success: boolean
  user?: User
  error?: string
}

/**
 * Simulates an authentication API call
 * In production, this will call the Java backend and decode the JWT to get user role
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Basic validation
  if (!email || !password) {
    return {
      success: false,
      error: "Email y contraseña son requeridos",
    }
  }

  // Mock authentication logic
  // In production: POST to /api/auth/login, receive JWT, decode role from token
  try {
    // Simulate checking credentials
    if (password.length < 6) {
      return {
        success: false,
        error: "Credenciales inválidas",
      }
    }

    // Mock user data based on email (for testing only)
    // In production: This data comes from the backend JWT payload
    const user: User = {
      name: email === "admin@fratelli.com" ? "Admin" : "Mario Rossi",
      email: email,
      role: email === "admin@fratelli.com" ? "ADMIN" : "CLIENT",
    }

    return {
      success: true,
      user,
    }
  } catch (error) {
    return {
      success: false,
      error: "Error de autenticación",
    }
  }
}

/**
 * Mock logout function
 */
export async function logout(): Promise<void> {
  // In production: Clear JWT token, invalidate session
  await new Promise((resolve) => setTimeout(resolve, 300))
}
