// Central export file for all services
// This helps with import organization and ensures all services are properly exported

export { authService } from "./auth.service"
export { productsService, type Product } from "./products.service"
export { plansService, type Plan } from "./plans.service"
export { subscriptionService, type Subscription } from "./subscription.service"
export { paymentService } from "./payment.service"
export { ordersService, type Order, type OrderItem, type CreateOrderData } from "./orders.service"
export { usersService, type UserProfile, type UpdateProfileData } from "./users.service"

// Re-export types from AuthContext for convenience
export type { User } from "@/context/AuthContext"
