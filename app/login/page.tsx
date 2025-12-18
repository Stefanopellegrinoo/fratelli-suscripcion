import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
//import { LoginForm } from "@/components/auth/login-form"
import { LoginPageForm } from "@/components/auth/login-page"


export default function LoginPage() {
  return (
    <AuthLayout
      imageQuery="artisanal-fresh-pasta-italian-kitchen-warm-lightin.jpg"
      imageAlt="Fresh pasta ingredients"
    >
      <div className="w-full max-w-md mx-auto">
  
        <LoginPageForm />

      </div>
    </AuthLayout>
  )
}
