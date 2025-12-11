import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthLayout
      imageQuery="fresh pasta ingredients flour eggs tomatoes rustic kitchen warm lighting"
      imageAlt="Fresh pasta ingredients"
    >
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-serif font-bold text-primary italic">Fratelli</h1>
          </Link>
          <h2 className="text-2xl font-serif text-foreground mb-2">Welcome Back</h2>
          <p className="text-muted-foreground">Sign in to manage your pasta subscription</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
