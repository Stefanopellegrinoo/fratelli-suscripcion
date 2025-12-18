import type React from "react"
interface AuthLayoutProps {
  children: React.ReactNode
  imageQuery: string
  imageAlt: string
}

export function AuthLayout({ children, imageQuery, imageAlt }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left half - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
         // src={`/.jpg?height=100&width=800&query=${encodeURIComponent(imageQuery)}`}
         src={imageQuery} 
         alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Subtle overlay for text readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Optional branding on image */}
        <div className="absolute bottom-8 left-8 right-8">
          <p className="text-white/90 font-serif text-xl italic">
            "Fresh pasta, made with love, delivered to your door."
          </p>
        </div>
      </div>

      {/* Right half - Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-8 lg:p-12">{children}</div>
    </div>
  )
}
