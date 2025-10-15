"use client";

import { useState, useEffect } from "react";
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
  Users,
  ClipboardCheck,
  Calendar,
  FileText,
  Clock,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  todayClasses: number;
  totalGrades: number;
  attendanceRate: number;
}

interface ScheduleItem {
  id: string;
  time: string;
  endTime: string;
  subject: string;
  subjectCode: string;
  class: string;
  classId: string;
}

interface AttendanceByClass {
  classId: string;
  className: string;
  attendanceRate: number;
}

interface RecentActivity {
  type: string;
  message: string;
  time: string;
}

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalStudents: 0,
    todayClasses: 0,
    totalGrades: 0,
    attendanceRate: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [attendanceByClass, setAttendanceByClass] = useState<
    AttendanceByClass[]
  >([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/dashboard");

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setTodaySchedule(data.todaySchedule || []);
        setAttendanceByClass(data.attendanceByClass || []);
        setRecentActivities(data.recentActivities || []);
      } else {
        toast.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Format time display for recent activities
  const formatTimeAgo = (timeString: string) => {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMs = now.getTime() - time.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else {
      return "Recently";
    }
  };

  // Get activity color
  const getActivityColor = (type: string) => {
    switch (type) {
      case "attendance":
        return "bg-blue-600";
      case "grade":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s your daily overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-gray-500">Active classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-gray-500">Under my guidance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Classes
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayClasses}</div>
              <p className="text-xs text-gray-500">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Grades
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalGrades}</div>
              <p className="text-xs text-gray-500">Grades recorded</p>
            </CardContent>
          </Card>
        </div>

        {/* Today&apos;s Schedule and Attendance */}
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
              {loading ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Loading schedule...
                  </div>
                </div>
              ) : todaySchedule.length === 0 ? (
                <div className="text-center py-4">
                  <Calendar className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <div className="text-sm text-muted-foreground">
                    No classes scheduled for today
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-bold text-blue-600">
                          {schedule.time}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {schedule.subject}
                          </p>
                          <p className="text-xs text-gray-500">
                            Class {schedule.class} • {schedule.subjectCode}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {schedule.endTime}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-green-600" />
                Attendance Overview
              </CardTitle>
              <CardDescription>
                Overall attendance in your classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Loading attendance...
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.attendanceRate}%
                    </div>
                    <p className="text-sm text-gray-500">
                      Average attendance rate
                    </p>
                  </div>
                  {attendanceByClass.length > 0 && (
                    <div className="space-y-2">
                      {attendanceByClass.slice(0, 4).map((classData) => (
                        <div
                          key={classData.classId}
                          className="flex justify-between text-sm"
                        >
                          <span>{classData.className}</span>
                          <span className="font-medium">
                            {classData.attendanceRate}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>Your recent teaching activities</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="text-sm text-muted-foreground">
                  Loading activities...
                </div>
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <div className="text-sm text-muted-foreground">
                  No recent activities
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div
                      className={`w-2 h-2 ${getActivityColor(
                        activity.type
                      )} rounded-full`}
                    ></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">
                        {formatTimeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
