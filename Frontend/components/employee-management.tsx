"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Edit, Trash2, UserCheck, DollarSign, Award, Eye, BarChart3 } from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: string
  salary: number
  status: "active" | "inactive"
  joinDate: string
  totalSales: number
  hoursWorked: number
  performance: number
}

interface NewEmployeeForm {
  name: string
  email: string
  phone: string
  role: string
  salary: string
}

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@manpasand.com",
      phone: "+1 234-567-8901",
      role: "Manager",
      salary: 4500,
      status: "active",
      joinDate: "2023-01-15",
      totalSales: 15420.5,
      hoursWorked: 160,
      performance: 95,
    },
    {
      id: "2",
      name: "Mike Davis",
      email: "mike@manpasand.com",
      phone: "+1 234-567-8902",
      role: "Cashier",
      salary: 3200,
      status: "active",
      joinDate: "2023-03-20",
      totalSales: 12850.75,
      hoursWorked: 155,
      performance: 88,
    },
    {
      id: "3",
      name: "Lisa Wilson",
      email: "lisa@manpasand.com",
      phone: "+1 234-567-8903",
      role: "Cashier",
      salary: 3000,
      status: "active",
      joinDate: "2023-06-10",
      totalSales: 9875.0,
      hoursWorked: 148,
      performance: 92,
    },
    {
      id: "4",
      name: "John Smith",
      email: "john@manpasand.com",
      phone: "+1 234-567-8904",
      role: "Stock Manager",
      salary: 3800,
      status: "inactive",
      joinDate: "2022-11-05",
      totalSales: 0,
      hoursWorked: 0,
      performance: 0,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isPerformanceDialogOpen, setIsPerformanceDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeleteingEmployee] = useState<Employee | null>(null)

  const [newEmployee, setNewEmployee] = useState<NewEmployeeForm>({
    name: "",
    email: "",
    phone: "",
    role: "",
    salary: "",
  })

  const [performanceData, setPerformanceData] = useState({
    totalSales: "",
    hoursWorked: "",
    performance: "",
  })

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.email && newEmployee.role && newEmployee.salary) {
      const employee: Employee = {
        id: Date.now().toString(),
        name: newEmployee.name,
        email: newEmployee.email,
        phone: newEmployee.phone,
        role: newEmployee.role,
        salary: Number.parseInt(newEmployee.salary),
        status: "active",
        joinDate: new Date().toISOString().split("T")[0],
        totalSales: 0,
        hoursWorked: 0,
        performance: 0,
      }
      setEmployees([...employees, employee])
      setNewEmployee({ name: "", email: "", phone: "", role: "", salary: "" })
      setIsAddDialogOpen(false)
    }
  }

  const handleEditEmployee = () => {
    if (editingEmployee) {
      setEmployees(employees.map((e) => (e.id === editingEmployee.id ? editingEmployee : e)))
      setEditingEmployee(null)
      setIsEditDialogOpen(false)
    }
  }

  const handleUpdatePerformance = () => {
    if (editingEmployee && performanceData.performance) {
      const updatedEmployee = {
        ...editingEmployee,
        totalSales: Number.parseFloat(performanceData.totalSales) || editingEmployee.totalSales,
        hoursWorked: Number.parseInt(performanceData.hoursWorked) || editingEmployee.hoursWorked,
        performance: Number.parseInt(performanceData.performance),
      }

      setEmployees(employees.map((e) => (e.id === editingEmployee.id ? updatedEmployee : e)))
      setPerformanceData({ totalSales: "", hoursWorked: "", performance: "" })
      setEditingEmployee(null)
      setIsPerformanceDialogOpen(false)
    }
  }

  const handleDeleteEmployee = () => {
    if (deletingEmployee) {
      setEmployees(employees.filter((e) => e.id !== deletingEmployee.id))
      setDeleteingEmployee(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleToggleStatus = (employee: Employee) => {
    const newStatus = employee.status === "active" ? "inactive" : "active"
    setEmployees(employees.map((e) => (e.id === employee.id ? { ...e, status: newStatus } : e)))
  }

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee({ ...employee })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (employee: Employee) => {
    setViewingEmployee(employee)
    setIsViewDialogOpen(true)
  }

  const openPerformanceDialog = (employee: Employee) => {
    setEditingEmployee(employee)
    setPerformanceData({
      totalSales: employee.totalSales.toString(),
      hoursWorked: employee.hoursWorked.toString(),
      performance: employee.performance.toString(),
    })
    setIsPerformanceDialogOpen(true)
  }

  const openDeleteDialog = (employee: Employee) => {
    setDeleteingEmployee(employee)
    setIsDeleteDialogOpen(true)
  }

  const activeEmployees = employees.filter((e) => e.status === "active").length
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0)
  const avgPerformance =
    employees.length > 0 ? employees.reduce((sum, e) => sum + e.performance, 0) / employees.length : 0

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 75) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage your team and track performance</p>
        </div>

        {/* Add Employee Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newEmployee.role}
                    onValueChange={(value) => setNewEmployee({ ...newEmployee, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Stock Manager">Stock Manager</SelectItem>
                      <SelectItem value="Sales Associate">Sales Associate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="salary">Monthly Salary ($)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    placeholder="Enter salary"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee}>Add Employee</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Salaries</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSalaries.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPerformance.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">Joined {employee.joinDate}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">{employee.email}</div>
                      <div className="text-sm text-gray-500">{employee.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>${employee.salary.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className={`text-sm font-medium ${getPerformanceColor(employee.performance)}`}>
                        {employee.performance}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${employee.performance}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.status === "active" ? "default" : "secondary"}
                      className={`cursor-pointer ${employee.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-200" : "hover:bg-gray-200"}`}
                      onClick={() => handleToggleStatus(employee)}
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => openViewDialog(employee)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(employee)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openPerformanceDialog(employee)}>
                        <BarChart3 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(employee)}
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

      {/* View Employee Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {viewingEmployee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{viewingEmployee.name}</h3>
                  <p className="text-gray-600">{viewingEmployee.role}</p>
                  <Badge className={viewingEmployee.status === "active" ? "bg-green-100 text-green-800" : ""}>
                    {viewingEmployee.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p>{viewingEmployee.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p>{viewingEmployee.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Salary</Label>
                  <p className="text-lg font-semibold">${viewingEmployee.salary.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Join Date</Label>
                  <p>{viewingEmployee.joinDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Sales</Label>
                  <p className="text-lg font-semibold">${viewingEmployee.totalSales.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Hours Worked</Label>
                  <p>{viewingEmployee.hoursWorked} hours</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Performance</Label>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${getPerformanceColor(viewingEmployee.performance)}`}>
                      {viewingEmployee.performance}%
                    </span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${viewingEmployee.performance}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editingEmployee.phone}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select
                    value={editingEmployee.role}
                    onValueChange={(value) => setEditingEmployee({ ...editingEmployee, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Stock Manager">Stock Manager</SelectItem>
                      <SelectItem value="Sales Associate">Sales Associate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-salary">Monthly Salary ($)</Label>
                  <Input
                    id="edit-salary"
                    type="number"
                    value={editingEmployee.salary}
                    onChange={(e) =>
                      setEditingEmployee({ ...editingEmployee, salary: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingEmployee.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setEditingEmployee({ ...editingEmployee, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Update Dialog */}
      <Dialog open={isPerformanceDialogOpen} onOpenChange={setIsPerformanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Performance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="total-sales">Total Sales ($)</Label>
              <Input
                id="total-sales"
                type="number"
                step="0.01"
                value={performanceData.totalSales}
                onChange={(e) => setPerformanceData({ ...performanceData, totalSales: e.target.value })}
                placeholder="Enter total sales"
              />
            </div>
            <div>
              <Label htmlFor="hours-worked">Hours Worked</Label>
              <Input
                id="hours-worked"
                type="number"
                value={performanceData.hoursWorked}
                onChange={(e) => setPerformanceData({ ...performanceData, hoursWorked: e.target.value })}
                placeholder="Enter hours worked"
              />
            </div>
            <div>
              <Label htmlFor="performance">Performance Score (0-100)</Label>
              <Input
                id="performance"
                type="number"
                min="0"
                max="100"
                value={performanceData.performance}
                onChange={(e) => setPerformanceData({ ...performanceData, performance: e.target.value })}
                placeholder="Enter performance score"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPerformanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePerformance}>Update Performance</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete <strong>{deletingEmployee?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteEmployee}>
              Delete Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
