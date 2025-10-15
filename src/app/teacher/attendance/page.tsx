"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  Clock,
  Plus,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Student {
  id: string;
  rollNo: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  class: {
    id: string;
    name: string;
    section: string;
  };
}

interface Class {
  id: string;
  name: string;
  section: string;
  _count: {
    students: number;
  };
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  remarks?: string;
  student: {
    id: string;
    rollNo: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    class: {
      id: string;
      name: string;
      section: string;
    };
  };
  class: {
    id: string;
    name: string;
    section: string;
  };
}

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  presentPercentage: number;
}

interface BulkAttendance {
  [studentId: string]: {
    status: "PRESENT" | "ABSENT" | "LATE";
    remarks?: string;
  };
}

export default function TeacherAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    presentPercentage: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [bulkAttendanceClass, setBulkAttendanceClass] = useState<string>("");
  const [bulkAttendanceDate, setBulkAttendanceDate] = useState<Date>(
    new Date()
  );
  const [bulkAttendance, setBulkAttendance] = useState<BulkAttendance>({});

  // Fetch classes
  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  // Fetch attendance records
  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedClass && selectedClass !== "all")
        params.append("classId", selectedClass);
      if (statusFilter && statusFilter !== "all")
        params.append("status", statusFilter);
      if (selectedDate) {
        params.append("date", selectedDate.toISOString().split("T")[0]);
      }

      const response = await fetch(`/api/teacher/attendance?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
        setTotalPages(data.totalPages || 1);

        // Calculate stats
        const total = data.attendance?.length || 0;
        const present =
          data.attendance?.filter(
            (a: AttendanceRecord) => a.status === "PRESENT"
          ).length || 0;
        const absent =
          data.attendance?.filter(
            (a: AttendanceRecord) => a.status === "ABSENT"
          ).length || 0;
        const late =
          data.attendance?.filter((a: AttendanceRecord) => a.status === "LATE")
            .length || 0;
        const presentPercentage =
          total > 0 ? Math.round((present / total) * 100) : 0;

        setStats({
          total,
          present,
          absent,
          late,
          presentPercentage,
        });
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Fetch students for bulk attendance
  const fetchStudentsForClass = async (classId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/students?classId=${classId}&limit=100`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data.students || []);

        // Initialize bulk attendance
        const initialBulkAttendance: BulkAttendance = {};
        data.students?.forEach((student: Student) => {
          initialBulkAttendance[student.id] = { status: "PRESENT" };
        });
        setBulkAttendance(initialBulkAttendance);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    }
  };

  // Mark bulk attendance
  const markBulkAttendance = async () => {
    if (!bulkAttendanceClass || !bulkAttendanceDate) {
      toast.error("Please select a class and date");
      return;
    }

    try {
      setLoading(true);

      const attendanceData = Object.entries(bulkAttendance).map(
        ([studentId, data]) => ({
          studentId,
          status: data.status,
          remarks: data.remarks,
        })
      );

      const requestData = {
        classId: bulkAttendanceClass,
        date: bulkAttendanceDate.toISOString().split("T")[0],
        attendance: attendanceData,
      };

      console.log("Marking attendance with data:", requestData);

      const response = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const responseData = await response.json();
      console.log("Attendance API response:", responseData);

      if (response.ok) {
        toast.success("Attendance marked successfully");
        setShowMarkAttendance(false);
        fetchAttendance();
      } else {
        console.error("Attendance API error:", responseData);
        toast.error(responseData.error || "Failed to mark attendance");
        if (responseData.details) {
          console.error("Validation details:", responseData.details);
        }
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  // Update bulk attendance status
  const updateBulkAttendance = (
    studentId: string,
    status: "PRESENT" | "ABSENT" | "LATE",
    remarks?: string
  ) => {
    setBulkAttendance((prev) => ({
      ...prev,
      [studentId]: { status, remarks },
    }));
  };

  // Mark all as present/absent
  const markAllAs = (status: "PRESENT" | "ABSENT" | "LATE") => {
    const updatedAttendance: BulkAttendance = {};
    Object.keys(bulkAttendance).forEach((studentId) => {
      updatedAttendance[studentId] = { status };
    });
    setBulkAttendance(updatedAttendance);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PRESENT":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Present
          </Badge>
        );
      case "ABSENT":
        return <Badge variant="destructive">Absent</Badge>;
      case "LATE":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Late
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [currentPage, searchTerm, selectedClass, selectedDate, statusFilter]);

  useEffect(() => {
    if (bulkAttendanceClass) {
      fetchStudentsForClass(bulkAttendanceClass);
    }
  }, [bulkAttendanceClass]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            Mark and track student attendance
          </p>
        </div>
        <Dialog open={showMarkAttendance} onOpenChange={setShowMarkAttendance}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Mark Class Attendance</DialogTitle>
              <DialogDescription>
                Mark attendance for all students in a class for a specific date.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bulkClass">Select Class</Label>
                  <Select
                    value={bulkAttendanceClass}
                    onValueChange={setBulkAttendanceClass}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bulkDate">Date</Label>
                  <Input
                    id="bulkDate"
                    type="date"
                    value={bulkAttendanceDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setBulkAttendanceDate(new Date(e.target.value))
                    }
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              {students.length > 0 && (
                <>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllAs("PRESENT")}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Mark All Present
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAllAs("ABSENT")}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Mark All Absent
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll No</TableHead>
                          <TableHead>Student Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">
                              {student.rollNo}
                            </TableCell>
                            <TableCell>{student.user.name}</TableCell>
                            <TableCell>
                              <Select
                                value={
                                  bulkAttendance[student.id]?.status ||
                                  "PRESENT"
                                }
                                onValueChange={(
                                  status: "PRESENT" | "ABSENT" | "LATE"
                                ) =>
                                  updateBulkAttendance(
                                    student.id,
                                    status,
                                    bulkAttendance[student.id]?.remarks
                                  )
                                }
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PRESENT">
                                    Present
                                  </SelectItem>
                                  <SelectItem value="ABSENT">Absent</SelectItem>
                                  <SelectItem value="LATE">Late</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Optional remarks"
                                className="w-full"
                                value={
                                  bulkAttendance[student.id]?.remarks || ""
                                }
                                onChange={(e) =>
                                  updateBulkAttendance(
                                    student.id,
                                    bulkAttendance[student.id]?.status ||
                                      "PRESENT",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowMarkAttendance(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={markBulkAttendance} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Saving..." : "Save Attendance"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.present}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.absent}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.late}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance %</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.presentPercentage}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={selectedDate.toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-[240px]"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm ||
              (selectedClass && selectedClass !== "all") ||
              (statusFilter && statusFilter !== "all")) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedClass("all");
                  setSelectedDate(new Date());
                  setStatusFilter("all");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            View and track attendance records for your classes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {new Date(record.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {record.student.rollNo}
                        </TableCell>
                        <TableCell>{record.student.user.name}</TableCell>
                        <TableCell>
                          {record.class.name} - {record.class.section}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {record.remarks || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
