import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/20">
      <div className="container max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-serif font-bold text-foreground italic">
              Fratelli
            </Link>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Authentic Italian pasta, handcrafted with love since 1987.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Menu</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Plans
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Build Your Box
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Artisans
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Sustainability
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Shipping
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 Fratelli. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
