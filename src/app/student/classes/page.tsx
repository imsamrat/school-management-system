"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, Calendar, Clock } from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
}

interface ClassInfo {
  id: string;
  name: string;
  section: string;
}

interface ClassData {
  class: ClassInfo;
  subjects: Subject[];
  timetable: {
    day: string;
    dayOfWeek: number;
    schedules: {
      id: string;
      subject: string;
      teacher: string;
      startTime: string;
      endTime: string;
      room: string | null;
    }[];
  }[];
}

export default function StudentClassesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassData | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchClassData();
    }
  }, [status]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/student/classes");

      if (!response.ok) {
        throw new Error("Failed to fetch class data");
      }

      const data = await response.json();
      setClassData(data);
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast.error("Failed to load class information");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session || session.user.role !== "STUDENT") {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12">
          <p className="text-gray-500">Unauthorized access</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!classData) {
    return (
      <DashboardLayout role="student">
        <div className="text-center py-12">
          <p className="text-gray-500">No class data available</p>
        </div>
      </DashboardLayout>
    );
  }

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
          <p className="text-gray-600">
            View your class information and subjects
          </p>
        </div>

        {/* Class Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Class Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Class Name</p>
                <p className="text-lg font-semibold">{classData.class.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Section</p>
                <p className="text-lg font-semibold">
                  {classData.class.section}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Subjects</p>
                <p className="text-lg font-semibold">
                  {classData.subjects.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>
              List of subjects you are enrolled in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classData.subjects.map((subject) => (
                <Card key={subject.id} className="border">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {subject.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {subject.code}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {subject.credits} Credits
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {subject.teacher}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Timetable */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-purple-600" />
              Weekly Timetable
            </CardTitle>
            <CardDescription>Your complete weekly schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {daysOfWeek.map((day, index) => {
                const daySchedule = classData.timetable.find(
                  (t) => t.dayOfWeek === (index === 6 ? 7 : index + 1)
                );

                return (
                  <div key={day}>
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">
                      {day}
                    </h3>
                    {daySchedule && daySchedule.schedules.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {daySchedule.schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {schedule.startTime} - {schedule.endTime}
                              </Badge>
                              {schedule.room && (
                                <span className="text-xs text-gray-500">
                                  Room {schedule.room}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm mb-1">
                              {schedule.subject}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {schedule.teacher}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-4 border rounded-lg text-center bg-gray-50">
                        No classes scheduled
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
