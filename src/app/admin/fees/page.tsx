"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  type: string;
  academicYear: string;
  dueDate?: string;
  description?: string;
  isActive: boolean;
  _count: {
    payments: number;
  };
}

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  feeStructureId: string;
  feeStructureName: string;
  amount: number;
  paidAmount: number;
  status: string;
  paymentDate?: string;
  dueDate: string;
}

const feeTypes = [
  "Tuition Fee",
  "Admission Fee",
  "Exam Fee",
  "Library Fee",
  "Transport Fee",
  "Activity Fee",
  "Late Fee",
  "Other",
];

const paymentStatuses = [
  { value: "paid", label: "Paid", color: "text-green-600" },
  { value: "partial", label: "Partial", color: "text-yellow-600" },
  { value: "pending", label: "Pending", color: "text-red-600" },
  { value: "overdue", label: "Overdue", color: "text-red-800" },
];

export default function AdminFees() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [activeTab, setActiveTab] = useState<"structures" | "payments">(
    "structures"
  );

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    type: "",
    academicYear: "2024-25",
    dueDate: "",
    description: "",
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, selectedType, selectedStatus, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      if (activeTab === "structures") {
        setFeeStructures([
          {
            id: "1",
            name: "Tuition Fee - Grade 10",
            amount: 5000,
            type: "Tuition Fee",
            academicYear: "2024-25",
            dueDate: "2024-04-30",
            description: "Monthly tuition fee for Grade 10 students",
            isActive: true,
            _count: { payments: 45 },
          },
          {
            id: "2",
            name: "Admission Fee",
            amount: 2000,
            type: "Admission Fee",
            academicYear: "2024-25",
            dueDate: "2024-03-15",
            description: "One-time admission fee for new students",
            isActive: true,
            _count: { payments: 32 },
          },
          {
            id: "3",
            name: "Exam Fee - Semester 1",
            amount: 500,
            type: "Exam Fee",
            academicYear: "2024-25",
            dueDate: "2024-09-30",
            description: "Examination fee for first semester",
            isActive: true,
            _count: { payments: 78 },
          },
        ]);
      } else {
        setPayments([
          {
            id: "1",
            studentId: "s1",
            studentName: "John Doe",
            feeStructureId: "1",
            feeStructureName: "Tuition Fee - Grade 10",
            amount: 5000,
            paidAmount: 5000,
            status: "paid",
            paymentDate: "2024-04-25",
            dueDate: "2024-04-30",
          },
          {
            id: "2",
            studentId: "s2",
            studentName: "Jane Smith",
            feeStructureId: "1",
            feeStructureName: "Tuition Fee - Grade 10",
            amount: 5000,
            paidAmount: 2500,
            status: "partial",
            dueDate: "2024-04-30",
          },
          {
            id: "3",
            studentId: "s3",
            studentName: "Mike Johnson",
            feeStructureId: "2",
            feeStructureName: "Admission Fee",
            amount: 2000,
            paidAmount: 0,
            status: "pending",
            dueDate: "2024-03-15",
          },
        ]);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Mock API call - replace with actual implementation
      toast.success(
        editingFee
          ? "Fee structure updated successfully"
          : "Fee structure created successfully"
      );
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save fee structure");
    }
  };

  const handleEdit = (fee: FeeStructure) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      amount: fee.amount.toString(),
      type: fee.type,
      academicYear: fee.academicYear,
      dueDate: fee.dueDate || "",
      description: fee.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (fee: FeeStructure) => {
    if (!confirm(`Are you sure you want to delete "${fee.name}"?`)) {
      return;
    }

    try {
      // Mock API call - replace with actual implementation
      toast.success("Fee structure deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete fee structure");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      amount: "",
      type: "",
      academicYear: "2024-25",
      dueDate: "",
      description: "",
    });
    setEditingFee(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "partial":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pending":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "overdue":
        return <XCircle className="h-4 w-4 text-red-800" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = paymentStatuses.find((s) => s.value === status);
    return statusObj?.color || "text-gray-600";
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
            <p className="text-gray-600">
              Manage fee structures, track payments, and generate financial
              reports
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Fee Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingFee ? "Edit Fee Structure" : "Add New Fee Structure"}
                </DialogTitle>
                <DialogDescription>
                  {editingFee
                    ? "Update fee structure information"
                    : "Create a new fee structure for students"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Fee Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Tuition Fee - Grade 10"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Fee Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {feeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year *</Label>
                    <Select
                      value={formData.academicYear}
                      onValueChange={(value) =>
                        setFormData({ ...formData, academicYear: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2025-26">2025-26</SelectItem>
                        <SelectItem value="2026-27">2026-27</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingFee ? "Update Fee" : "Create Fee"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹3,45,000</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">156</div>
              <p className="text-xs text-gray-500">Completed payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">32</div>
              <p className="text-xs text-gray-500">Pending payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">8</div>
              <p className="text-xs text-gray-500">Overdue payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("structures")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "structures"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Fee Structures
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "payments"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Payments
          </button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={
                      activeTab === "structures"
                        ? "Search fee structures..."
                        : "Search payments by student name..."
                    }
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              {activeTab === "structures" ? (
                <Select
                  value={selectedType}
                  onValueChange={(value) => {
                    setSelectedType(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {feeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={selectedStatus}
                  onValueChange={(value) => {
                    setSelectedStatus(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {paymentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content based on active tab */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "structures"
                ? "Fee Structures"
                : "Payment Records"}
            </CardTitle>
            <CardDescription>
              {activeTab === "structures"
                ? `${feeStructures.length} fee structures found`
                : `${payments.length} payment records found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab === "structures" ? (
                      <>
                        <TableHead>Fee Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Payments</TableHead>
                        <TableHead className="w-[70px]">Actions</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead>Student</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Payment Date</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTab === "structures"
                    ? feeStructures.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{fee.name}</div>
                              {fee.description && (
                                <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                  {fee.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{fee.type}</TableCell>
                          <TableCell className="font-medium">
                            ₹{fee.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {fee.dueDate
                              ? new Date(fee.dueDate).toLocaleDateString()
                              : "No due date"}
                          </TableCell>
                          <TableCell>{fee.academicYear}</TableCell>
                          <TableCell>
                            <span className="text-blue-600 font-medium">
                              {fee._count.payments}
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(fee)}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(fee)}
                                  className="text-red-600"
                                  disabled={fee._count.payments > 0}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    : payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.studentName}
                          </TableCell>
                          <TableCell>{payment.feeStructureName}</TableCell>
                          <TableCell>
                            ₹{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            ₹{payment.paidAmount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <span
                                className={`capitalize ${getStatusColor(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {payment.paymentDate
                              ? new Date(
                                  payment.paymentDate
                                ).toLocaleDateString()
                              : "Not paid"}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
