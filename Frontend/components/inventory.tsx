"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/skeleton-loader"
import { useLoading } from "@/hooks/use-loading"
import { Search, Plus, Edit, Trash2, Package, AlertTriangle } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  minStock: number
  supplier: string
  barcode: string
}

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Banana",
      category: "Fruits",
      price: 0.75,
      stock: 50,
      minStock: 10,
      supplier: "Fresh Farms",
      barcode: "123456789",
    },
    {
      id: "2",
      name: "Orange",
      category: "Fruits",
      price: 0.6,
      stock: 5,
      minStock: 10,
      supplier: "Fresh Farms",
      barcode: "123456790",
    },
    {
      id: "3",
      name: "Apple",
      category: "Fruits",
      price: 1.2,
      stock: 25,
      minStock: 15,
      supplier: "Fresh Farms",
      barcode: "123456791",
    },
    {
      id: "4",
      name: "Milk",
      category: "Dairy",
      price: 3.5,
      stock: 20,
      minStock: 5,
      supplier: "Dairy Co",
      barcode: "123456792",
    },
    {
      id: "5",
      name: "Bread",
      category: "Bakery",
      price: 2.5,
      stock: 3,
      minStock: 5,
      supplier: "Local Bakery",
      barcode: "123456793",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({})
  const [productsLoading, setProductsLoading] = useState(false)

  const { loading: addLoading, withLoading: withAddLoading } = useLoading()
  const { loading: editLoading, withLoading: withEditLoading } = useLoading()
  const { loading: deleteLoading, withLoading: withDeleteLoading } = useLoading()

  const categories = ["All", "Fruits", "Dairy", "Beverages", "Snacks", "Bakery"]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockProducts = products.filter((product) => product.stock <= product.minStock)

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price && newProduct.stock) {
      await withAddLoading(async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const product: Product = {
          id: Date.now().toString(),
          name: newProduct.name,
          category: newProduct.category || "Other",
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          minStock: Number(newProduct.minStock) || 5,
          supplier: newProduct.supplier || "",
          barcode: newProduct.barcode || "",
        }
        setProducts([...products, product])
        setNewProduct({})
        setIsAddDialogOpen(false)
      })
    }
  }

  const handleEditProduct = async () => {
    if (editingProduct) {
      await withEditLoading(async () => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        setProducts(products.map((p) => (p.id === editingProduct.id ? editingProduct : p)))
        setEditingProduct(null)
      })
    }
  }

  const handleDeleteProduct = async (id: string) => {
    await withDeleteLoading(async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProducts(products.filter((p) => p.id !== id))
    })
  }

  const handleCategoryFilter = async (category: string) => {
    setProductsLoading(true)
    setSelectedCategory(category)
    // Simulate loading filtered products
    await new Promise((resolve) => setTimeout(resolve, 300))
    setProductsLoading(false)
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (product.stock <= product.minStock) return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" }
    return { label: "In Stock", color: "bg-green-100 text-green-800" }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c !== "All")
                      .map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newProduct.price || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minStock">Min Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    value={newProduct.minStock || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, minStock: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={newProduct.supplier || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, supplier: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={newProduct.barcode || ""}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                />
              </div>
              <LoadingButton
                onClick={handleAddProduct}
                className="w-full"
                loading={addLoading}
                loadingText="Adding Product..."
              >
                Add Product
              </LoadingButton>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${products.reduce((sum, p) => sum + p.price * p.stock, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product)
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{product.supplier}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <LoadingButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700"
                            loading={deleteLoading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </LoadingButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <LoadingButton
                onClick={handleEditProduct}
                className="w-full"
                loading={editLoading}
                loadingText="Updating Product..."
              >
                Update Product
              </LoadingButton>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
