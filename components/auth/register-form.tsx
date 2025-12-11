"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate registration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Account created!",
      description: "Welcome to Fratelli. Start building your first box.",
    })

    router.push("/dashboard")
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
            First Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Mario"
            required
            className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-muted-foreground">
            Last Name
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Rossi"
            required
            className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Email */}
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

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs uppercase tracking-wider text-muted-foreground">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            required
            minLength={8}
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

      {/* Address Fields */}
      <div className="space-y-4 pt-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">Delivery Address</p>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Label htmlFor="street" className="text-xs uppercase tracking-wider text-muted-foreground">
              Street
            </Label>
            <Input
              id="street"
              type="text"
              placeholder="Via Roma"
              required
              className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number" className="text-xs uppercase tracking-wider text-muted-foreground">
              Number
            </Label>
            <Input
              id="number"
              type="text"
              placeholder="123"
              required
              className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs uppercase tracking-wider text-muted-foreground">
            City
          </Label>
          <Input
            id="city"
            type="text"
            placeholder="Santiago"
            required
            className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
          />
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-muted-foreground">
          Phone
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+56 9 1234 5678"
          required
          className="h-12 rounded-xl bg-card border-border/50 focus:border-primary"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base mt-2"
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  )
}
