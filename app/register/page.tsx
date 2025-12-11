import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthLayout
      imageQuery="fresh pasta making flour eggs tomatoes basil rustic italian kitchen"
      imageAlt="Fresh pasta making ingredients"
    >
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-serif font-bold text-primary italic">Fratelli</h1>
          </Link>
          <h2 className="text-2xl font-serif text-foreground mb-2">Welcome to Fratelli</h2>
          <p className="text-muted-foreground">Create your account to start your pasta journey</p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
