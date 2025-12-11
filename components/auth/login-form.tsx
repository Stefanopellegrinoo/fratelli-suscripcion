"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Welcome back!",
      description: "You have been signed in successfully.",
    })

    router.push("/dashboard")
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-xs uppercase tracking-wider text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="mario@example.com"
          required
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            required
            className="h-12 rounded-xl bg-card border-border/50 focus:border-primary pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
