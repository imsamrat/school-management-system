"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Calendar,
  ClipboardCheck,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  remarks?: string;
  subject: {
    name: string;
    code: string;
  };
  teacher: string;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
}

export default function StudentAttendance() {
  const { data: session } = useSession();
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );

  useEffect(() => {
    if (session?.user) {
      console.log("Triggering fetchAttendance for month:", selectedMonth);
      fetchAttendance();
    }
  }, [session, selectedMonth]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // Extract month and year from selectedMonth (format: YYYY-MM)
      const [year, month] = selectedMonth.split("-");

      console.log("Fetching attendance for:", { month, year, selectedMonth });

      const params = new URLSearchParams({
        month: month,
        year: year,
      });

      const response = await fetch(`/api/student/attendance?${params}`);
      const data = await response.json();

      console.log("Attendance API response:", data);

      if (response.ok) {
        setAttendanceRecords(data.records || []);
        setStats(data.statistics || null);
      } else {
        console.error("Attendance API error:", data);
        toast.error(data.error || "Failed to fetch attendance records");
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-800";
      case "ABSENT":
        return "bg-red-100 text-red-800";
      case "LATE":
        return "bg-yellow-100 text-yellow-800";
      case "EXCUSED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate month options (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const value = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      options.push({ value, label });
    }

    return options;
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
            <p className="text-gray-600">
              View your attendance records and statistics
            </p>
          </div>
        </div>

        {/* Month Selection */}
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Select Period
              </h3>
              <p className="text-sm text-gray-600">
                View attendance for a specific month
              </p>
            </div>
          </div>
          <div className="w-72">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full h-12 text-base font-medium bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <SelectValue placeholder="Select month">
                  {generateMonthOptions().find(
                    (opt) => opt.value === selectedMonth
                  )?.label || "Select month"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-72 max-h-80">
                {generateMonthOptions().map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-base py-3 cursor-pointer hover:bg-blue-50"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Attendance Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalDays}
                  </div>
                  <p className="text-xs text-gray-500">Total Days</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.presentDays}
                  </div>
                  <p className="text-xs text-gray-500">Present</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.absentDays}
                  </div>
                  <p className="text-xs text-gray-500">Absent</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.lateDays}
                  </div>
                  <p className="text-xs text-gray-500">Late</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.attendanceRate.toFixed(1)}%
                  </div>
                  <div className="flex items-center justify-center mt-1">
                    {stats.attendanceRate >= 90 ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <p className="text-xs text-gray-500">Attendance Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Performance Card */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2" />
                Attendance Performance
              </CardTitle>
              <CardDescription>
                Your attendance performance for{" "}
                {generateMonthOptions().find(
                  (opt) => opt.value === selectedMonth
                )?.label || selectedMonth}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stats.attendanceRate >= 90
                        ? "bg-green-600"
                        : stats.attendanceRate >= 75
                        ? "bg-yellow-600"
                        : "bg-red-600"
                    }`}
                    style={{ width: `${Math.max(stats.attendanceRate, 5)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0%</span>
                  <span
                    className={`font-medium ${
                      stats.attendanceRate >= 90
                        ? "text-green-600"
                        : stats.attendanceRate >= 75
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {stats.attendanceRate.toFixed(1)}%
                  </span>
                  <span>100%</span>
                </div>
                <div className="text-sm text-gray-600">
                  {stats.attendanceRate >= 90 ? (
                    <p className="text-green-600 font-medium">
                      Excellent attendance! Keep it up! 🎉
                    </p>
                  ) : stats.attendanceRate >= 75 ? (
                    <p className="text-yellow-600 font-medium">
                      Good attendance, but there&apos;s room for improvement. 📈
                    </p>
                  ) : (
                    <p className="text-red-600 font-medium">
                      Your attendance needs attention. Please try to attend
                      classes regularly. ⚠️
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Detailed attendance records for the selected month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : attendanceRecords.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>
                        {record.subject.name} ({record.subject.code})
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status.charAt(0) +
                            record.status.slice(1).toLowerCase()}
                        </span>
                      </TableCell>
                      <TableCell>{record.teacher}</TableCell>
                      <TableCell>{record.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <ClipboardCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Attendance Records
                </h3>
                <p className="text-gray-500">
                  No attendance records found for the selected month.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
