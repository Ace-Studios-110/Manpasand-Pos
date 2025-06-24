"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Loader2, Trash2, Edit, Eye, RefreshCcw } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { API_BASE } from "@/config/constants";

interface Customer { id: string; email: string; name: string | null; }
interface Product { id: string; name: string; }
interface OrderItem { productId: string; quantity: number; product: { name: string }; }
interface Order { id: string; order_number: string; total_amount: string; status: string; created_at: string; items: OrderItem[]; }

const Orders: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [orderForm, setOrderForm] = useState<{
    customerId: string;
    paymentMethod: string;
    items: OrderItem[];
  }>({ customerId: "", paymentMethod: "CASH", items: [{ productId: "", quantity: 1, product: { name: "" } }] });

  useEffect(() => {
    fetchMetadata();
    fetchOrders();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        apiClient.get(`${API_BASE}/user/customer`),
        apiClient.get(`${API_BASE}/products?limit=100`),
      ]);
      setCustomers(cRes.data.data);
      setProducts(pRes.data.data);
    } catch (err) {
      console.error("Metadata load failed", err);
    }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await apiClient.get(`${API_BASE}/order`, { params });
      setOrders(res.data.data);
    } catch (err) {
      console.error("Orders load failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async () => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`${API_BASE}/order`, orderForm);
      setIsAddOpen(false);
      resetForm();
      fetchOrders();
    } catch (err) {
      console.error("Order creation failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setOrderForm({ customerId: "", paymentMethod: "CASH", items: [{ productId: "", quantity: 1, product: { name: "" } }] });
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await apiClient.delete(`${API_BASE}/order/${orderId}`);
      fetchOrders();
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await apiClient.patch(`${API_BASE}/order/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const viewOrderDetail = async (orderId: string) => {
    try {
      const res = await apiClient.get(`${API_BASE}/order/${orderId}`);
      setSelectedOrder(res.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      console.error("Fetch detail failed", err);
    }
  };

  const addItemRow = () => setOrderForm(f => ({ ...f, items: [...f.items, { productId: "", quantity: 1, product: { name: "" } }] }));
  const removeItemRow = (idx: number) => setOrderForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const filtered = orders
    .filter(o => o.order_number.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search Order #"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Label htmlFor="status-filter">Status:</Label>
          <select id="status-filter" className="border rounded p-2" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); fetchOrders(); }}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <Button onClick={fetchOrders} variant="outline"><RefreshCcw className="animate-spin w-4 h-4" /></Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus /> New Order</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Order</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Customer</Label>
                  <select className="w-full p-2 border rounded" value={orderForm.customerId} onChange={e => setOrderForm({ ...orderForm, customerId: e.target.value })}>
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <select className="w-full p-2 border rounded" value={orderForm.paymentMethod} onChange={e => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}>
                    {['CASH','CARD','MOBILE_MONEY'].map(pm => <option key={pm} value={pm}>{pm.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                {orderForm.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-3 gap-3 items-end">
                    <div>
                      <Label>Product</Label>
                      <select className="w-full p-2 border rounded" value={item.productId} onChange={e => {
                        const pid = e.target.value;
                        setOrderForm(f => { const items=[...f.items]; items[idx].productId=pid; return {...f,items}; });
                      }}>
                        <option value="">Select product</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Qty</Label>
                      <Input type="number" min={1} value={item.quantity} onChange={e => {
                        const q=Number(e.target.value);
                        setOrderForm(f=>{const items=[...f.items];items[idx].quantity=q;return{...f,items};});
                      }}/>
                    </div>
                    <Button variant="outline" size="sm" onClick={()=>removeItemRow(idx)}>Remove</Button>
                  </div>
                ))}
                <Button variant="link" onClick={addItemRow}>+ Add item</Button>
                <Button onClick={handleCreateOrder} disabled={isSubmitting}>{isSubmitting?<Loader2 className="animate-spin"/>:"Submit"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Orders List</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Loader2 className="animate-spin mx-auto"/> : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(o=> (
                  <TableRow key={o.id}>
                    <TableCell>{o.order_number}</TableCell>
                    <TableCell>${Number(o.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <select className="border rounded p-1" value={o.status} onChange={e=>handleStatusUpdate(o.id,e.target.value)}>
                        <option>PROCESSING</option><option>COMPLETED</option>
                      </select>
                    </TableCell>
                    <TableCell>{o.created_at.split('T')[0]}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={()=>viewOrderDetail(o.id)}><Eye className="w-4 h-4"/></Button>
                      <Button size="sm" variant="outline" onClick={()=>handleCancelOrder(o.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={()=>setIsDetailOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-2">
              <p><strong>Order #:</strong> {selectedOrder.order_number}</p>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Date:</strong> {selectedOrder.created_at.split('T')[0]}</p>
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Product</TableHead><TableHead>Qty</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {selectedOrder.items.map(item=>(
                    <TableRow key={item.productId}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
