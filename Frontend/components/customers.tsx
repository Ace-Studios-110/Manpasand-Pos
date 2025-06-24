"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Phone,
  Mail,
  MapPin,
  Loader2,
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { API_BASE } from "@/config/constants";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone_number: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({});
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // 1) Fetch customers
  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`${API_BASE}/user/customer`);
      // API shape: { success, message, data: Customer[] }
      setCustomers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2) Create customer (email only)
  const handleAddCustomer = async () => {
    if (!newCustomer.email) return;
    setIsAdding(true);
    try {
      await apiClient.post(`${API_BASE}/user/customer`, {
        email: newCustomer.email,
      });
      setNewCustomer({});
      setIsAddDialogOpen(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  // Local edit / delete (unchanged)
  const handleEditCustomer = () => {
    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id ? editingCustomer : c
        )
      );
      setEditingCustomer(null);
    }
  };
  const handleDeleteCustomer = (id: string) =>
    setCustomers((prev) => prev.filter((c) => c.id !== id));

  // Stats (total, active, revenue — revenue = 0 since API doesn’t return it)
  const activeCount = customers.filter((c) => c.is_active).length;
  const totalRevenue = 0;

  // Filter by name/email/phone
  const filteredCustomers = customers.filter((customer) =>
    (customer.name || customer.email || customer.phone_number || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* — Header & Add Dialog (original markup) — */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Customer Management
          </h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newCustomer.email || ""}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <Button
                onClick={handleAddCustomer}
                className="w-full"
                disabled={isAdding}
              >
                {isAdding ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* — Stats Cards (unchanged) — */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeCount}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* — Search (unchanged) — */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* — Table with Loader inserted — */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Last Visit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                   
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                  
                  
                    <TableCell>
                      {customer.created_at.split("T")[0]}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          customer.is_active ? "default" : "secondary"
                        }
                        className={
                          customer.is_active
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                      >
                        {customer.is_active ? "active" : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingCustomer(customer)
                          }
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDeleteCustomer(customer.id)
                          }
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
          )}
        </CardContent>
      </Card>

      {/* — Edit Dialog (unchanged) — */}
      <Dialog
        open={!!editingCustomer}
        onOpenChange={() => setEditingCustomer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingCustomer.email}
                  onChange={(e) =>
                    setEditingCustomer({
                      ...editingCustomer,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              
             
              <Button
                onClick={handleEditCustomer}
                className="w-full"
              >
                Update Customer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
