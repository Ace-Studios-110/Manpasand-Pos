"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Clock, Users, Calendar, DollarSign, Eye, StopCircle, Edit, Trash2 } from "lucide-react"

interface Shift {
  id: string
  employee: string
  employeeId: string
  date: string
  startTime: string
  endTime: string
  breakTime: string
  totalHours: number
  status: "scheduled" | "active" | "completed" | "cancelled"
  sales: number
  hourlyRate: number
}

interface NewShiftForm {
  employee: string
  employeeId: string
  date: string
  shiftType: string
  startTime: string
  endTime: string
  breakTime: string
}

const employees = [
  { id: "emp-001", name: "John Doe", hourlyRate: 15 },
  { id: "emp-002", name: "Jane Smith", hourlyRate: 18 },
  { id: "emp-003", name: "Mike Johnson", hourlyRate: 16 },
  { id: "emp-004", name: "Sarah Wilson", hourlyRate: 20 },
]

export function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([
    {
      id: "SH-001",
      employee: "John Doe",
      employeeId: "emp-001",
      date: "2024-01-15",
      startTime: "09:00",
      endTime: "17:00",
      breakTime: "1 hour",
      totalHours: 7,
      status: "completed",
      sales: 15000,
      hourlyRate: 15,
    },
    {
      id: "SH-002",
      employee: "Jane Smith",
      employeeId: "emp-002",
      date: "2024-01-15",
      startTime: "13:00",
      endTime: "21:00",
      breakTime: "30 mins",
      totalHours: 7.5,
      status: "active",
      sales: 8500,
      hourlyRate: 18,
    },
    {
      id: "SH-003",
      employee: "Mike Johnson",
      employeeId: "emp-003",
      date: "2024-01-16",
      startTime: "09:00",
      endTime: "17:00",
      breakTime: "1 hour",
      totalHours: 7,
      status: "scheduled",
      sales: 0,
      hourlyRate: 16,
    },
    {
      id: "SH-004",
      employee: "Sarah Wilson",
      employeeId: "emp-004",
      date: "2024-01-14",
      startTime: "10:00",
      endTime: "18:00",
      breakTime: "1 hour",
      totalHours: 7,
      status: "completed",
      sales: 12000,
      hourlyRate: 20,
    },
  ])

  const [isCreateShiftOpen, setIsCreateShiftOpen] = useState(false)
  const [isViewShiftOpen, setIsViewShiftOpen] = useState(false)
  const [isEditShiftOpen, setIsEditShiftOpen] = useState(false)
  const [isEndShiftOpen, setIsEndShiftOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [editingShift, setEditingShift] = useState<Shift | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [employeeFilter, setEmployeeFilter] = useState("all")
  const [endShiftSales, setEndShiftSales] = useState("")

  const [newShift, setNewShift] = useState<NewShiftForm>({
    employee: "",
    employeeId: "",
    date: "",
    shiftType: "",
    startTime: "",
    endTime: "",
    breakTime: "1",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateHours = (startTime: string, endTime: string, breakHours: number) => {
    const start = new Date(`2000-01-01T${startTime}:00`)
    const end = new Date(`2000-01-01T${endTime}:00`)
    let diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    // Handle overnight shifts
    if (diff < 0) {
      diff += 24
    }

    return Math.max(0, diff - breakHours)
  }

  const handleShiftTypeChange = (type: string) => {
    setNewShift({ ...newShift, shiftType: type })

    switch (type) {
      case "morning":
        setNewShift((prev) => ({ ...prev, startTime: "09:00", endTime: "17:00" }))
        break
      case "evening":
        setNewShift((prev) => ({ ...prev, startTime: "13:00", endTime: "21:00" }))
        break
      case "night":
        setNewShift((prev) => ({ ...prev, startTime: "21:00", endTime: "05:00" }))
        break
      default:
        break
    }
  }

  const handleCreateShift = () => {
    if (newShift.employee && newShift.date && newShift.startTime && newShift.endTime) {
      const employee = employees.find((emp) => emp.id === newShift.employeeId)
      const breakHours = Number.parseFloat(newShift.breakTime) || 0
      const totalHours = calculateHours(newShift.startTime, newShift.endTime, breakHours)

      const shift: Shift = {
        id: `SH-${String(shifts.length + 1).padStart(3, "0")}`,
        employee: newShift.employee,
        employeeId: newShift.employeeId,
        date: newShift.date,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        breakTime: `${breakHours} hour${breakHours !== 1 ? "s" : ""}`,
        totalHours: totalHours,
        status: "scheduled",
        sales: 0,
        hourlyRate: employee?.hourlyRate || 15,
      }

      setShifts([...shifts, shift])
      setNewShift({
        employee: "",
        employeeId: "",
        date: "",
        shiftType: "",
        startTime: "",
        endTime: "",
        breakTime: "1",
      })
      setIsCreateShiftOpen(false)
    }
  }

  const handleEmployeeSelect = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    if (employee) {
      setNewShift({
        ...newShift,
        employee: employee.name,
        employeeId: employee.id,
      })
    }
  }

  const handleViewShift = (shift: Shift) => {
    setSelectedShift(shift)
    setIsViewShiftOpen(true)
  }

  const handleEditShift = (shift: Shift) => {
    setEditingShift({ ...shift })
    setIsEditShiftOpen(true)
  }

  const handleUpdateShift = () => {
    if (editingShift) {
      const breakHours = Number.parseFloat(editingShift.breakTime.split(" ")[0]) || 0
      const totalHours = calculateHours(editingShift.startTime, editingShift.endTime, breakHours)

      const updatedShift = {
        ...editingShift,
        totalHours: totalHours,
      }

      setShifts(shifts.map((shift) => (shift.id === editingShift.id ? updatedShift : shift)))
      setEditingShift(null)
      setIsEditShiftOpen(false)
    }
  }

  const handleEndShift = (shift: Shift) => {
    setSelectedShift(shift)
    setEndShiftSales(shift.sales.toString())
    setIsEndShiftOpen(true)
  }

  const handleConfirmEndShift = () => {
    if (selectedShift) {
      const updatedShift = {
        ...selectedShift,
        status: "completed" as const,
        sales: Number.parseFloat(endShiftSales) || selectedShift.sales,
      }

      setShifts(shifts.map((shift) => (shift.id === selectedShift.id ? updatedShift : shift)))
      setSelectedShift(null)
      setEndShiftSales("")
      setIsEndShiftOpen(false)
    }
  }

  const handleDeleteShift = (shiftId: string) => {
    setShifts(shifts.filter((shift) => shift.id !== shiftId))
  }

  const filterShifts = (status?: string) => {
    let filtered = shifts

    // Filter by status/tab
    if (status) {
      switch (status) {
        case "today":
          const today = new Date().toISOString().split("T")[0]
          filtered = filtered.filter((shift) => shift.date === today)
          break
        case "week":
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          filtered = filtered.filter((shift) => new Date(shift.date) >= weekAgo)
          break
        case "scheduled":
          filtered = filtered.filter((shift) => shift.status === "scheduled")
          break
        case "completed":
          filtered = filtered.filter((shift) => shift.status === "completed")
          break
      }
    }

    // Filter by employee
    if (employeeFilter !== "all") {
      filtered = filtered.filter((shift) => shift.employeeId === employeeFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (shift) =>
          shift.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shift.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shift.status.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  // Calculate statistics
  const today = new Date().toISOString().split("T")[0]
  const todayShifts = shifts.filter((shift) => shift.date === today)
  const activeShifts = shifts.filter((shift) => shift.status === "active").length
  const todayHours = todayShifts.reduce((sum, shift) => sum + shift.totalHours, 0)
  const tomorrowShifts = shifts.filter((shift) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return shift.date === tomorrow.toISOString().split("T")[0] && shift.status === "scheduled"
  }).length
  const todayLaborCost = todayShifts.reduce((sum, shift) => sum + shift.totalHours * shift.hourlyRate, 0)

  const ShiftTable = ({ shiftData }: { shiftData: Shift[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Shift ID</TableHead>
          <TableHead>Employee</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>End Time</TableHead>
          <TableHead>Break</TableHead>
          <TableHead>Total Hours</TableHead>
          <TableHead>Sales</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {shiftData.map((shift) => (
          <TableRow key={shift.id}>
            <TableCell className="font-medium">{shift.id}</TableCell>
            <TableCell>{shift.employee}</TableCell>
            <TableCell>{shift.date}</TableCell>
            <TableCell>{shift.startTime}</TableCell>
            <TableCell>{shift.endTime}</TableCell>
            <TableCell>{shift.breakTime}</TableCell>
            <TableCell>{shift.totalHours}h</TableCell>
            <TableCell>₹{shift.sales.toLocaleString()}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(shift.status)}>{shift.status}</Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => handleViewShift(shift)}>
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditShift(shift)}>
                  <Edit className="h-3 w-3" />
                </Button>
                {shift.status === "active" && (
                  <Button variant="outline" size="sm" onClick={() => handleEndShift(shift)}>
                    <StopCircle className="h-3 w-3" />
                  </Button>
                )}
                {shift.status === "scheduled" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteShift(shift.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shift Management</h1>
          <p className="text-gray-600">Manage employee shifts and time tracking</p>
        </div>

        {/* Create Shift Dialog */}
        <Dialog open={isCreateShiftOpen} onOpenChange={setIsCreateShiftOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Schedule Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Shift</DialogTitle>
              <DialogDescription>Create a new shift for an employee</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select value={newShift.employeeId} onValueChange={handleEmployeeSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} (₹{emp.hourlyRate}/hr)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    type="date"
                    value={newShift.date}
                    onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift-type">Shift Type</Label>
                  <Select value={newShift.shiftType} onValueChange={handleShiftTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9AM-5PM)</SelectItem>
                      <SelectItem value="evening">Evening (1PM-9PM)</SelectItem>
                      <SelectItem value="night">Night (9PM-5AM)</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    type="time"
                    value={newShift.startTime}
                    onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    type="time"
                    value={newShift.endTime}
                    onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="break-time">Break (hours)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newShift.breakTime}
                    onChange={(e) => setNewShift({ ...newShift, breakTime: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>
              {newShift.startTime && newShift.endTime && (
                <div className="text-sm text-gray-600">
                  Total Hours:{" "}
                  {calculateHours(
                    newShift.startTime,
                    newShift.endTime,
                    Number.parseFloat(newShift.breakTime) || 0,
                  ).toFixed(1)}
                  h
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateShiftOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateShift}>Schedule Shift</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeShifts}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayHours}</div>
            <p className="text-xs text-muted-foreground">Total hours worked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tomorrowShifts}</div>
            <p className="text-xs text-muted-foreground">Tomorrow's shifts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Labor Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayLaborCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today's total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search shifts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Shifts</CardTitle>
              <CardDescription>Current and scheduled shifts for today</CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftTable shiftData={filterShifts("today")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Shifts</CardTitle>
              <CardDescription>All shifts from the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftTable shiftData={filterShifts("week")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Shifts</CardTitle>
              <CardDescription>Upcoming scheduled shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftTable shiftData={filterShifts("scheduled")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Shifts</CardTitle>
              <CardDescription>All completed shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <ShiftTable shiftData={filterShifts("completed")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Shift Dialog */}
      <Dialog open={isViewShiftOpen} onOpenChange={setIsViewShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shift Details</DialogTitle>
          </DialogHeader>
          {selectedShift && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Shift ID</Label>
                  <p className="text-lg font-semibold">{selectedShift.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Employee</Label>
                  <p className="text-lg font-semibold">{selectedShift.employee}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date</Label>
                  <p>{selectedShift.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedShift.status)}>{selectedShift.status}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Start Time</Label>
                  <p>{selectedShift.startTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">End Time</Label>
                  <p>{selectedShift.endTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Break Time</Label>
                  <p>{selectedShift.breakTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Total Hours</Label>
                  <p className="text-lg font-semibold">{selectedShift.totalHours}h</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Sales</Label>
                  <p className="text-lg font-semibold">₹{selectedShift.sales.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Labor Cost</Label>
                  <p className="text-lg font-semibold">
                    ₹{(selectedShift.totalHours * selectedShift.hourlyRate).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewShiftOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={isEditShiftOpen} onOpenChange={setIsEditShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Shift</DialogTitle>
          </DialogHeader>
          {editingShift && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editingShift.date}
                  onChange={(e) => setEditingShift({ ...editingShift, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={editingShift.startTime}
                    onChange={(e) => setEditingShift({ ...editingShift, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={editingShift.endTime}
                    onChange={(e) => setEditingShift({ ...editingShift, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Break Time (hours)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={editingShift.breakTime.split(" ")[0]}
                  onChange={(e) =>
                    setEditingShift({
                      ...editingShift,
                      breakTime: `${e.target.value} hour${e.target.value !== "1" ? "s" : ""}`,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editingShift.status}
                  onValueChange={(value: Shift["status"]) => setEditingShift({ ...editingShift, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditShiftOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateShift}>Update Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog */}
      <Dialog open={isEndShiftOpen} onOpenChange={setIsEndShiftOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Shift</DialogTitle>
            <DialogDescription>Complete the shift and record final sales</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Employee</Label>
              <p className="text-lg font-semibold">{selectedShift?.employee}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Shift Duration</Label>
              <p>
                {selectedShift?.startTime} - {selectedShift?.endTime} ({selectedShift?.totalHours}h)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="final-sales">Final Sales Amount (₹)</Label>
              <Input
                id="final-sales"
                type="number"
                value={endShiftSales}
                onChange={(e) => setEndShiftSales(e.target.value)}
                placeholder="Enter total sales"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEndShiftOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmEndShift}>End Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
