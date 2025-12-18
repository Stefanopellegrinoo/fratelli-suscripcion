"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Minus, Plus, Check, Calendar as CalendarIcon, AlertCircle, Utensils, Lock, ArrowRight, Edit, AlertTriangle } from "lucide-react"
import { format, addHours, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { productsService, subscriptionService, plansService, ordersService } from "@/services"
// Agregá estos imports
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { parseISO, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isFriday, addMonths, isSameMonth } from "date-fns"
// ... imports existentes ...

// --- HELPER: OBTENER TODOS LOS VIERNES DEL MES ---
const getAvailableFridays = (baseDate: Date): Date[] => {
  // Obtenemos el rango del mes de la fecha base
  console.log("Calculating Fridays for month of:", baseDate)
  const start = startOfMonth(baseDate)
  const end = endOfMonth(baseDate)
  console.log("Calculating Fridays for month of:", eachDayOfInterval({ start, end }).filter(isFriday))
  
  // Filtramos solo los días que son Viernes
  return eachDayOfInterval({ start, end }).filter(isFriday)
}

// --- INTERFACES (Adaptadas a tu Backend) ---
interface Product {
  id: number
  name: string
  category: "CLASICA"  | "PREMIUM" 
  price: number // Numérico para cálculos
  formattedPrice: string // String para mostrar
  image: string
  description: string
  inStock: boolean
}

interface BuildYourBoxProps {
  onNavigateToPlans: () => void
}

// --- HELPER: CALCULAR PRÓXIMA ENTREGA (Misma lógica que Backend/Alta) ---
// Agregamos el parámetro 'fromDate' que por defecto es HOY
const calculateNextDelivery = (preference: number, fromDate: Date = new Date()): Date => {
    // 1. Arrancamos desde el día 1 del mes de la fecha base
    let targetDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)

    // 2. Buscamos el primer viernes de ESE mes
    while (targetDate.getDay() !== 5) {
        targetDate.setDate(targetDate.getDate() + 1)
    }

    // 3. Sumamos las semanas de preferencia (1º, 2º, 3º, 4º)
    targetDate.setDate(targetDate.getDate() + (preference - 1) * 7)

    // 4. REGLA DE CORTE: 
    // Si la fecha calculada ya pasó respecto al momento actual (HOY),
    // forzamos recursivamente el cálculo para el mes siguiente.
    const today = new Date();
    // Reseteamos horas para comparar solo fechas
    today.setHours(0,0,0,0);
    
    if (targetDate < today) {
        // Pasamos al mes siguiente y volvemos a calcular
        const nextMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 1);
        return calculateNextDelivery(preference, nextMonth);
    }

    return targetDate
}
export function BuildYourBox({ onNavigateToPlans }: BuildYourBoxProps) {
  const { toast } = useToast()

  // Estados de Datos
  const [subscription, setSubscription] = useState<any>(null)
  const [deliveryDate, setDeliveryDate] = useState<Date | null>(null)
  const [planDetails, setPlanDetails] = useState<{
    limit: number
    name: string
    allowsPremium: boolean
  } | null>(null)
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Estados de UI
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number>>({})
  const [activeCategory, setActiveCategory] = useState<"Todas" | Product["category"]>("Todas")
  // ... otros estados
  const [isEditing, setIsEditing] = useState(true) // Por defecto editamos, salvo que encontremos pedido
  const [oldOrder, setOldOrder] = useState<any>(null) 

  // Estado de Bloqueo (Regla 48hs)
  const [isLocked, setIsLocked] = useState(false)
useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)

        // 1. Cargar Datos Básicos (Paralelo)
        const [subData, prodsData, myOrders] = await Promise.all([
            subscriptionService.getMySubscription(),
            productsService.getAll(),
            ordersService.getMyOrders() // Traemos las órdenes AQUÍ para usarlas en el cálculo de fecha
        ])

        if (!subData || subData.status !== "ACTIVE") {
          setSubscription(null)
          setLoading(false)
          return 
        }
        setSubscription(subData)

        // 2. Mapear Plan
        const planData = await plansService.getById(subData.planId)
        console.log("Plan Data:", planData, planData.categoria == "PREMIUM" )
        setPlanDetails({
          limit: planData.cantidadCajas,
          name: planData.nombre,
          allowsPremium: planData.categoria == "PREMIUM" ,
        })
        
        // 3. Mapear Productos
        const formattedProducts = prodsData
          .filter((p: any) => p.inStock !== false)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            formattedPrice: `$${p.price?.toLocaleString("es-AR")}`,
            image: p.imageUrl || "/placeholder.svg",
            description: p.description,
            inStock: p.inStock,
          }))
        setProducts(formattedProducts)

        // --- LÓGICA DE FECHAS AVANZADA ---
        
        // A. Buscamos si hay un PENDING (Prioridad 1: Editar el actual)
        const pendingOrder = myOrders.find(o => (o.status === "PENDIENTE" || o.status === "MODIFICADO" ) && o.subscriptionId === subData.id)
        
        let targetDate: Date;
        let foundExistingOrder = false;

        if (pendingOrder) {
            // CASO 1: EDITAR PEDIDO PENDIENTE
            foundExistingOrder = true;
            targetDate = parseISO(pendingOrder.deliveryDate)
            console.log("Found pending order:", pendingOrder)
            // Recuperar items seleccionados
            const previousSelection: Record<number, number> = {}
            pendingOrder.items.forEach((item) => {
                const pid = item.productId || (item as any).productoId
                previousSelection[pid] = item.quantity
            })
            if (Object.keys(previousSelection).length > 0) setSelectedProducts(previousSelection)
            
            // Si ya existe, asumimos modo lectura al principio
            setOldOrder(pendingOrder)
            setIsEditing(false)

        } else {
            // CASO 2: CREAR PEDIDO NUEVO (Para el futuro)
            
            // Calculamos la fecha "ideal" según preferencia (ej: 2do viernes)
   const preferenciaDefault = subData.deliveryPreference || subData.preferenciaEntrega || 1 
    let calculatedDate = calculateNextDelivery(preferenciaDefault) // Usa HOY por defecto

    // --- CORRECCIÓN DE NEGOCIO: VALIDAR DUPLICADOS Y AVANZAR ---
    
    // Buscamos la ÚLTIMA orden confirmada para ver dónde estamos parados
    const lastOrder = myOrders
        .filter(o => o.subscriptionId === subData.id)
        .sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime())[0];

    if (lastOrder) {
        const lastDate = parseISO(lastOrder.deliveryDate)
        
        // BUCLE MÁGICO (WHILE en vez de IF):
        // Mientras la fecha calculada coincida con la última orden O sea anterior (ya pasó),
        // seguimos empujando hacia el futuro mes a mes.
        // Usamos 'isSameMonth' de date-fns para ser precisos.
        while (
            calculatedDate <= lastDate || 
            isSameMonth(calculatedDate, lastDate)
        ) {
            console.log("Collision detected with:", calculatedDate, "Skipping to next month...");
            
            // TRUCO: Generamos una fecha base en el mes siguiente
            // No sumamos días, creamos una fecha en el día 1 del mes que viene
            const nextMonthBase = addMonths(calculatedDate, 1);
            
            // Recalculamos el Viernes correcto para ese nuevo mes
            calculatedDate = calculateNextDelivery(preferenciaDefault, nextMonthBase);
        }
    }

    targetDate = calculatedDate;
    console.log("Final delivery date calculated:", targetDate)

    setIsEditing(true)
        }

        // C. Seteamos la fecha final
        console.log("Setting delivery date to:", targetDate)
        setDeliveryDate(targetDate)

        // D. Validar Bloqueo (48hs antes)
        const cutoffTime = addHours(targetDate, -48)
        if (isBefore(cutoffTime, new Date())) {
            setIsLocked(true)
            setIsEditing(false)
        } else {
            setIsLocked(false)
        }

      } catch (error) {
        console.error("Error init:", error)
        toast({ title: "Error", description: "Error cargando datos.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [toast]) // Asegurate de importar addMonths, isSameMonth de date-fns

  // --- HANDLERS ---

  const handleQuantityChange = (productId: number, change: number) => {
    if (!planDetails || isLocked) return 

    setSelectedProducts((prev) => {
      const currentQty = prev[productId] || 0
      const newQty = Math.max(0, currentQty + change)
      
      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0)

      // Validar límite
      // Si estamos sumando (+1) y ya llegamos al límite
      if (change > 0 && currentTotal >= planDetails.limit) {
        toast({
          title: "Caja Completa",
          description: `Tu plan permite ${planDetails.limit} cajas. Quitá una para agregar otra.`,
          variant: "default", 
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

const handleConfirmOrder = async () => {
  if (!subscription || !deliveryDate) return

  try {
    setLoading(true) // Opcional: Podés usar un estado local para deshabilitar el botón

    // 1. TRANSFORMACIÓN DE DATOS
    // Convertimos el objeto { "101": 2, "105": 1 } 
    // al array que pide el back: [{ productId: 101, quantity: 2 }, ...]
    const itemsPayload = Object.entries(selectedProducts).map(([idStr, qty]) => ({
        productId: Number(idStr),
        quantity: qty
    })).filter(item => item.quantity > 0) // Filtramos por seguridad si hay alguno en 0

    // 2. CONSTRUCCIÓN DEL DTO (CreateOrderData)
    const orderData = {
        subscriptionId: subscription.id, // ID de la suscripción (asegurate que el state 'subscription' lo tenga)
        deliveryDate: format(deliveryDate, "yyyy-MM-dd"), // Formato estándar ISO para Java/SQL
        deliveryTime: "09:00 - 13:00", // Hardcodeamos horario laboral si no se elige en el front
        items: itemsPayload
    }

    console.log("Enviando pedido:", orderData) // Para debug

    // 3. LLAMADA AL SERVICIO
    await ordersService.create(orderData)
    
    // 4. ÉXITO
    toast({
        title: "¡Caja Confirmada!",
        description: `Tu selección ha sido guardada para el ${format(deliveryDate, "d 'de' MMMM", { locale: es })}.`,
    })
setIsEditing(false)
setOldOrder(orderData)
    // Opcional: Resetear selección o redirigir
    // setSelectedProducts({}) 
    // router.push('/dashboard') 

  } catch (error) {
    console.error("Error al crear pedido:", error)
    toast({ 
        title: "Error", 
        description: "Hubo un problema al guardar tu selección. Intentá nuevamente.", 
        variant: "destructive" 
    })
  } finally {
    setLoading(false)
  }
}
  // --- RENDERIZADO ---

  if (loading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/20 rounded-2xl" />)}
        </div>
    )
  }

  // SI NO HAY SUSCRIPCIÓN ACTIVA
  if (!subscription || !planDetails) {
    return (
      <Card className="border-0 card-elevated-lg rounded-3xl overflow-hidden bg-gradient-to-br from-card to-secondary/10 text-center py-16 px-6">
        <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <Utensils className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-serif font-bold italic text-foreground">
                No tenés una suscripción activa
            </h2>
            <p className="text-muted-foreground text-lg">
                Para armar tu caja personalizada, primero necesitás suscribirte.
            </p>
            <Button onClick={onNavigateToPlans} className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 rounded-xl text-lg font-medium shadow-lg">
                Ver Planes <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
        </div>
      </Card>
    )
  }

  // --- ARMADO DE CAJA ---
  
  const totalBoxes = Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0)
  const isOverLimit = totalBoxes > planDetails.limit
  const progressPercent = (totalBoxes / planDetails.limit) * 100
  
  const filteredProducts = products.filter(
    (product) => activeCategory === "Todas" || product.category === activeCategory,
  )
  if (!isEditing && oldOrder?.status === "MODIFICADO") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
        {/* Alerta Roja/Naranja */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
          
          <div className="h-14 w-14 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="h-7 w-7 text-orange-600" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h3 className="font-serif font-bold text-xl text-orange-900 italic">
              Necesitamos que revises tu pedido
            </h3>
            <p className="text-orange-800/80 mt-2">
              Hubo un cambio en la disponibilidad de productos o en tu plan, y tuvimos que modificar tu selección original. 
              Por favor, confirmá los productos para asegurar tu entrega del <strong>{oldOrder.deliveryDateString}</strong>.
            </p>
          </div>

          <Button 
                                    onClick={() => setIsEditing(true)} 

            className="shrink-0 bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 py-6 shadow-lg shadow-orange-600/20"
          >
            <Edit className="h-4 w-4 mr-2" />
            Revisar y Confirmar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      
      {/* HEADER DINÁMICO */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground mb-2 font-medium">
          {isEditing ? "Personalizá Tu Selección" : "Todo listo"}
        </p>
        <h1 className="text-4xl font-serif font-bold text-foreground italic">
            {isEditing ? "Armá Tu Caja" : "Tu Pedido Confirmado"}
        </h1>
        <p className="text-muted-foreground text-lg mt-3">
          {isEditing 
            ? `Seleccioná tus ${planDetails.limit} pastas para el envío.` 
            : `Ya tenés un pedido confirmado para el ${format(deliveryDate!, "d 'de' MMMM", { locale: es })}.`}
        </p>
      </div>

      {/* BLOQUEO POR 48HS (Siempre visible si aplica) */}
      {isLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
                <h4 className="font-semibold text-amber-800">Selección Cerrada</h4>
                <p className="text-sm text-amber-700 mt-1">Ya estamos preparando tu pedido. No se pueden hacer cambios.</p>
            </div>
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* VISTA 1: RESUMEN (MODO LECTURA)                          */}
      {/* -------------------------------------------------------- */}
      {!isEditing && (
        <Card className="border-0 card-elevated-lg rounded-2xl overflow-hidden bg-secondary/5">
            <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif font-bold text-2xl italic">Lo que vas a recibir:</h3>
                    <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold">
                        {totalBoxes} cajas
                    </div>
                </div>

                {/* Lista de items guardados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {products.filter(p => selectedProducts[p.id] > 0).map(product => (
                        <div key={product.id} className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border/50">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                            <div>
                                <p className="font-bold text-lg">{product.name}</p>
                                <p className="text-muted-foreground">{selectedProducts[product.id]} unidades</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="text-muted-foreground" />
                        <div>
                            <p className="text-xs uppercase font-bold text-muted-foreground">Llega el</p>
                            <p className="text-xl font-serif font-bold">
                                {deliveryDate ? format(deliveryDate, "EEEE d 'de' MMMM", { locale: es }) : ""}
                            </p>
                        </div>
                    </div>

                    {/* BOTÓN PARA ACTIVAR EDICIÓN */}
                    <Button 
                        onClick={() => setIsEditing(true)} 
                        disabled={isLocked} // Si pasaron las 48hs, no dejamos editar
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-8 py-6 rounded-xl text-lg"
                    >
                        {isLocked ? "Pedido en Preparación" : "Modificar Pedido"}
                    </Button>
                </div>
            </CardContent>
        </Card>
      )}

      {/* -------------------------------------------------------- */}
      {/* VISTA 2: EDICIÓN (GRILLA + CONTROLES)                    */}
      {/* -------------------------------------------------------- */}
      {isEditing && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* BARRA DE PROGRESO */}
            <Card className="sticky top-4 z-20 border-0 card-elevated-lg rounded-2xl shadow-xl shadow-black/5 bg-card/95 backdrop-blur">
                <CardContent className="py-5 px-6">
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">Tu Caja</p>
                                <p className={cn("text-3xl font-serif font-bold", isOverLimit ? "text-destructive" : "text-foreground")}>
                                {totalBoxes} <span className="text-lg text-muted-foreground font-normal">de {planDetails.limit}</span>
                                </p>
                            </div>
                        </div>
                        {/* Botón cancelar cambios (opcional, solo si ya existía orden) */}
                        {!loading && Object.keys(selectedProducts).length > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-muted-foreground">
                                Cancelar cambios
                            </Button>
                        )}
                    </div>
                    <Progress value={Math.min(progressPercent, 100)} className={cn("h-2 rounded-full bg-secondary", isOverLimit && "[&>div]:bg-destructive")} />
                </CardContent>
            </Card>

            {/* FILTROS Y GRILLA (Igual que antes) */}
            <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as any)}>
                <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-8 justify-start w-full">
                {["Todas", "CLASICA", "PREMIUM"].map((cat) => (
                    <TabsTrigger key={cat} value={cat} disabled={cat === "PREMIUM" && !planDetails.allowsPremium} className="bg-transparent border-0 rounded-none px-0 pb-3 text-sm font-medium tracking-wide data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary text-muted-foreground hover:text-foreground transition-colors">
                    {cat}
                    </TabsTrigger>
                ))}
                </TabsList>
            </Tabs>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredProducts.map((product) => {
    const quantity = selectedProducts[product.id] || 0
    const isSelected = quantity > 0
    
    // Lógica extraída para limpieza
    const isPremium = product.category === "PREMIUM"
    const isLocked = isPremium && !planDetails.allowsPremium

    return (
      <Card 
        key={product.id} 
        className={cn(
          "overflow-hidden transition-all duration-300 border-0 card-elevated rounded-2xl group flex flex-col h-full", // flex-col y h-full para igualar alturas
          isSelected && "ring-2 ring-primary/60 card-elevated-lg",
          isLocked && "opacity-90 bg-secondary/20" // Un toque visual si está bloqueado
        )}
      >
        {/* IMAGEN */}
        <div className="aspect-[4/3] relative overflow-hidden bg-secondary/40">
          <img 
            src={product.image} 
            alt={product.name} 
            className={cn(
              "object-cover w-full h-full transition-transform duration-500",
              !isLocked && "group-hover:scale-105",
              isLocked && "grayscale-[0.8]" // Imagen en gris si está bloqueado
            )} 
          />
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.15em] bg-card/90 backdrop-blur-sm text-foreground/70 px-3 py-1.5 rounded-full font-medium">
            {product.category}
          </span>
          
          {/* Opcional: Icono de candado sobre la imagen también */}
          {isLocked && (
             <div className="absolute inset-0 bg-background/10 flex items-center justify-center backdrop-blur-[1px]">
                 <div className="bg-background/80 p-2 rounded-full shadow-sm">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                 </div>
             </div>
          )}
        </div>

        {/* CONTENIDO */}
        <CardContent className="p-5 space-y-4 flex flex-col flex-1">
          <div className="flex-1"> {/* Esto empuja el footer hacia abajo */}
            <h3 className="font-serif font-bold text-xl text-foreground italic">
                {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.description}
            </p>
          </div>

          {/* FOOTER: O Controles O Aviso de Bloqueo */}
          <div className="pt-2">
            {isLocked ? (
              // ESTADO BLOQUEADO (Mejorado)
              <div className="w-full py-2.5 px-3 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center justify-center gap-2 text-destructive animate-in fade-in">
                 <Lock className="h-4 w-4 shrink-0" />
                 <span className="text-xs font-semibold uppercase tracking-wide">
                   Solo Plan Premium
                 </span>
              </div>
            ) : (
              // ESTADO ACTIVO (Controles de cantidad)
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Cantidad</span>
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
                  
                  <span className="w-8 text-center font-semibold text-lg font-serif">
                    {quantity}
                  </span>
                  
                  <Button 
                    size="sm" 
                    onClick={() => handleQuantityChange(product.id, 1)} 
                    disabled={totalBoxes >= planDetails.limit && quantity === 0}
                    className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  })}
</div>
            {/* FOOTER: CONFIRMACIÓN (Solo visible en modo edición) */}
            <Card className="border-0 card-elevated-lg rounded-2xl bg-secondary/10 mb-12">
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* ... SELECTOR DE FECHA Y BOTÓN CONFIRMAR ... */}
                    {/* (Usá el código del selector de fecha que hicimos antes) */}
                     <div className="flex items-center gap-4">
                         <div className="h-12 w-12 bg-background rounded-full flex items-center justify-center text-primary shadow-sm">
                            <CalendarIcon className="h-6 w-6" />
                         </div>
                         <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Fecha de Entrega</p>
                            {/* Selector de fecha... */}
                             <Select value={format(deliveryDate!, "yyyy-MM-dd")} onValueChange={(val) => setDeliveryDate(parseISO(val))}>
                                <SelectTrigger className="w-[240px] bg-background border-primary/20 font-serif font-bold text-lg h-10"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {deliveryDate && getAvailableFridays(deliveryDate).map((date) => (
                                        <SelectItem key={date.toISOString()} value={format(date, "yyyy-MM-dd")} disabled={isBefore(date, new Date())}>
                                            {format(date, "EEEE d 'de' MMMM", { locale: es })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                         </div>
                     </div>

                     <Button size="lg" onClick={handleConfirmOrder} disabled={isOverLimit || totalBoxes === 0} className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 text-base rounded-xl font-medium tracking-wide shadow-lg w-full md:w-auto">
                        <Check className="mr-2 h-5 w-5" /> Guardar Cambios
                     </Button>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  )
}