"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Trash2, Grid3X3, Package } from "lucide-react"

interface Category {
  id: string
  name: string
  description: string
  productCount: number
  color: string
  status: "active" | "inactive"
  createdDate: string
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Fruits",
      description: "Fresh fruits and seasonal produce",
      productCount: 15,
      color: "#10B981",
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: "2",
      name: "Dairy",
      description: "Milk, cheese, yogurt and dairy products",
      productCount: 8,
      color: "#3B82F6",
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: "3",
      name: "Bakery",
      description: "Bread, pastries and baked goods",
      productCount: 12,
      color: "#F59E0B",
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: "4",
      name: "Beverages",
      description: "Soft drinks, juices and beverages",
      productCount: 20,
      color: "#8B5CF6",
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: "5",
      name: "Snacks",
      description: "Chips, cookies and snack items",
      productCount: 25,
      color: "#EF4444",
      status: "active",
      createdDate: "2024-01-01",
    },
    {
      id: "6",
      name: "Frozen Foods",
      description: "Frozen vegetables, meals and ice cream",
      productCount: 0,
      color: "#06B6D4",
      status: "inactive",
      createdDate: "2024-01-01",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({})

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.description) {
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        description: newCategory.description,
        productCount: 0,
        color: newCategory.color || "#6B7280",
        status: "active",
        createdDate: new Date().toISOString().split("T")[0],
      }
      setCategories([...categories, category])
      setNewCategory({})
      setIsAddDialogOpen(false)
    }
  }

  const handleEditCategory = () => {
    if (editingCategory) {
      setCategories(categories.map((c) => (c.id === editingCategory.id ? editingCategory : c)))
      setEditingCategory(null)
    }
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
  }

  const activeCategories = categories.filter((c) => c.status === "active").length
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0)

  const colorOptions = [
    "#10B981",
    "#3B82F6",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6366F1",
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600">Organize your products into categories</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCategory.description || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex space-x-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAddCategory} className="w-full">
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Grid3X3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCategories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>
                <Badge
                  variant={category.status === "active" ? "default" : "secondary"}
                  className={category.status === "active" ? "bg-green-100 text-green-800" : ""}
                >
                  {category.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{category.productCount} products</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Category Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex space-x-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        editingCategory.color === color ? "border-gray-900" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setEditingCategory({ ...editingCategory, color })}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleEditCategory} className="w-full">
                Update Category
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
