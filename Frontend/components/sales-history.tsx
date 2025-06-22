"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, Eye, RefreshCw, Download, CalendarIcon, Filter, Receipt, FileText, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns"

interface Sale {
  id: string
  date: string
  time: string
  customer: string
  items: number
  total: number
  paymentMethod: string
  status: "completed" | "refunded" | "pending"
  cashier: string
  itemDetails: Array<{
    name: string
    quantity: number
    price: number
    total: number
  }>
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface AdvancedFilters {
  cashier: string
  minAmount: string
  maxAmount: string
  itemCount: string
}

export function SalesHistory() {
  const { toast } = useToast()

  const [sales, setSales] = useState<Sale[]>([
    {
      id: "TXN001",
      date: "2024-01-15",
      time: "14:30",
      customer: "John Doe",
      items: 5,
      total: 45.5,
      paymentMethod: "Cash",
      status: "completed",
      cashier: "Sarah Johnson",
      itemDetails: [
        { name: "Banana", quantity: 2, price: 0.75, total: 1.5 },
        { name: "Orange", quantity: 3, price: 0.6, total: 1.8 },
        { name: "Milk", quantity: 1, price: 3.5, total: 3.5 },
        { name: "Bread", quantity: 2, price: 2.25, total: 4.5 },
        { name: "Eggs", quantity: 1, price: 4.2, total: 4.2 },
      ],
    },
    {
      id: "TXN002",
      date: "2024-01-15",
      time: "14:25",
      customer: "Jane Smith",
      items: 3,
      total: 78.2,
      paymentMethod: "Card",
      status: "completed",
      cashier: "Mike Davis",
      itemDetails: [
        { name: "Chicken Breast", quantity: 2, price: 12.99, total: 25.98 },
        { name: "Rice", quantity: 1, price: 8.5, total: 8.5 },
        { name: "Vegetables", quantity: 3, price: 4.24, total: 12.72 },
      ],
    },
    {
      id: "TXN003",
      date: "2024-01-15",
      time: "14:20",
      customer: "Walk-in Customer",
      items: 2,
      total: 32.1,
      paymentMethod: "Cash",
      status: "pending",
      cashier: "Sarah Johnson",
      itemDetails: [
        { name: "Coffee", quantity: 2, price: 4.5, total: 9.0 },
        { name: "Sandwich", quantity: 1, price: 8.75, total: 8.75 },
      ],
    },
    {
      id: "TXN004",
      date: "2024-01-14",
      time: "16:15",
      customer: "Mike Johnson",
      items: 8,
      total: 156.75,
      paymentMethod: "Card",
      status: "completed",
      cashier: "Lisa Wilson",
      itemDetails: [
        { name: "Laptop Charger", quantity: 1, price: 45.99, total: 45.99 },
        { name: "USB Cable", quantity: 2, price: 12.5, total: 25.0 },
        { name: "Phone Case", quantity: 1, price: 29.99, total: 29.99 },
        { name: "Screen Protector", quantity: 2, price: 9.99, total: 19.98 },
        { name: "Wireless Mouse", quantity: 1, price: 35.79, total: 35.79 },
      ],
    },
    {
      id: "TXN005",
      date: "2024-01-14",
      time: "12:10",
      customer: "Sarah Wilson",
      items: 4,
      total: 89.3,
      paymentMethod: "Cash",
      status: "refunded",
      cashier: "Mike Davis",
      itemDetails: [
        { name: "Jacket", quantity: 1, price: 45.0, total: 45.0 },
        { name: "T-Shirt", quantity: 2, price: 15.99, total: 31.98 },
        { name: "Socks", quantity: 3, price: 4.11, total: 12.32 },
      ],
    },
    {
      id: "TXN006",
      date: "2024-01-13",
      time: "10:45",
      customer: "Robert Brown",
      items: 6,
      total: 234.5,
      paymentMethod: "Card",
      status: "completed",
      cashier: "Lisa Wilson",
      itemDetails: [
        { name: "Gaming Headset", quantity: 1, price: 89.99, total: 89.99 },
        { name: "Keyboard", quantity: 1, price: 65.5, total: 65.5 },
        { name: "Mouse Pad", quantity: 2, price: 12.99, total: 25.98 },
        { name: "USB Hub", quantity: 1, price: 24.99, total: 24.99 },
        { name: "Cable Management", quantity: 1, price: 28.04, total: 28.04 },
      ],
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false)
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    cashier: "all",
    minAmount: "",
    maxAmount: "",
    itemCount: "",
  })

  const cashiers = useMemo(() => {
    const uniqueCashiers = Array.from(new Set(sales.map((sale) => sale.cashier)))
    return uniqueCashiers.sort()
  }, [sales])

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Search filter
      const matchesSearch =
        sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.cashier.toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const matchesStatus = statusFilter === "all" || sale.status === statusFilter

      // Payment filter
      const matchesPayment = paymentFilter === "all" || sale.paymentMethod.toLowerCase() === paymentFilter

      // Date range filter
      let matchesDateRange = true
      if (dateRange.from || dateRange.to) {
        const saleDate = parseISO(sale.date)
        if (dateRange.from && dateRange.to) {
          matchesDateRange = isWithinInterval(saleDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          })
        } else if (dateRange.from) {
          matchesDateRange = saleDate >= startOfDay(dateRange.from)
        } else if (dateRange.to) {
          matchesDateRange = saleDate <= endOfDay(dateRange.to)
        }
      }

