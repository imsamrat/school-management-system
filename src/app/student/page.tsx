"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  ClipboardCheck,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface DashboardData {
  student: {
    id: string;
    name: string;
    email: string;
    rollNo: string;
    class: {
      name: string;
      section: string;
    } | null;
    profileImage: string | null;
  };
  stats: {
    totalSubjects: number;
    attendanceRate: number;
    averageGrade: number;
    totalGrades: number;
  };
  subjects: any[];
  recentGrades: any[];
  todaySchedule: any[];
  announcements: any[];
}

export default function StudentDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/student/dashboard");
      const data = await response.json();

      if (response.ok) {
        setDashboardData(data);
      } else {
        toast.error(data.error || "Failed to load dashboard");
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600">No data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const { student, stats, recentGrades, todaySchedule, announcements } =
    dashboardData;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {student.name}!
          </h1>
          <p className="text-gray-600">
            {student.class
              ? `Class: ${student.class.name} - ${student.class.section} | Roll No: ${student.rollNo}`
              : "No class assigned"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubjects}</div>
              <p className="text-xs text-gray-500">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.attendanceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Grade
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageGrade.toFixed(1)}
              </div>
              <p className="text-xs text-gray-500">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Grades
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGrades}</div>
              <p className="text-xs text-gray-500">Published grades</p>
            </CardContent>
          </Card>
        </div>

        {/* Today&apos;s Schedule and Recent Grades */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Today&apos;s Schedule
              </CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              {todaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedule.map((schedule: any) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-bold text-blue-600">
                          {schedule.startTime}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {schedule.subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            {schedule.teacher} • Room {schedule.room || "TBA"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No classes scheduled for today
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Recent Grades
              </CardTitle>
              <CardDescription>
                Your latest academic performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentGrades.length > 0 ? (
                <div className="space-y-3">
                  {recentGrades.map((grade: any) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{grade.subject}</p>
                        <p className="text-xs text-gray-500">
                          {grade.assignment}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600">
                          {grade.grade}
                        </p>
                        <p className="text-xs text-gray-500">
                          {grade.score}/{grade.totalMarks}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No grades published yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events and Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                Upcoming Events
              </CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-red-600">15</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Physics Exam</p>
                    <p className="text-xs text-gray-500">
                      March 15, 2024 • 2:00 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">20</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Math Assignment Due</p>
                    <p className="text-xs text-gray-500">
                      March 20, 2024 • 11:59 PM
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Announcements</CardTitle>
              <CardDescription>
                Latest updates from your teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((announcement: any) => (
                    <div
                      key={announcement.id}
                      className="flex items-center space-x-4"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          announcement.priority === "HIGH"
                            ? "bg-red-600"
                            : announcement.priority === "MEDIUM"
                            ? "bg-orange-600"
                            : "bg-blue-600"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {announcement.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(
                            announcement.publishDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  No announcements available
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
