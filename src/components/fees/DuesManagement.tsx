"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  AlertCircle,
  Calendar,
  DollarSign,
  Filter,
  Download,
} from "lucide-react";
import { toast } from "sonner";

interface StudentFee {
  id: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  discountAmount: number;
  status: string;
  dueDate?: string;
  lastPaymentDate?: string;
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
  feeType: {
    name: string;
    category: string;
  };
  _count: {
    payments: number;
    monthlyDues: number;
  };
}

interface MonthlyDue {
  id: string;
  month: number;
  year: number;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  student: {
    user: {
      name: string;
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

interface DuesSummary {
  totalDues: number;
  totalAmount: number;
  totalPaid: number;
  totalDiscount: number;
  totalDueAmount: number;
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface FeeType {
  id: string;
  name: string;
}

export default function DuesManagement() {
  const [dues, setDues] = useState<StudentFee[]>([]);
  const [monthlyDues, setMonthlyDues] = useState<MonthlyDue[]>([]);
  const [summary, setSummary] = useState<DuesSummary>({
    totalDues: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalDiscount: 0,
    totalDueAmount: 0,
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterFeeType, setFilterFeeType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    fetchClasses();
    fetchFeeTypes();
  }, []);

  useEffect(() => {
    if (activeTab === "all" || activeTab === "overdue") {
      fetchDues();
    } else if (activeTab === "monthly") {
      fetchMonthlyDues();
    }
  }, [activeTab, filterClass, filterFeeType, filterStatus]);

  const fetchDues = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        academicYear: "2024-25",
      });

      if (filterClass !== "all") params.append("classId", filterClass);
      if (filterFeeType !== "all") params.append("feeTypeId", filterFeeType);
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      } else if (activeTab === "overdue") {
        params.append("status", "OVERDUE");
      }

      const response = await fetch(`/api/fees/dues?${params}`);
      if (response.ok) {
        const data = await response.json();
        setDues(data.dues || []);
        setSummary(data.summary || {});
      } else {
        toast.error("Failed to fetch dues");
      }
    } catch (error) {
      console.error("Error fetching dues:", error);
      toast.error("Failed to fetch dues");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyDues = async () => {
    try {
      setLoading(true);
      const params: any = {
        year: new Date().getFullYear(),
      };

      if (filterClass !== "all") params.classId = filterClass;
      if (filterStatus !== "all") params.status = filterStatus;

      const response = await fetch("/api/fees/dues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (response.ok) {
        const data = await response.json();
        setMonthlyDues(data.monthlyDues || []);
      } else {
        toast.error("Failed to fetch monthly dues");
      }
    } catch (error) {
      console.error("Error fetching monthly dues:", error);
      toast.error("Failed to fetch monthly dues");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes?limit=100");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []); // Extract classes array from response
      } else {
        console.error("Failed to fetch classes:", response.statusText);
        setClasses([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    }
  };

  const fetchFeeTypes = async () => {
    try {
      const response = await fetch("/api/fees/types");
      if (response.ok) {
        const data = await response.json();
        setFeeTypes(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch fee types:", response.statusText);
        setFeeTypes([]);
      }
    } catch (error) {
      console.error("Error fetching fee types:", error);
      setFeeTypes([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PARTIAL":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "WAIVED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1] || "";
  };

  const filteredDues = dues.filter(
    (due) =>
      due.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      due.student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      due.feeType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMonthlyDues = monthlyDues.filter(
    (due) =>
      due.student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      due.studentFee.feeType.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Dues
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalDues}</div>
            <p className="text-xs text-gray-500">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ৳{((summary.totalAmount || 0) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500">Total fee amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Paid
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ৳{((summary.totalPaid || 0) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500">Collected amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Outstanding
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ৳{((summary.totalDueAmount || 0) / 1000).toFixed(0)}k
            </div>
            <p className="text-xs text-gray-500">Due amount</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Dues Tracking</CardTitle>
          <CardDescription>
            Track and manage pending fee payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by student name, roll no, or fee type..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Array.isArray(classes) &&
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.section}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={filterFeeType} onValueChange={setFilterFeeType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fee Types</SelectItem>
                  {Array.isArray(feeTypes) &&
                    feeTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Dues</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
              <TabsTrigger value="monthly">Monthly View</TabsTrigger>
            </TabsList>

            {/* All Dues Tab */}
            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDues.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-gray-500"
                          >
                            No dues found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDues.map((due) => (
                          <TableRow key={due.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {due.student.user.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Roll: {due.student.rollNo}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {due.student.class.name} -{" "}
                              {due.student.class.section}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div>{due.feeType.name}</div>
                                <div className="text-xs text-gray-500">
                                  {due.feeType.category}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              ৳{due.totalAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-green-600">
                              ৳{due.paidAmount.toLocaleString()}
                            </TableCell>
                            <TableCell className="font-semibold text-orange-600">
                              ৳{due.dueAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  due.status
                                )}`}
                              >
                                {due.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {due.dueDate
                                ? new Date(due.dueDate).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Overdue Tab */}
            <TabsContent value="overdue" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Due Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Days Overdue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDues.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-8 text-gray-500"
                          >
                            No overdue payments found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDues.map((due) => {
                          const daysOverdue = due.dueDate
                            ? Math.floor(
                                (new Date().getTime() -
                                  new Date(due.dueDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0;

                          return (
                            <TableRow key={due.id} className="bg-red-50">
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {due.student.user.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Roll: {due.student.rollNo}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {due.student.class.name} -{" "}
                                {due.student.class.section}
                              </TableCell>
                              <TableCell>{due.feeType.name}</TableCell>
                              <TableCell className="font-semibold text-red-600">
                                ৳{due.dueAmount.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                {due.dueDate
                                  ? new Date(due.dueDate).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <span className="text-red-600 font-medium">
                                  {daysOverdue > 0
                                    ? `${daysOverdue} days`
                                    : "-"}
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Monthly View Tab */}
            <TabsContent value="monthly" className="space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Fee Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Due Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMonthlyDues.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="text-center py-8 text-gray-500"
                          >
                            No monthly dues found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredMonthlyDues.map((due) => (
                          <TableRow key={due.id}>
                            <TableCell className="font-medium">
                              {getMonthName(due.month)} {due.year}
                            </TableCell>
                            <TableCell>{due.student.user.name}</TableCell>
                            <TableCell>
                              {due.student.class.name} -{" "}
                              {due.student.class.section}
                            </TableCell>
                            <TableCell>{due.studentFee.feeType.name}</TableCell>
                            <TableCell>
                              ৳{due.amount.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-green-600">
                              ৳{due.paidAmount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  due.status
                                )}`}
                              >
                                {due.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(due.dueDate).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
