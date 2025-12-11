"use client"

import type React from "react"
import { useState } from "react"
import { ChefHat, MapPin, Users, LogOut, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { AdminViewType } from "@/components/admin/admin-dashboard"

interface AdminLayoutProps {
  children: React.ReactNode
  activeView: AdminViewType
  onNavigate: (view: AdminViewType) => void
  onLogout: () => void
}

export function AdminLayout({ children, activeView, onNavigate, onLogout }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: "production" as AdminViewType, label: "Producción", icon: ChefHat },
    { id: "logistics" as AdminViewType, label: "Logística", icon: MapPin },
    { id: "clients" as AdminViewType, label: "Clientes", icon: Users },
  ]

  const NavContent = () => (
    <>
      <div className="p-8 pb-6">
        <h1 className="text-4xl font-serif font-bold text-primary italic">Fratelli</h1>
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mt-2 font-medium">Panel de Cocina</p>
      </div>

      <div className="mx-8 mb-6 h-px bg-gradient-to-r from-border via-border/60 to-transparent" />

      <nav className="px-5 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id)
                setMobileMenuOpen(false)
              }}
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

      {/* Logout Button */}
      <div className="p-5 border-t border-border/50 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm transition-all text-foreground/60 hover:text-foreground hover:bg-secondary/60 font-medium"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
          <span className="tracking-wide">Cerrar Sesión</span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden lg:flex w-72 border-r border-border/50 flex-col">
        <NavContent />
      </aside>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-serif font-bold text-primary italic">Fratelli Admin</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content - denser layout for data */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl py-8 px-6 lg:px-10 pt-24 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
