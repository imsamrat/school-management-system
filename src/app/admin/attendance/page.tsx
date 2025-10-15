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
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
}

interface ClassAttendance {
  classId: string;
  className: string;
  section: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}

interface AttendanceTrend {
  date: string;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
}

export default function AdminAttendance() {
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [classAttendance, setClassAttendance] = useState<ClassAttendance[]>([]);
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("7");

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, selectedClass, dateRange]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Simulate API calls - replace with actual API endpoints
      const [statsRes, classRes, trendsRes] = await Promise.all([
        fetchAttendanceStats(),
        fetchClassAttendance(),
        fetchAttendanceTrends(),
      ]);

      setStats(statsRes);
      setClassAttendance(classRes);
      setTrends(trendsRes);
    } catch (error) {
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  // Mock data functions - replace with actual API calls
  const fetchAttendanceStats = async (): Promise<AttendanceStats> => {
    // Mock data
    return {
      totalStudents: 450,
      presentToday: 423,
      absentToday: 22,
      lateToday: 5,
      attendanceRate: 94.0,
    };
  };

  const fetchClassAttendance = async (): Promise<ClassAttendance[]> => {
    // Mock data
    return [
      {
        classId: "1",
        className: "Grade 10",
        section: "A",
        totalStudents: 35,
        presentCount: 33,
        absentCount: 2,
        lateCount: 0,
        attendanceRate: 94.3,
      },
      {
        classId: "2",
        className: "Grade 10",
        section: "B",
        totalStudents: 32,
        presentCount: 30,
        absentCount: 1,
        lateCount: 1,
        attendanceRate: 93.8,
      },
      {
        classId: "3",
        className: "Grade 9",
        section: "A",
        totalStudents: 38,
        presentCount: 36,
        absentCount: 2,
        lateCount: 0,
        attendanceRate: 94.7,
      },
    ];
  };

  const fetchAttendanceTrends = async (): Promise<AttendanceTrend[]> => {
    // Mock data for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates.map((date, index) => ({
      date,
      presentCount: 420 + Math.floor(Math.random() * 20),
      absentCount: 20 + Math.floor(Math.random() * 10),
      attendanceRate: 92 + Math.random() * 6,
    }));
  };

  const exportReport = async () => {
    try {
      // Mock export functionality
      toast.success("Report exported successfully");
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 95) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (rate >= 90) return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Reports
            </h1>
            <p className="text-gray-600">
              View comprehensive attendance reports and analytics
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-[180px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="grade10a">Grade 10-A</SelectItem>
                    <SelectItem value="grade10b">Grade 10-B</SelectItem>
                    <SelectItem value="grade9a">Grade 9-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="range">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Students
                </CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <p className="text-xs text-gray-500">Enrolled students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Present Today
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.presentToday}
                </div>
                <p className="text-xs text-gray-500">Students present</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Absent Today
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.absentToday}
                </div>
                <p className="text-xs text-gray-500">Students absent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Attendance Rate
                </CardTitle>
                <BarChart3
                  className={`h-4 w-4 ${getAttendanceColor(
                    stats.attendanceRate
                  )}`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${getAttendanceColor(
                    stats.attendanceRate
                  )}`}
                >
                  {stats.attendanceRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500">Overall rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Class-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Class-wise Attendance</CardTitle>
            <CardDescription>
              Attendance breakdown by class for{" "}
              {new Date(selectedDate).toLocaleDateString()}
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
                    <TableHead>Class</TableHead>
                    <TableHead>Total Students</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classAttendance.map((cls) => (
                    <TableRow key={cls.classId}>
                      <TableCell className="font-medium">
                        {cls.className} - {cls.section}
                      </TableCell>
                      <TableCell>{cls.totalStudents}</TableCell>
                      <TableCell>
                        <span className="text-green-600 font-medium">
                          {cls.presentCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-red-600 font-medium">
                          {cls.absentCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-yellow-600 font-medium">
                          {cls.lateCount}
                        </span>
                      </TableCell>
                      <TableCell
                        className={getAttendanceColor(cls.attendanceRate)}
                      >
                        <span className="font-medium">
                          {cls.attendanceRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell>
                        {getAttendanceIcon(cls.attendanceRate)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Daily attendance trends for the last {dateRange} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {trends.slice(-4).map((trend, index) => (
                    <Card key={trend.date}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {new Date(trend.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                            <p
                              className={`text-lg font-bold ${getAttendanceColor(
                                trend.attendanceRate
                              )}`}
                            >
                              {trend.attendanceRate.toFixed(1)}%
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>Present: {trend.presentCount}</div>
                            <div>Absent: {trend.absentCount}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Simple trend visualization */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-4">Weekly Trend Analysis</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium">Best Day</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {trends.length > 0 &&
                          new Date(
                            trends.reduce((best, current) =>
                              current.attendanceRate > best.attendanceRate
                                ? current
                                : best
                            ).date
                          ).toLocaleDateString("en-US", { weekday: "long" })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                        <span className="font-medium">Lowest Day</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {trends.length > 0 &&
                          new Date(
                            trends.reduce((lowest, current) =>
                              current.attendanceRate < lowest.attendanceRate
                                ? current
                                : lowest
                            ).date
                          ).toLocaleDateString("en-US", { weekday: "long" })}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="font-medium">Average</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {trends.length > 0 &&
                          (
                            trends.reduce(
                              (sum, trend) => sum + trend.attendanceRate,
                              0
                            ) / trends.length
                          ).toFixed(1)}
                        %
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="font-medium">Days Analyzed</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {trends.length} days
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
