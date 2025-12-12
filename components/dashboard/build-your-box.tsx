"use client"

import { useState, useEffect } from "react"
import { Check, Minus, Plus, CalendarIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { CheckoutSummary } from "./checkout-summary"
import { productsService } from "@/services"

const PLAN_LIMIT = 8
const PLAN_NAME = "Famiglia"
const ALLOWS_PREMIUM = true

interface Product {
  id: number
  name: string
  category: "Clásica" | "Rellena" | "Premium"
  price: string
  priceNum: number
  image: string
  description: string
  inStock: boolean
}

export function BuildYourBox() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number>>({})
  const [activeCategory, setActiveCategory] = useState<"Todas" | Product["category"]>("Todas")
  const [deliveryDate, setDeliveryDate] = useState<Date>()
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon">("morning")
  const [showCheckout, setShowCheckout] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productsService.getAll()
        const formattedProducts = data
          .filter((p) => p.inStock)
          .map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category as "Clásica" | "Rellena" | "Premium",
            price: `$${p.price.toLocaleString("es-AR")}`,
            priceNum: p.price,
            image: p.imageUrl || "/placeholder.svg",
            description: p.description || "",
            inStock: p.inStock,
          }))
        setProducts(formattedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos. Usando datos de ejemplo.",
          variant: "destructive",
        })
        setProducts([
          {
            id: 1,
            name: "Spaghetti",
            category: "Clásica",
            price: "$3.500",
            priceNum: 3500,
            image: "/fresh-spaghetti-pasta.jpg",
            description: "Cortado a mano, extruido en bronce",
            inStock: true,
          },
          {
            id: 2,
            name: "Fettuccine",
            category: "Clásica",
            price: "$3.500",
            priceNum: 3500,
            image: "/fettuccine-pasta.jpg",
            description: "Cintas planas y sedosas",
            inStock: true,
          },
          {
            id: 3,
            name: "Penne",
            category: "Clásica",
            price: "$3.500",
            priceNum: 3500,
            image: "/penne-pasta.png",
            description: "Tubos estriados, perfectos para salsa",
            inStock: true,
          },
          {
            id: 4,
            name: "Sorrentinos Jamón y Queso",
            category: "Rellena",
            price: "$5.500",
            priceNum: 5500,
            image: "/ravioli-ricotta.jpg",
            description: "Rellenos con jamón y mozzarella",
            inStock: true,
          },
          {
            id: 5,
            name: "Ravioles Ricota",
            category: "Rellena",
            price: "$5.500",
            priceNum: 5500,
            image: "/tortellini-pasta.jpg",
            description: "Ricota fresca y espinaca",
            inStock: true,
          },
          {
            id: 6,
            name: "Agnolotti",
            category: "Rellena",
            price: "$6.000",
            priceNum: 6000,
            image: "/agnolotti-pasta.jpg",
            description: "Piamontés, relleno de carne",
            inStock: true,
          },
          {
            id: 7,
            name: "Tagliatelle Trufa",
            category: "Premium",
            price: "$8.500",
            priceNum: 8500,
            image: "/truffle-tagliatelle.jpg",
            description: "Infusionado con trufa negra",
            inStock: true,
          },
          {
            id: 8,
            name: "Ravioles de Langosta",
            category: "Premium",
            price: "$9.500",
            priceNum: 9500,
            image: "/lobster-ravioli.jpg",
            description: "Langosta y mascarpone",
            inStock: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const totalBoxes = Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0)
  const isOverLimit = totalBoxes > PLAN_LIMIT
  const progressPercent = (totalBoxes / PLAN_LIMIT) * 100

  const filteredProducts = products.filter(
    (product) => activeCategory === "Todas" || product.category === activeCategory,
  )

  const checkoutItems = Object.entries(selectedProducts)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === Number(id))!
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: qty,
        price: product.priceNum,
      }
    })

  const handleQuantityChange = (productId: number, change: number) => {
    setSelectedProducts((prev) => {
      const currentQty = prev[productId] || 0
      const newQty = Math.max(0, currentQty + change)

      if (change > 0 && totalBoxes >= PLAN_LIMIT) {
        toast({
          title: "Límite alcanzado",
          description: `Tu plan ${PLAN_NAME} permite ${PLAN_LIMIT} cajas por mes.`,
          variant: "destructive",
        })
        return prev
      }

      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [productId]: newQty }
    })
  }

  const handleSubmit = () => {
    if (totalBoxes === 0) {
      toast({
        title: "Sin productos",
        description: "Por favor agregá al menos una pasta a tu pedido.",
        variant: "destructive",
      })
      return
    }
    if (!deliveryDate) {
      toast({
        title: "Fecha requerida",
        description: "Por favor seleccioná una fecha de entrega.",
        variant: "destructive",
      })
      return
    }
    setShowCheckout(true)
  }

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
          Personalizá Tu Selección
        </p>
        <h1 className="text-4xl font-serif font-bold text-foreground italic">Armá Tu Caja</h1>
        <p className="text-muted-foreground text-lg mt-3">
          Seleccioná tus pastas artesanales favoritas para la entrega de esta semana.
        </p>
      </div>

      <Card className="sticky top-4 z-10 border-0 card-elevated-lg rounded-2xl">
        <CardContent className="py-5 px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
                  Selección
                </p>
                <p
                  className={cn("text-3xl font-serif font-bold", isOverLimit ? "text-destructive" : "text-foreground")}
                >
                  {totalBoxes} <span className="text-lg text-muted-foreground font-normal">de {PLAN_LIMIT}</span>
                </p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="text-sm text-muted-foreground">
                Plan <span className="font-serif italic">{PLAN_NAME}</span>
              </div>
            </div>

            {isOverLimit && (
              <p className="text-sm text-destructive font-medium">
                Por favor quitá {totalBoxes - PLAN_LIMIT} caja{totalBoxes - PLAN_LIMIT > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <Progress
            value={Math.min(progressPercent, 100)}
            className={cn("h-2 rounded-full bg-secondary", isOverLimit && "[&>div]:bg-destructive")}
          />
        </CardContent>
      </Card>

      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
        <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-8">
          {["Todas", "Clásica", "Rellena", "Premium"].map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              disabled={cat === "Premium" && !ALLOWS_PREMIUM}
              className="bg-transparent border-0 rounded-none px-0 pb-3 text-sm font-medium tracking-wide data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground hover:text-foreground transition-colors"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden border-0 card-elevated rounded-2xl">
              <div className="aspect-[4/3] bg-secondary/40 animate-pulse" />
              <CardContent className="p-5 space-y-4">
                <div className="h-6 bg-secondary/40 rounded animate-pulse" />
                <div className="h-4 bg-secondary/40 rounded w-2/3 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const quantity = selectedProducts[product.id] || 0
            const isSelected = quantity > 0

            return (
              <Card
                key={product.id}
                className={cn(
                  "overflow-hidden transition-all duration-300 border-0 card-elevated rounded-2xl group",
                  isSelected && "ring-2 ring-primary/60 card-elevated-lg",
                )}
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-secondary/40">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.15em] bg-card/90 backdrop-blur-sm text-foreground/70 px-3 py-1.5 rounded-full font-medium">
                    {product.category}
                  </span>
                </div>

                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-foreground italic">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-serif font-semibold text-primary">{product.price}</span>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleQuantityChange(product.id, -1)}
                        disabled={quantity === 0}
                        className="h-9 w-9 p-0 rounded-full hover:bg-secondary"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-8 text-center font-semibold text-lg font-serif">{quantity}</span>

                      <Button
                        size="sm"
                        onClick={() => handleQuantityChange(product.id, 1)}
                        disabled={totalBoxes >= PLAN_LIMIT && quantity === 0}
                        className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Card className="border-0 card-elevated-lg rounded-2xl">
        <CardContent className="p-8 space-y-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-2">Entrega</p>
            <h2 className="text-2xl font-serif font-bold text-foreground italic">Programá Tu Entrega</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground">Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal py-6 border-border/60 rounded-xl hover:bg-secondary/50 bg-transparent",
                      !deliveryDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-3 h-4 w-4 opacity-60" />
                    {deliveryDate ? format(deliveryDate, "EEEE, d 'de' MMMM", { locale: es }) : "Seleccioná una fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-0 card-elevated-lg rounded-xl" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <Label className="text-[11px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
                Horario
              </Label>
              <RadioGroup value={timeSlot} onValueChange={(v) => setTimeSlot(v as any)} className="space-y-3">
                <label className="flex items-center gap-3 border border-border/60 rounded-xl p-4 hover:bg-secondary/30 transition-colors cursor-pointer has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="morning" id="morning" />
                  <span className="font-medium">Mañana</span>
                  <span className="text-muted-foreground text-sm ml-auto">9 AM – 12 PM</span>
                </label>
                <label className="flex items-center gap-3 border border-border/60 rounded-xl p-4 hover:bg-secondary/30 transition-colors cursor-pointer has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <span className="font-medium">Tarde</span>
                  <span className="text-muted-foreground text-sm ml-auto">2 PM – 6 PM</span>
                </label>
              </RadioGroup>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pb-8">
        <Button
          variant="ghost"
          size="lg"
          className="px-8 py-6 text-base text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-xl font-medium"
        >
          Guardar Borrador
        </Button>
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={isOverLimit || totalBoxes === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base rounded-xl font-medium tracking-wide card-elevated"
        >
          <Check className="mr-2 h-5 w-5" />
          Confirmar Pedido
        </Button>
      </div>

      <CheckoutSummary
        open={showCheckout}
        onOpenChange={setShowCheckout}
        items={checkoutItems}
        deliveryDate={deliveryDate ? format(deliveryDate, "EEEE, d 'de' MMMM", { locale: es }) : undefined}
        timeSlot={timeSlot === "morning" ? "9 AM – 12 PM" : "2 PM – 6 PM"}
      />
    </div>
  )
}
