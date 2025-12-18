import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthLayout
      imageQuery="artisanal-fresh-pasta-italian-kitchen-warm-lightin.jpg"
      imageAlt="Fresh pasta making ingredients"
    >
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-serif font-bold text-primary italic">Fratelli</h1>
          </Link>
          <h2 className="text-2xl font-serif text-foreground mb-2">Bienvenido a Fratelli</h2>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground mt-8">
          ya tenes cuenta?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            ingresa aqui
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
