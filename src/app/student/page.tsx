"use client";

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
} from "lucide-react";

export default function StudentDashboard() {
  // Mock data - in real app, fetch from API
  const stats = {
    totalSubjects: 8,
    attendanceRate: 94.5,
    pendingAssignments: 3,
    upcomingExams: 2,
    averageGrade: 87.5,
    classRank: 5,
  };

  const todaySchedule = [
    {
      time: "08:00",
      subject: "Mathematics",
      teacher: "Mr. Smith",
      room: "101",
    },
    { time: "09:30", subject: "Physics", teacher: "Ms. Johnson", room: "205" },
    { time: "11:00", subject: "Chemistry", teacher: "Dr. Brown", room: "302" },
    { time: "14:00", subject: "English", teacher: "Mrs. Davis", room: "108" },
  ];

  const recentGrades = [
    {
      subject: "Mathematics",
      assignment: "Algebra Test",
      grade: "A",
      score: 92,
    },
    {
      subject: "Physics",
      assignment: "Mechanics Quiz",
      grade: "B+",
      score: 88,
    },
    { subject: "Chemistry", assignment: "Lab Report", grade: "A-", score: 90 },
    { subject: "English", assignment: "Essay Writing", grade: "A", score: 95 },
  ];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s your academic overview.
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
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
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
              <div className="text-2xl font-bold">{stats.averageGrade}%</div>
              <p className="text-xs text-gray-500">Current semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingAssignments}
              </div>
              <p className="text-xs text-gray-500">Assignments due</p>
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
              <div className="space-y-3">
                {todaySchedule.map((schedule, index) => (
                  <div
                    key={index}
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
                          {schedule.teacher} • Room {schedule.room}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-3">
                {recentGrades.map((grade, index) => (
                  <div
                    key={index}
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
                      <p className="text-xs text-gray-500">{grade.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New study materials uploaded for Physics
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Mathematics test results are available
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Library hours extended during exam week
                    </p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
