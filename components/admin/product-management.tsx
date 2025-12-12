"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { productsService, type Product } from "@/services/products.service"

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Clásica" as Product["category"],
    price: "",
    imageUrl: "",
    inStock: true,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await productsService.getAll()
      setProducts(data)
    } catch (error) {
      console.error("[v0] Error loading products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStock = async (productId: number) => {
    try {
      const updatedProduct = await productsService.toggleStock(productId)
      setProducts((prev) => prev.map((p) => (p.id === productId ? updatedProduct : p)))
      toast({
        title: "Stock actualizado",
        description: "El estado de disponibilidad ha sido modificado.",
      })
    } catch (error) {
      console.error("[v0] Error toggling stock:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el stock.",
        variant: "destructive",
      })
    }
  }

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price.toString(),
        imageUrl: product.imageUrl,
        inStock: product.inStock,
      })
    } else {
      setEditingProduct(null)
      setFormData({
        name: "",
        description: "",
        category: "Clásica",
        price: "",
        imageUrl: "",
        inStock: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      })
      return
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      imageUrl: formData.imageUrl || "/colorful-pasta-arrangement.png",
      inStock: formData.inStock,
    }

    try {
      if (editingProduct) {
        // Update existing product
        const updated = await productsService.update(editingProduct.id, productData)
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)))
        toast({
          title: "Producto actualizado",
          description: `${productData.name} ha sido actualizado exitosamente.`,
        })
      } else {
        // Create new product
        const newProduct = await productsService.create(productData)
        setProducts((prev) => [...prev, newProduct])
        toast({
          title: "Producto creado",
          description: `${productData.name} ha sido agregado al catálogo.`,
        })
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    try {
      await productsService.delete(productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido removido del catálogo.",
      })
      setDeleteProductId(null)
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      })
    }
  }

  const getCategoryColor = (category: Product["category"]) => {
    switch (category) {
      case "Clásica":
        return "bg-accent/20 text-accent border-accent/30"
      case "Rellena":
        return "bg-primary/20 text-primary border-primary/30"
      case "Premium":
        return "bg-amber-500/20 text-amber-700 border-amber-500/30"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-2 font-medium">Catálogo</p>
          <h1 className="text-4xl font-serif font-bold text-foreground italic mb-2">Gestión de Pastas</h1>
          <p className="text-muted-foreground">Administrá el inventario y disponibilidad de productos.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Modificá la información del producto." : "Agregá un nuevo producto al catálogo."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nombre *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Ravioles de Ricotta"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Categoría *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as Product["category"] })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clásica">Clásica</SelectItem>
                      <SelectItem value="Rellena">Rellena</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="price" className="text-xs uppercase tracking-wider text-muted-foreground">
                    Precio *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="3500"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageUrl" className="text-xs uppercase tracking-wider text-muted-foreground">
                  URL de Imagen
                </Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="stock" className="text-xs uppercase tracking-wider text-muted-foreground">
                  Disponible en Stock
                </Label>
                <Switch
                  id="stock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} className="bg-primary text-primary-foreground hover:bg-primary/90">
                Guardar Producto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-20">Imagen</TableHead>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Categoría</TableHead>
              <TableHead className="font-semibold">Precio</TableHead>
              <TableHead className="font-semibold">Stock</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="border-border/50">
                <TableCell>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getCategoryColor(product.category)}>
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-foreground">${(product.price / 1000).toFixed(3)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch checked={product.inStock} onCheckedChange={() => handleToggleStock(product.id)} />
                    <span
                      className={`text-xs font-medium ${product.inStock ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {product.inStock ? "Disponible" : "Sin Stock"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(product)}
                      className="h-8 w-8 p-0 hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteProductId(product.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-1">No hay productos</h3>
            <p className="text-sm text-muted-foreground">Comenzá agregando tu primer producto al catálogo.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteProductId !== null} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-2xl">¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será removido permanentemente del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteProductId && handleDeleteProduct(deleteProductId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
