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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  BookOpen,
  Calendar,
  MapPin,
  User,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface ScheduleItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room?: string;
  class: {
    id: string;
    name: string;
    section: string;
    academicYear: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
    teacher?: {
      user: {
        name: string;
        email: string;
      };
    };
  };
}

interface ScheduleStats {
  totalClasses: number;
  totalSubjects: number;
  activeDays: number;
  dailyAverage: number;
}

interface ScheduleByDay {
  [key: string]: ScheduleItem[];
}

const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_NAMES: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default function StudentSchedulePage() {
  const [schedulesByDay, setSchedulesByDay] = useState<ScheduleByDay>({});
  const [stats, setStats] = useState<ScheduleStats>({
    totalClasses: 0,
    totalSubjects: 0,
    activeDays: 0,
    dailyAverage: 0,
  });

  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [currentDay, setCurrentDay] = useState<string>("");

  // Get current day
  useEffect(() => {
    const today = new Date();
    const dayNames = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    setCurrentDay(dayNames[today.getDay()]);
  }, []);

  // Fetch schedule
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDay && selectedDay !== "all") {
        params.append("day", selectedDay);
      }

      const response = await fetch(`/api/student/schedule?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchedulesByDay(data.schedulesByDay || {});
        setStats(
          data.stats || {
            totalClasses: 0,
            totalSubjects: 0,
            activeDays: 0,
            dailyAverage: 0,
          }
        );
      } else {
        toast.error("Failed to fetch schedule");
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Failed to fetch schedule");
    } finally {
      setLoading(false);
    }
  };

  // Format time
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get time period color
  const getTimePeriodColor = (startTime: string) => {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return "bg-blue-100 text-blue-800 border-blue-200";
    if (hour < 16) return "bg-green-100 text-green-800 border-green-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  // Get next class
  const getNextClass = () => {
    const now = new Date();
    const currentTimeString = `${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const todaySchedules = schedulesByDay[currentDay] || [];

    const upcomingClasses = todaySchedules
      .filter((schedule) => schedule.startTime > currentTimeString)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return upcomingClasses[0] || null;
  };

  // Get current class
  const getCurrentClass = () => {
    const now = new Date();
    const currentTimeString = `${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const todaySchedules = schedulesByDay[currentDay] || [];

    return (
      todaySchedules.find(
        (schedule) =>
          schedule.startTime <= currentTimeString &&
          schedule.endTime > currentTimeString
      ) || null
    );
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDay]);

  const nextClass = getNextClass();
  const currentClass = getCurrentClass();
  const todaySchedules = schedulesByDay[currentDay] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
            <p className="text-gray-600 mt-1">
              View your class timetable and upcoming sessions
            </p>
          </div>
          <Button onClick={fetchSchedule} disabled={loading}>
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Classes
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalClasses}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Subjects
              </CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalSubjects}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Days
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeDays}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Daily Average
              </CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {stats.dailyAverage.toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current and Next Class */}
        {(currentClass || nextClass) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentClass && (
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Current Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xl font-bold">
                      {currentClass.subject.name}
                    </div>
                    <div className="flex items-center gap-4 text-green-100">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(currentClass.startTime)} -{" "}
                        {formatTime(currentClass.endTime)}
                      </span>
                      {currentClass.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {currentClass.room}
                        </span>
                      )}
                    </div>
                    {currentClass.subject.teacher && (
                      <div className="flex items-center gap-1 text-green-100">
                        <User className="h-4 w-4" />
                        {currentClass.subject.teacher.user.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {nextClass && (
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Next Class
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xl font-bold">
                      {nextClass.subject.name}
                    </div>
                    <div className="flex items-center gap-4 text-blue-100">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(nextClass.startTime)} -{" "}
                        {formatTime(nextClass.endTime)}
                      </span>
                      {nextClass.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {nextClass.room}
                        </span>
                      )}
                    </div>
                    {nextClass.subject.teacher && (
                      <div className="flex items-center gap-1 text-blue-100">
                        <User className="h-4 w-4" />
                        {nextClass.subject.teacher.user.name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Day Filter */}
        <Card className="bg-white shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Filter by day:
                </label>
                <Select value={selectedDay} onValueChange={setSelectedDay}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day} value={day}>
                        {DAY_NAMES[day]} {day === currentDay && "(Today)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {todaySchedules.length > 0 && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {todaySchedules.length} classes today
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {DAYS_OF_WEEK.map((day) => {
            // Skip days if filtering by specific day
            if (selectedDay !== "all" && selectedDay !== day) return null;

            const daySchedules = schedulesByDay[day] || [];
            const isToday = day === currentDay;

            return (
              <Card
                key={day}
                className={`bg-white shadow-sm ${
                  isToday ? "ring-2 ring-blue-500" : ""
                } ${daySchedules.length === 0 ? "opacity-60" : ""}`}
              >
                <CardHeader className={`pb-3 ${isToday ? "bg-blue-50" : ""}`}>
                  <CardTitle className="flex items-center justify-between">
                    <span
                      className={`${
                        isToday ? "text-blue-700" : "text-gray-900"
                      }`}
                    >
                      {DAY_NAMES[day]}
                      {isToday && (
                        <span className="text-sm font-normal ml-2">
                          (Today)
                        </span>
                      )}
                    </span>
                    <Badge
                      variant={isToday ? "default" : "outline"}
                      className={isToday ? "bg-blue-600" : ""}
                    >
                      {daySchedules.length} classes
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {daySchedules.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500 text-sm">
                        No classes scheduled
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {daySchedules
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((schedule) => {
                          const isCurrentClass =
                            isToday && schedule === currentClass;
                          const isNextClass = isToday && schedule === nextClass;

                          return (
                            <div
                              key={schedule.id}
                              className={`border rounded-lg p-3 space-y-3 transition-all hover:shadow-md ${
                                isCurrentClass
                                  ? "border-green-500 bg-green-50"
                                  : isNextClass
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="secondary"
                                  className={`${getTimePeriodColor(
                                    schedule.startTime
                                  )} font-medium`}
                                >
                                  {formatTime(schedule.startTime)} -{" "}
                                  {formatTime(schedule.endTime)}
                                </Badge>
                                {isCurrentClass && (
                                  <Badge className="bg-green-600 text-white">
                                    Now
                                  </Badge>
                                )}
                                {isNextClass && !isCurrentClass && (
                                  <Badge className="bg-blue-600 text-white">
                                    Next
                                  </Badge>
                                )}
                              </div>

                              <div>
                                <div className="font-semibold text-gray-900">
                                  {schedule.subject.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {schedule.subject.code}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="h-3 w-3" />
                                  {schedule.class.name} -{" "}
                                  {schedule.class.section}
                                </div>

                                {schedule.room && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    {schedule.room}
                                  </div>
                                )}

                                {schedule.subject.teacher && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <User className="h-3 w-3" />
                                    {schedule.subject.teacher.user.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state for filtered view */}
        {selectedDay !== "all" &&
          (!schedulesByDay[selectedDay] ||
            schedulesByDay[selectedDay].length === 0) && (
            <Card className="bg-white shadow-sm">
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Classes Scheduled
                  </h3>
                  <p className="text-gray-500">
                    There are no classes scheduled for {DAY_NAMES[selectedDay]}.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
