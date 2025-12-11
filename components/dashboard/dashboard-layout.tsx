"use client"

import type React from "react"
import { Home, History, User, ChefHat } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeView: string
  onNavigate: (view: "overview" | "build-box") => void
}

export function DashboardLayout({ children, activeView, onNavigate }: DashboardLayoutProps) {
  const navItems = [
    { id: "overview", label: "My Box", icon: Home },
    { id: "build-box", label: "Build Your Box", icon: ChefHat },
    { id: "history", label: "Order History", icon: History },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-72 border-r border-border/50">
        <div className="p-8 pb-6">
          <h1 className="text-4xl font-serif font-bold text-primary italic">Fratelli</h1>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mt-2 font-medium">
            Pasta Artigianale
          </p>
        </div>

        <div className="mx-8 mb-6 h-px bg-gradient-to-r from-border via-border/60 to-transparent" />

        <nav className="px-5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as any)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all",
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground/60 hover:text-foreground hover:bg-secondary/60 font-medium",
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", isActive && "text-primary")} strokeWidth={1.5} />
                <span className="tracking-wide">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl py-12 px-10">{children}</div>
      </main>
    </div>
  )
}
