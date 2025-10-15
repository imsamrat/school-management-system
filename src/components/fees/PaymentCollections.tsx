"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import PaymentReceipt from "./PaymentReceipt";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Search,
  Receipt,
  DollarSign,
  Calendar,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

interface Payment {
  id: string;
  studentId: string;
  studentFeeId: string;
  amount: number;
  discountAmount: number;
  discountReason?: string;
  paymentMethod: string;
  paymentDate: string;
  receiptNumber: string;
  transactionId?: string;
  remarks?: string;
  student: {
    id: string;
    rollNo: string;
    user: {
      name: string;
      email: string;
    };
    class: {
      name: string;
      section: string;
    };
  };
  studentFee: {
    feeType: {
      name: string;
    };
  };
}

interface Student {
  id: string;
  rollNo: string;
  user: {
    name: string;
  };
  class: {
    name: string;
    section: string;
  };
}

interface StudentFee {
  id: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  feeType: {
    id: string;
    name: string;
  };
}

interface PaymentCollectionsProps {
  onRefresh?: () => void;
}

export default function PaymentCollections({
  onRefresh,
}: PaymentCollectionsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    studentFeeId: "",
    amount: "",
    discountAmount: "0",
    discountReason: "",
    paymentMethod: "CASH",
    transactionId: "",
    remarks: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentFees(selectedStudent);
    } else {
      setStudentFees([]);
      setSelectedFee(null);
    }
  }, [selectedStudent]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/fees/collections");
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      } else {
        toast.error("Failed to fetch payments");
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students?limit=1000"); // Get more students
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []); // Extract students array from response
      } else {
        console.error("Failed to fetch students:", response.statusText);
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchStudentFees = async (studentId: string) => {
    try {
      const response = await fetch(
        `/api/fees/dues?studentId=${studentId}&status=PENDING&status=PARTIAL`
      );
      if (response.ok) {
        const data = await response.json();
        setStudentFees(data.dues || []);
      }
    } catch (error) {
      console.error("Error fetching student fees:", error);
      toast.error("Failed to fetch student fees");
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudent(studentId);
    const student = students.find((s) => s.id === studentId);
    if (student) {
      setStudentSearchTerm(
        `${student.user.name} - ${student.class.name} ${student.class.section} (Roll: ${student.rollNo})`
      );
    }
    setShowStudentDropdown(false);
    setFormData({
      ...formData,
      studentFeeId: "",
      amount: "",
    });
    setSelectedFee(null);
  };

  const handleFeeSelect = (feeId: string) => {
    const fee = studentFees.find((f) => f.id === feeId);
    if (fee) {
      setSelectedFee(fee);
      setFormData({
        ...formData,
        studentFeeId: feeId,
        amount: fee.dueAmount.toString(),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent || !formData.studentFeeId || !formData.amount) {
      toast.error("Please fill all required fields");
      return;
    }

    const amount = parseFloat(formData.amount);
    const discountAmount = parseFloat(formData.discountAmount);

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (discountAmount > 0 && !formData.discountReason) {
      toast.error("Please provide a reason for the discount");
      return;
    }

    if (selectedFee && amount + discountAmount > selectedFee.dueAmount) {
      toast.error("Total amount cannot exceed due amount");
      return;
    }

    try {
      const response = await fetch("/api/fees/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          studentId: selectedStudent,
          amount,
          discountAmount,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Prepare receipt data
        const student = students.find((s) => s.id === selectedStudent);
        const receiptInfo = {
          receiptNumber: result.receiptNumber,
          paymentDate: new Date().toISOString(),
          student: student
            ? {
                name: student.user.name,
                rollNo: student.rollNo,
                class: {
                  name: student.class.name,
                  section: student.class.section,
                },
              }
            : {
                name: "Unknown Student",
                rollNo: "N/A",
                class: { name: "N/A", section: "N/A" },
              },
          feeType: selectedFee
            ? {
                name: selectedFee.feeType.name,
                category: "ACADEMIC", // You might want to get this from the API
              }
            : {
                name: "Unknown Fee",
                category: "OTHER",
              },
          totalAmount: selectedFee?.totalAmount || 0,
          paidAmount: parseFloat(formData.amount),
          discountAmount: parseFloat(formData.discountAmount),
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId,
          remarks: formData.remarks,
          discountReason: formData.discountReason,
        };

        setReceiptData(receiptInfo);
        setShowReceipt(true);

        toast.success(
          `Payment recorded successfully! Receipt: ${result.receiptNumber}`
        );
        setIsDialogOpen(false);
        resetForm();
        fetchPayments();
        onRefresh?.();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to record payment");
      }
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    }
  };

  const resetForm = () => {
    setFormData({
      studentFeeId: "",
      amount: "",
      discountAmount: "0",
      discountReason: "",
      paymentMethod: "CASH",
      transactionId: "",
      remarks: "",
    });
    setSelectedStudent("");
    setStudentSearchTerm("");
    setShowStudentDropdown(false);
    setSelectedFee(null);
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.student.user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentFee.feeType.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Collections</CardTitle>
              <CardDescription>
                Record and track fee payments from students
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, receipt number, or fee type..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No payments found. Record a payment to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.receiptNumber}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.student.user.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.student.class.name} -{" "}
                              {payment.student.class.section}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.studentFee.feeType.name}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          ৳{payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {payment.discountAmount > 0 ? (
                            <div className="text-orange-600">
                              -৳{payment.discountAmount.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {payment.paymentMethod}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const receiptInfo = {
                                receiptNumber: payment.receiptNumber,
                                paymentDate: payment.paymentDate,
                                student: {
                                  name: payment.student.user.name,
                                  rollNo: payment.student.rollNo,
                                  class: {
                                    name: payment.student.class.name,
                                    section: payment.student.class.section,
                                  },
                                },
                                feeType: {
                                  name: payment.studentFee.feeType.name,
                                  category: "ACADEMIC",
                                },
                                totalAmount:
                                  payment.amount + payment.discountAmount,
                                paidAmount: payment.amount,
                                discountAmount: payment.discountAmount,
                                paymentMethod: payment.paymentMethod,
                                transactionId: payment.transactionId,
                                remarks: payment.remarks,
                                discountReason: payment.discountReason,
                              };
                              setReceiptData(receiptInfo);
                              setShowReceipt(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a new fee payment from a student
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="student">Student *</Label>
                {selectedStudent && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent("");
                      setStudentSearchTerm("");
                      setSelectedFee(null);
                      setStudentFees([]);
                      setFormData({
                        ...formData,
                        studentFeeId: "",
                        amount: "",
                      });
                    }}
                    className="text-xs text-gray-500 hover:text-red-500"
                  >
                    Clear Selection
                  </Button>
                )}
              </div>
              <div className="relative" ref={dropdownRef}>
                <Input
                  placeholder="Type student name, roll number, or class..."
                  value={studentSearchTerm}
                  onChange={(e) => {
                    setStudentSearchTerm(e.target.value);
                    setShowStudentDropdown(true);
                    if (!e.target.value) {
                      setSelectedStudent("");
                      setSelectedFee(null);
                      setStudentFees([]);
                    }
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className={`pr-10 ${
                    selectedStudent ? "border-green-500" : ""
                  }`}
                />
                {selectedStudent ? (
                  <div className="absolute right-3 top-3 h-4 w-4 text-green-500">
                    ✓
                  </div>
                ) : (
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                )}

                {showStudentDropdown && Array.isArray(students) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {students
                      .filter(
                        (student) =>
                          student.user.name
                            .toLowerCase()
                            .includes(studentSearchTerm.toLowerCase()) ||
                          student.rollNo
                            .toLowerCase()
                            .includes(studentSearchTerm.toLowerCase()) ||
                          student.class.name
                            .toLowerCase()
                            .includes(studentSearchTerm.toLowerCase())
                      )
                      .slice(0, 50) // Limit to 50 results for performance
                      .map((student) => (
                        <div
                          key={student.id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleStudentChange(student.id)}
                        >
                          <div className="font-medium">{student.user.name}</div>
                          <div className="text-sm text-gray-500">
                            {student.class.name} {student.class.section} - Roll:{" "}
                            {student.rollNo}
                          </div>
                        </div>
                      ))}

                    {students.filter(
                      (student) =>
                        student.user.name
                          .toLowerCase()
                          .includes(studentSearchTerm.toLowerCase()) ||
                        student.rollNo
                          .toLowerCase()
                          .includes(studentSearchTerm.toLowerCase()) ||
                        student.class.name
                          .toLowerCase()
                          .includes(studentSearchTerm.toLowerCase())
                    ).length === 0 &&
                      studentSearchTerm && (
                        <div className="px-3 py-2 text-gray-500 text-center">
                          No students found
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>

            {/* Fee Selection */}
            {selectedStudent && (
              <div className="space-y-2">
                <Label htmlFor="fee">Fee Type *</Label>
                <Select
                  value={formData.studentFeeId}
                  onValueChange={handleFeeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee to pay" />
                  </SelectTrigger>
                  <SelectContent>
                    {studentFees.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No pending fees
                      </SelectItem>
                    ) : (
                      studentFees.map((fee) => (
                        <SelectItem key={fee.id} value={fee.id}>
                          {fee.feeType.name} - Due: ৳
                          {fee.dueAmount.toLocaleString()}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Amount Details */}
            {selectedFee && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">
                    ৳{selectedFee.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="text-green-600">
                    ৳{selectedFee.paidAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Due Amount:</span>
                  <span className="font-bold text-orange-600">
                    ৳{selectedFee.dueAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Payment Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (৳) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="5000"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                />
              </div>

              {/* Discount */}
              <div className="space-y-2">
                <Label htmlFor="discount">Discount Amount (৳)</Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="0"
                  value={formData.discountAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountAmount: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Discount Reason */}
            {parseFloat(formData.discountAmount) > 0 && (
              <div className="space-y-2">
                <Label htmlFor="discountReason">Discount Reason *</Label>
                <Input
                  id="discountReason"
                  placeholder="e.g., Sibling discount, Merit scholarship"
                  value={formData.discountReason}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discountReason: e.target.value,
                    })
                  }
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Payment Method */}
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="ONLINE">Online Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction ID */}
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID</Label>
                <Input
                  id="transactionId"
                  placeholder="Optional"
                  value={formData.transactionId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transactionId: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                placeholder="Optional notes about this payment"
                value={formData.remarks}
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200 mt-6">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Receipt className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Receipt */}
      <PaymentReceipt
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        data={receiptData}
      />
    </div>
  );
}
