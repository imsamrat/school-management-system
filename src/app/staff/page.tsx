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
  Users,
  ClipboardCheck,
  DollarSign,
  FileText,
  Phone,
  Mail,
} from "lucide-react";

export default function StaffDashboard() {
  // Mock data - in real app, fetch from API
  const stats = {
    totalStudents: 1250,
    presentToday: 1180,
    absentToday: 70,
    pendingAdmissions: 15,
    feesPending: 25000,
    feesCollected: 185000,
    newMessages: 8,
  };

  const pendingTasks = [
    { task: "Process admission applications", count: 15, priority: "high" },
    { task: "Send fee reminders", count: 45, priority: "medium" },
    { task: "Update student records", count: 8, priority: "low" },
    { task: "Generate monthly reports", count: 3, priority: "high" },
  ];

  return (
    <DashboardLayout role="staff">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here&apos;s your administrative overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalStudents.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">Active enrollments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Attendance
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.presentToday}</div>
              <p className="text-xs text-gray-500">
                {stats.absentToday} absent today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Fees
              </CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${stats.feesPending.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">Outstanding payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Messages
              </CardTitle>
              <Mail className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newMessages}</div>
              <p className="text-xs text-gray-500">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Overview and Fee Collection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardCheck className="h-5 w-5 mr-2 text-blue-600" />
                Attendance Overview
              </CardTitle>
              <CardDescription>Daily attendance tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Present Today</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats.presentToday}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Absent Today</span>
                  <span className="text-lg font-bold text-red-600">
                    {stats.absentToday}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.presentToday / stats.totalStudents) * 100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {((stats.presentToday / stats.totalStudents) * 100).toFixed(
                    1
                  )}
                  % attendance rate
                </p>
                <div className="pt-2">
                  <p className="text-sm font-medium text-red-600">
                    {stats.absentToday} students need follow-up calls
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Fee Collection Status
              </CardTitle>
              <CardDescription>Monthly fee collection overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Collected</span>
                  <span className="text-lg font-bold text-green-600">
                    ${stats.feesCollected.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pending</span>
                  <span className="text-lg font-bold text-orange-600">
                    ${stats.feesPending.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        (stats.feesCollected /
                          (stats.feesCollected + stats.feesPending)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {(
                    (stats.feesCollected /
                      (stats.feesCollected + stats.feesPending)) *
                    100
                  ).toFixed(1)}
                  % collection rate
                </p>
                <div className="pt-2">
                  <p className="text-sm font-medium text-orange-600">
                    45 students need fee reminders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Tasks and Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Pending Tasks
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.task}</p>
                      <p className="text-xs text-gray-500">
                        Priority:{" "}
                        <span
                          className={`font-medium ${
                            task.priority === "high"
                              ? "text-red-600"
                              : task.priority === "medium"
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-600">
                        {task.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest administrative activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      New student admission processed
                    </p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Fee payment received from John Doe
                    </p>
                    <p className="text-xs text-gray-500">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Attendance report sent to parents
                    </p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Monthly enrollment report generated
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
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