      // Advanced filters
      const matchesCashier = advancedFilters.cashier === "all" || sale.cashier === advancedFilters.cashier

      const matchesMinAmount = !advancedFilters.minAmount || sale.total >= Number.parseFloat(advancedFilters.minAmount)

      const matchesMaxAmount = !advancedFilters.maxAmount || sale.total <= Number.parseFloat(advancedFilters.maxAmount)

      const matchesItemCount = !advancedFilters.itemCount || sale.items >= Number.parseInt(advancedFilters.itemCount)

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesDateRange &&
        matchesCashier &&
        matchesMinAmount &&
        matchesMaxAmount &&
        matchesItemCount
      )
    })
  }, [sales, searchTerm, statusFilter, paymentFilter, dateRange, advancedFilters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "refunded":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const completedSales = filteredSales.filter((sale) => sale.status === "completed").length

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would fetch fresh data here
    // For demo, we'll just show a success message
    toast({
      title: "Data refreshed",
      description: "Sales data has been updated successfully.",
    })
    setIsRefreshing(false)
  }

  const handleExport = (format: "csv" | "pdf" | "excel") => {
    const exportData = filteredSales.map((sale) => ({
      "Transaction ID": sale.id,
      Date: sale.date,
      Time: sale.time,
      Customer: sale.customer,
      Items: sale.items,
      Total: sale.total,
      "Payment Method": sale.paymentMethod,
      Status: sale.status,
      Cashier: sale.cashier,
    }))

    if (format === "csv") {
      // Generate CSV
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(","),
        ...exportData.map((row) => headers.map((header) => `"${row[header as keyof typeof row]}"`).join(",")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `sales-history-${format(new Date(), "yyyy-MM-dd")}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === "excel") {
      // Generate Excel (using CSV format with .xlsx extension for simplicity)
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join("\t"),
        ...exportData.map((row) => headers.map((header) => `${row[header as keyof typeof row]}`).join("\t")),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `sales-history-${format(new Date(), "yyyy-MM-dd")}.xlsx`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === "pdf") {
      // Generate PDF
      generatePDFReport(exportData)
    }

    toast({
      title: `Export ${format.toUpperCase()} completed`,
      description: `Downloaded ${exportData.length} sales records successfully.`,
    })
  }

  const generatePDFReport = (data: any[]) => {
    // Create PDF content
    const pdfContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Sales History Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        .status-completed { color: #16a34a; }
        .status-pending { color: #ca8a04; }
        .status-refunded { color: #dc2626; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sales History Report</h1>
        <p>Generated on ${format(new Date(), "MMMM dd, yyyy 'at' HH:mm")}</p>
        <p>Total Records: ${data.length}</p>
    </div>
    
    <div class="summary">
        <h3>Summary</h3>
        <p><strong>Total Sales:</strong> $${totalSales.toFixed(2)}</p>
        <p><strong>Completed Transactions:</strong> ${completedSales}</p>
        <p><strong>Average Sale:</strong> $${data.length > 0 ? (totalSales / data.length).toFixed(2) : "0.00"}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Cashier</th>
            </tr>
        </thead>
        <tbody>
            ${data
        .map(
          (row) => `
                <tr>
                    <td>${row["Transaction ID"]}</td>
                    <td>${row.Date}</td>
                    <td>${row.Time}</td>
                    <td>${row.Customer}</td>
                    <td>${row.Items}</td>
                    <td>$${row.Total.toFixed(2)}</td>
                    <td>${row["Payment Method"]}</td>
                    <td class="status-${row.Status}">${row.Status}</td>
                    <td>${row.Cashier}</td>
                </tr>
            `,
        )
        .join("")}
        </tbody>
    </table>
</body>
</html>`

    // Create blob and download
    const blob = new Blob([pdfContent], { type: "text/html" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `sales-history-${format(new Date(), "yyyy-MM-dd")}.html`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Also open in new window for printing as PDF
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(pdfContent)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }
  }

  const handlePrintReceipt = (sale: Sale) => {
    // Generate receipt HTML
    const receiptContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - ${sale.id}</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            max-width: 300px; 
            margin: 0 auto; 
            padding: 20px;
            font-size: 12px;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .store-name { font-size: 18px; font-weight: bold; }
        .divider { border-top: 1px dashed #000; margin: 10px 0; }
        .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .total-row { font-weight: bold; font-size: 14px; }
        .footer { text-align: center; margin-top: 20px; font-size: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="store-name">Manpasand Store</div>
        <div>123 Main Street</div>
        <div>City, State 12345</div>
        <div>Phone: (555) 123-4567</div>
    </div>
    
    <div class="divider"></div>
    
    <div>
        <div><strong>Transaction:</strong> ${sale.id}</div>
        <div><strong>Date:</strong> ${sale.date}</div>
        <div><strong>Time:</strong> ${sale.time}</div>
        <div><strong>Cashier:</strong> ${sale.cashier}</div>
        <div><strong>Customer:</strong> ${sale.customer}</div>
    </div>
    
    <div class="divider"></div>
    
    <div>
        ${sale.itemDetails
        .map(
          (item) => `
            <div class="item-row">
                <div>${item.name} x${item.quantity}</div>
                <div>$${item.total.toFixed(2)}</div>
            </div>
            <div style="font-size: 10px; color: #666; margin-left: 10px;">
                $${item.price.toFixed(2)} each
            </div>
        `,
        )
        .join("")}
    </div>
    
    <div class="divider"></div>
    
    <div class="item-row total-row">
        <div>TOTAL (${sale.items} items)</div>
        <div>$${sale.total.toFixed(2)}</div>
    </div>
    
    <div class="item-row">
        <div>Payment Method:</div>
        <div>${sale.paymentMethod}</div>
    </div>
    
    <div class="item-row">
        <div>Status:</div>
        <div>${sale.status.toUpperCase()}</div>
    </div>
    
    <div class="divider"></div>
    
    <div class="footer">
        <div>Thank you for your business!</div>
        <div>Please keep this receipt for your records</div>
        <div style="margin-top: 10px;">
            Generated: ${format(new Date(), "yyyy-MM-dd HH:mm:ss")}
        </div>
    </div>
</body>
</html>`

    // Create blob and download as HTML
    const blob = new Blob([receiptContent], { type: "text/html" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `receipt-${sale.id}.html`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Also open in new window for printing
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(receiptContent)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 500)
    }

    toast({
      title: "Receipt generated",
      description: `Receipt for transaction ${sale.id} has been downloaded and opened for printing.`,
    })
  }

  const handleRefund = (sale: Sale) => {
    if (sale.status === "completed") {
      setSales((prev) => prev.map((s) => (s.id === sale.id ? { ...s, status: "refunded" as const } : s)))
      toast({
        title: "Refund processed",
        description: `Refund for transaction ${sale.id} has been processed.`,
      })
      setSelectedSale(null)
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setDateRange({ from: undefined, to: undefined })
    setAdvancedFilters({
      cashier: "all",
      minAmount: "",
      maxAmount: "",
      itemCount: "",
    })
    toast({
      title: "Filters cleared",
      description: "All filters have been reset.",
    })
  }

  const formatDateRange = () => {
    if (!dateRange.from && !dateRange.to) return "Date Range"
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM dd")}`
    }
    if (dateRange.to) {
      return `Until ${format(dateRange.to, "MMM dd")}`
    }
    return "Date Range"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-600">View and manage all sales transactions</p>
        </div>
        <div className="flex space-x-2">
          <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label>Select Date Range</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setDateRange({ from: undefined, to: undefined })
                      setIsDateRangeOpen(false)
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button size="sm" onClick={() => setIsDateRangeOpen(false)} className="flex-1">
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("csv")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("excel")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as Excel
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => handleExport("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedSales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Sale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredSales.length > 0 ? (totalSales / filteredSales.length).toFixed(2) : "0.00"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by transaction ID, customer, or cashier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setIsAdvancedFiltersOpen(true)}>
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
            {(searchTerm ||
              statusFilter !== "all" ||
              paymentFilter !== "all" ||
              dateRange.from ||
              dateRange.to ||
              advancedFilters.cashier !== "all" ||
              advancedFilters.minAmount ||
              advancedFilters.maxAmount ||
              advancedFilters.itemCount) && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No transactions found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sale.date}</div>
                        <div className="text-sm text-gray-500">{sale.time}</div>
                      </div>
                    </TableCell>
                    <TableCell>{sale.customer}</TableCell>
                    <TableCell>{sale.items}</TableCell>
                    <TableCell className="font-medium">${sale.total.toFixed(2)}</TableCell>
                    <TableCell>{sale.paymentMethod}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                    </TableCell>
                    <TableCell>{sale.cashier}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedSale(sale)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePrintReceipt(sale)}>
                          <Receipt className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Advanced Filters Dialog */}
      <Dialog open={isAdvancedFiltersOpen} onOpenChange={setIsAdvancedFiltersOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cashier-filter">Cashier</Label>
              <Select
                value={advancedFilters.cashier}
                onValueChange={(value) => setAdvancedFilters((prev) => ({ ...prev, cashier: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cashier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cashiers</SelectItem>
                  {cashiers.map((cashier) => (
                    <SelectItem key={cashier} value={cashier}>
                      {cashier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min-amount">Min Amount</Label>
                <Input
                  id="min-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={advancedFilters.minAmount}
                  onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, minAmount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="max-amount">Max Amount</Label>
                <Input
                  id="max-amount"
                  type="number"
                  step="0.01"
                  placeholder="999.99"
                  value={advancedFilters.maxAmount}
                  onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, maxAmount: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="item-count">Min Items</Label>
              <Input
                id="item-count"
                type="number"
                placeholder="1"
                value={advancedFilters.itemCount}
                onChange={(e) => setAdvancedFilters((prev) => ({ ...prev, itemCount: e.target.value }))}
              />
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAdvancedFilters({
                    cashier: "all",
                    minAmount: "",
                    maxAmount: "",
                    itemCount: "",
                  })
                }}
                className="flex-1"
              >
                Clear
              </Button>
              <Button onClick={() => setIsAdvancedFiltersOpen(false)} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sale Details Dialog */}
      <Dialog open={!!selectedSale} onOpenChange={() => setSelectedSale(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details - {selectedSale?.id}</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-2">Transaction Info</h3>
                  <div className="space-y-1 text-sm">
                    <div>Date: {selectedSale.date}</div>
                    <div>Time: {selectedSale.time}</div>
                    <div>Cashier: {selectedSale.cashier}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Customer Info</h3>
                  <div className="space-y-1 text-sm">
                    <div>Name: {selectedSale.customer}</div>
                    <div>Payment: {selectedSale.paymentMethod}</div>
                    <div>
                      Status: <Badge className={getStatusColor(selectedSale.status)}>{selectedSale.status}</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Items Purchased</h3>
                <div className="border rounded-lg p-4">
                  <div className="space-y-2">
                    {selectedSale.itemDetails.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex-1">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">x {item.quantity}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.total.toFixed(2)}</div>
                          <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total ({selectedSale.items} items)</span>
                    <span>${selectedSale.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1" onClick={() => handlePrintReceipt(selectedSale)}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                {selectedSale.status === "completed" && (
                  <Button variant="outline" className="flex-1" onClick={() => handleRefund(selectedSale)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
