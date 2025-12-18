import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-secondary/30 border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Marca */}
          <div>
            <h3 className="font-serif text-xl font-bold italic mb-4">Fratelli</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Pastas artesanales directo a tu mesa. Suscribite y olvidate de cocinar, nosotros nos encargamos del resto.
            </p>
          </div>

          {/* Columna 2: Links Legales (OBLIGATORIO PARA MP) */}
          <div>
            <h4 className="font-medium mb-4 uppercase tracking-wider text-xs">Legales</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terminos" className="hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <a href="https://www.argentina.gob.ar/defensadelconsumidor" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  Defensa del Consumidor
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Contacto (OBLIGATORIO PARA MP) */}
          <div>
            <h4 className="font-medium mb-4 uppercase tracking-wider text-xs">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contacto@fratelli.com.ar</span> {/* Poné un mail real tuyo */}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+54 9 11 1234-5678</span> {/* Poné un celu real */}
              </li>
              <li className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                <span>@fratelli.pastas</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/40 mt-8 pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Fratelli Pastas. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
