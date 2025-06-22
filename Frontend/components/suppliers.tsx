"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Truck, Phone, Mail, MapPin } from "lucide-react"

interface Supplier {
  id: string
  name: string
  contact: string
  email: string
  phone: string
  address: string
  category: string
  status: "active" | "inactive"
  totalOrders: number
  lastOrder: string
}

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "1",
      name: "Fresh Farms Co.",
      contact: "John Anderson",
      email: "john@freshfarms.com",
      phone: "+1 555-0101",
      address: "123 Farm Road, Green Valley, CA",
      category: "Fruits & Vegetables",
      status: "active",
      totalOrders: 45,
      lastOrder: "2024-01-14",
    },
    {
      id: "2",
      name: "Dairy Excellence Ltd.",
      contact: "Sarah Miller",
      email: "sarah@dairyexcellence.com",
      phone: "+1 555-0102",
      address: "456 Dairy Lane, Milk Town, WI",
      category: "Dairy Products",
      status: "active",
      totalOrders: 32,
      lastOrder: "2024-01-13",
    },
    {
      id: "3",
      name: "Golden Bakery Supply",
      contact: "Mike Johnson",
      email: "mike@goldenbakery.com",
      phone: "+1 555-0103",
      address: "789 Bread Street, Wheat City, KS",
      category: "Bakery Items",
      status: "active",
      totalOrders: 28,
      lastOrder: "2024-01-12",
    },
    {
      id: "4",
      name: "Beverage World Inc.",
      contact: "Lisa Davis",
      email: "lisa@beverageworld.com",
      phone: "+1 555-0104",
      address: "321 Drink Ave, Soda Springs, CO",
      category: "Beverages",
      status: "inactive",
      totalOrders: 15,
      lastOrder: "2023-12-20",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({})

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddSupplier = () => {
    if (newSupplier.name && newSupplier.contact && newSupplier.email) {
      const supplier: Supplier = {
        id: Date.now().toString(),
        name: newSupplier.name,
        contact: newSupplier.contact,
        email: newSupplier.email,
        phone: newSupplier.phone || "",
        address: newSupplier.address || "",
        category: newSupplier.category || "General",
        status: "active",
        totalOrders: 0,
        lastOrder: "",
      }
      setSuppliers([...suppliers, supplier])
      setNewSupplier({})
      setIsAddDialogOpen(false)
    }
  }

  const handleEditSupplier = () => {
    if (editingSupplier) {
      setSuppliers(suppliers.map((s) => (s.id === editingSupplier.id ? editingSupplier : s)))
      setEditingSupplier(null)
    }
  }

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter((s) => s.id !== id))
  }

  const activeSuppliers = suppliers.filter((s) => s.status === "active").length
  const totalOrders = suppliers.reduce((sum, s) => sum + s.totalOrders, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600">Manage your suppliers and vendor relationships</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={newSupplier.name || ""}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="contact">Contact Person</Label>
                <Input
                  id="contact"
                  value={newSupplier.contact || ""}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newSupplier.email || ""}
                    onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newSupplier.phone || ""}
                    onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={newSupplier.address || ""}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newSupplier.category || ""}
                  onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                  placeholder="e.g., Fruits & Vegetables, Dairy, etc."
                />
              </div>
              <Button onClick={handleAddSupplier} className="w-full">
                Add Supplier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Truck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSuppliers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{supplier.name}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {supplier.address}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{supplier.contact}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-3 w-3 mr-1" />
                        {supplier.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-3 w-3 mr-1" />
                        {supplier.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{supplier.category}</Badge>
                  </TableCell>
                  <TableCell>{supplier.totalOrders}</TableCell>
                  <TableCell>{supplier.lastOrder || "Never"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={supplier.status === "active" ? "default" : "secondary"}
                      className={supplier.status === "active" ? "bg-green-100 text-green-800" : ""}
                    >
                      {supplier.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingSupplier(supplier)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Supplier Dialog */}
      <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          {editingSupplier && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Company Name</Label>
                <Input
                  id="edit-name"
                  value={editingSupplier.name}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-contact">Contact Person</Label>
                <Input
                  id="edit-contact"
                  value={editingSupplier.contact}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, contact: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingSupplier.email}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editingSupplier.phone}
                    onChange={(e) => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editingSupplier.address}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editingSupplier.category}
                  onChange={(e) => setEditingSupplier({ ...editingSupplier, category: e.target.value })}
                />
              </div>
              <Button onClick={handleEditSupplier} className="w-full">
                Update Supplier
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
