"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useLoading } from "@/hooks/use-loading"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, Scan } from "lucide-react"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: string
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
}

interface SuspendedSale {
  id: string
  items: CartItem[]
  total: number
  timestamp: string
  customerName?: string
}

export function NewSale() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [suspendedSales, setSuspendedSales] = useState<SuspendedSale[]>([])
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null)

  const { loading: paymentLoading, withLoading: withPaymentLoading } = useLoading()
  const { loading: scanLoading, withLoading: withScanLoading } = useLoading()
  const { loading: suspendLoading, withLoading: withSuspendLoading } = useLoading()
  const { toast } = useToast()

  const categories = ["All", "Fruits", "Dairy", "Beverages", "Snacks", "Bakery"]

  const products: Product[] = [
    { id: "1", name: "Banana", price: 0.75, category: "Fruits", stock: 50 },
    { id: "2", name: "Orange", price: 0.6, category: "Fruits", stock: 30 },
    { id: "3", name: "Apple", price: 1.2, category: "Fruits", stock: 25 },
    { id: "4", name: "Lemon", price: 0.4, category: "Fruits", stock: 40 },
    { id: "5", name: "Milk", price: 3.5, category: "Dairy", stock: 20 },
    { id: "6", name: "Cheese", price: 5.2, category: "Dairy", stock: 15 },
    { id: "7", name: "Yogurt", price: 2.8, category: "Dairy", stock: 18 },
    { id: "8", name: "Coca Cola", price: 1.5, category: "Beverages", stock: 35 },
    { id: "9", name: "Water", price: 1.0, category: "Beverages", stock: 50 },
    { id: "10", name: "Chips", price: 2.25, category: "Snacks", stock: 25 },
    { id: "11", name: "Cookies", price: 3.75, category: "Snacks", stock: 20 },
    { id: "12", name: "Bread", price: 2.5, category: "Bakery", stock: 12 },
    { id: "13", name: "Croissant", price: 1.8, category: "Bakery", stock: 8 },
  ]

  // Load suspended sales from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem("suspendedSales")
    if (saved) {
      setSuspendedSales(JSON.parse(saved))
    }
  }, [])

  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = async (product: Product) => {
    // Check stock availability
    const currentQuantity = cart.find((item) => item.id === product.id)?.quantity || 0
    if (currentQuantity >= product.stock) {
      toast({
        variant: "destructive",
        title: "Insufficient Stock",
        description: `Only ${product.stock} units available for ${product.name}`,
      })
      return
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const existingItem = cart.find((item) => item.id === product.id)
    if (existingItem) {
      setCart(cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
        },
      ])
    }

    toast({
      title: "Item Added",
      description: `${product.name} added to cart`,
    })
  }

  const updateQuantity = (id: string, change: number) => {
    const item = cart.find((item) => item.id === id)
    const product = products.find((p) => p.id === id)

    if (item && product) {
      const newQuantity = item.quantity + change

      if (newQuantity > product.stock) {
        toast({
          variant: "destructive",
          title: "Insufficient Stock",
          description: `Only ${product.stock} units available`,
        })
        return
      }
    }

    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + change
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
          }
          return item
        })
        .filter((item) => item.quantity > 0),
    )
  }

  const removeFromCart = (id: string) => {
    const item = cart.find((item) => item.id === id)
    setCart(cart.filter((item) => item.id !== id))

    if (item) {
      toast({
        title: "Item Removed",
        description: `${item.name} removed from cart`,
      })
    }
  }

  const clearCart = () => {
    setCart([])
    toast({
      title: "Cart Cleared",
      description: "All items removed from cart",
    })
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const generateTransactionId = () => {
    return `TXN${Date.now().toString().slice(-6)}`
  }

  const generateReceiptData = (transactionId: string, paymentMethod: string) => {
    return {
      transactionId,
      timestamp: new Date().toISOString(),
      items: cart,
      subtotal,
      tax,
      total,
      paymentMethod,
      cashier: "Admin User",
      store: "MANPASAND Store #001",
    }
  }

  const downloadReceipt = (receiptData: any) => {
    const receiptContent = `
MANPASAND POS SYSTEM
${receiptData.store}
================================

Transaction ID: ${receiptData.transactionId}
Date: ${new Date(receiptData.timestamp).toLocaleString()}
Cashier: ${receiptData.cashier}

ITEMS:
${receiptData.items
        .map(
          (item: CartItem) =>
            `${item.name} x${item.quantity} @ $${item.price.toFixed(2)} = $${(item.price * item.quantity).toFixed(2)}`,
        )
        .join("\n")}

--------------------------------
Subtotal: $${receiptData.subtotal.toFixed(2)}
Tax (8%): $${receiptData.tax.toFixed(2)}
TOTAL: $${receiptData.total.toFixed(2)}

Payment Method: ${receiptData.paymentMethod}

Thank you for shopping with us!
================================
    `

    const blob = new Blob([receiptContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${receiptData.transactionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePayment = async (method: string) => {
    await withPaymentLoading(async () => {
      try {
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000))

        const transactionId = generateTransactionId()
        const receiptData = generateReceiptData(transactionId, method)

        // Save transaction to local storage (simulate database)
        const transactions = JSON.parse(localStorage.getItem("transactions") || "[]")
        transactions.push(receiptData)
        localStorage.setItem("transactions", JSON.stringify(transactions))

        setLastTransactionId(transactionId)
        setCart([])
        setPaymentDialogOpen(false)

        toast({
          title: "Payment Successful",
          description: `Transaction ${transactionId} completed via ${method}`,
        })

        // Auto-download receipt
        setTimeout(() => {
          downloadReceipt(receiptData)
          toast({
            title: "Receipt Downloaded",
            description: "Receipt has been saved to your downloads",
          })
        }, 1000)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Payment Failed",
          description: "There was an error processing your payment",
        })
      }
    })
  }

  const handleSuspendSale = async () => {
    if (cart.length === 0) {
      toast({
        variant: "destructive",
        title: "Empty Cart",
        description: "Cannot suspend an empty sale",
      })
      return
    }

    await withSuspendLoading(async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const suspendedSale: SuspendedSale = {
          id: `SUSP${Date.now().toString().slice(-6)}`,
          items: [...cart],
          total,
          timestamp: new Date().toISOString(),
        }

        const suspended = [...suspendedSales, suspendedSale]
        setSuspendedSales(suspended)
        localStorage.setItem("suspendedSales", JSON.stringify(suspended))

        setCart([])

        toast({
          title: "Sale Suspended",
          description: `Sale ${suspendedSale.id} has been suspended`,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Suspend Failed",
          description: "Could not suspend the sale",
        })
      }
    })
  }

  const handleBarcodeScan = async () => {
    await withScanLoading(async () => {
      try {
        // Simulate barcode scanning
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simulate finding a product by barcode
        const randomProduct = products[Math.floor(Math.random() * products.length)]
        await addToCart(randomProduct)

        toast({
          title: "Barcode Scanned",
          description: `Found ${randomProduct.name}`,
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Scan Failed",
          description: "Could not read barcode",
        })
      }
    })
  }

  const handleCategoryChange = async (category: string) => {
    setProductsLoading(true)
    setSelectedCategory(category)
    // Simulate loading products for category
    await new Promise((resolve) => setTimeout(resolve, 500))
    setProductsLoading(false)
  }

  return (
    <div className="flex h-screen">
      {/* Products Section */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
              {lastTransactionId && <p className="text-sm text-green-600">Last transaction: {lastTransactionId}</p>}
            </div>
            {cart.length > 0 && (
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
            )}
          </div>
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
            <LoadingButton variant="outline" size="icon" loading={scanLoading} onClick={handleBarcodeScan}>
              <Scan className="h-4 w-4" />
            </LoadingButton>
          </div>
        </div>

        {/* Categories */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => handleCategoryChange(category)}
              className="whitespace-nowrap"
              disabled={productsLoading}
            >
              {productsLoading && selectedCategory === category && <LoadingSpinner size="sm" className="mr-2" />}
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id)
              const isOutOfStock = product.stock === 0
              const isLowStock = product.stock <= 5 && product.stock > 0

              return (
                <Card
                  key={product.id}
                  className={`cursor-pointer hover:shadow-md transition-shadow ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  onClick={() => !isOutOfStock && addToCart(product)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative">
                      <span className="text-2xl">🛒</span>
                      {cartItem && <Badge className="absolute -top-2 -right-2 bg-blue-600">{cartItem.quantity}</Badge>}
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-lg font-bold text-blue-600">${product.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p
                        className={`text-sm ${isOutOfStock ? "text-red-500" : isLowStock ? "text-yellow-600" : "text-gray-500"}`}
                      >
                        Stock: {product.stock}
                      </p>
                      {isOutOfStock && <Badge variant="destructive">Out of Stock</Badge>}
                      {isLowStock && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {product.category}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Cart ({cart.length} items)</h2>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p>Your cart is empty</p>
              <p className="text-sm">Add products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <LoadingButton
                className="w-full"
                onClick={() => setPaymentDialogOpen(true)}
                loading={paymentLoading}
                disabled={cart.length === 0}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Process Payment
              </LoadingButton>
              <LoadingButton
                variant="outline"
                className="w-full"
                loading={suspendLoading}
                onClick={handleSuspendSale}
                disabled={cart.length === 0}
              >
                Suspend Sale
              </LoadingButton>
            </div>
          </div>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Total Amount:</span>
                <span className="font-bold text-xl">${total.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600">{cart.length} item(s) • Tax included</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <LoadingButton
                onClick={() => handlePayment("Cash")}
                className="h-16"
                loading={paymentLoading}
                loadingText="Processing..."
              >
                <DollarSign className="h-6 w-6 mr-2" />
                Cash
              </LoadingButton>
              <LoadingButton
                onClick={() => handlePayment("Card")}
                variant="outline"
                className="h-16"
                loading={paymentLoading}
                loadingText="Processing..."
              >
                <CreditCard className="h-6 w-6 mr-2" />
                Card
              </LoadingButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
