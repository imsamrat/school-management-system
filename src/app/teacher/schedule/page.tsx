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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
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
  };
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface ScheduleStats {
  totalClasses: number;
  uniqueClasses: number;
  uniqueSubjects: number;
  daysWithClasses: number;
}

interface ScheduleByDay {
  [key: string]: ScheduleItem[];
}

const DAYS_OF_WEEK = [
  { value: 1, name: "MONDAY", label: "Monday" },
  { value: 2, name: "TUESDAY", label: "Tuesday" },
  { value: 3, name: "WEDNESDAY", label: "Wednesday" },
  { value: 4, name: "THURSDAY", label: "Thursday" },
  { value: 5, name: "FRIDAY", label: "Friday" },
  { value: 6, name: "SATURDAY", label: "Saturday" },
  { value: 7, name: "SUNDAY", label: "Sunday" },
];

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const DAY_NAMES_STRING: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default function TeacherSchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [scheduleByDay, setScheduleByDay] = useState<ScheduleByDay>({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState<ScheduleStats>({
    totalClasses: 0,
    uniqueClasses: 0,
    uniqueSubjects: 0,
    daysWithClasses: 0,
  });

  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "list">("week");
  const [loading, setLoading] = useState(false);

  // Fetch schedule data
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: "100", // Get all schedule items
      });

      if (selectedClass && selectedClass !== "all")
        params.append("classId", selectedClass);
      if (selectedSubject && selectedSubject !== "all")
        params.append("subjectId", selectedSubject);
      if (selectedDay && selectedDay !== "all")
        params.append("dayOfWeek", selectedDay);

      const response = await fetch(`/api/teacher/schedule?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.schedule || []);
        setScheduleByDay(data.scheduleByDay || {});
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
        setStats(
          data.stats || {
            totalClasses: 0,
            uniqueClasses: 0,
            uniqueSubjects: 0,
            daysWithClasses: 0,
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

  // Format time display
  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get time period badge color
  const getTimePeriodColor = (startTime: string) => {
    const hour = parseInt(startTime.split(":")[0]);
    if (hour < 12) return "bg-blue-100 text-blue-800";
    if (hour < 16) return "bg-green-100 text-green-800";
    return "bg-orange-100 text-orange-800";
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedClass("all");
    setSelectedSubject("all");
    setSelectedDay("all");
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedClass, selectedSubject, selectedDay]);

  if (loading && schedule.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="text-lg">Loading schedule...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Class Schedule</h1>
          <p className="text-muted-foreground">
            View your teaching schedule and timetable
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            onClick={() => setViewMode("week")}
            size="sm"
          >
            Week View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            List View
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueClasses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueSubjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Days</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.daysWithClasses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
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

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {((selectedClass && selectedClass !== "all") ||
              (selectedSubject && selectedSubject !== "all") ||
              (selectedDay && selectedDay !== "all")) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Content */}
      {viewMode === "week" ? (
        // Week View
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS_OF_WEEK.map((day) => {
            const daySchedule = scheduleByDay[day.name] || [];
            return (
              <Card
                key={day.value}
                className={daySchedule.length === 0 ? "opacity-50" : ""}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{day.label}</span>
                    <Badge variant="outline">
                      {daySchedule.length} classes
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {daySchedule.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No classes scheduled
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {daySchedule
                        .sort((a: any, b: any) =>
                          a.startTime.localeCompare(b.startTime)
                        )
                        .map((item: any) => (
                          <div
                            key={item.id}
                            className="border rounded-lg p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className={getTimePeriodColor(item.startTime)}
                              >
                                {formatTime(item.startTime)} -{" "}
                                {formatTime(item.endTime)}
                              </Badge>
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.subject.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.subject.code}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              {item.class.name} - {item.class.section}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // List View
        <Card>
          <CardHeader>
            <CardTitle>Schedule List</CardTitle>
            <CardDescription>
              Complete list of your scheduled classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schedule.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No Classes Scheduled
                </h3>
                <p className="text-muted-foreground">
                  {selectedClass || selectedSubject || selectedDay
                    ? "No classes match the selected filters."
                    : "You have no classes scheduled at the moment."}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule
                      .sort((a, b) => {
                        const dayOrder = a.dayOfWeek - b.dayOfWeek;
                        return dayOrder !== 0
                          ? dayOrder
                          : a.startTime.localeCompare(b.startTime);
                      })
                      .map((item) => {
                        const startTime = new Date(
                          `2000-01-01T${item.startTime}`
                        );
                        const endTime = new Date(`2000-01-01T${item.endTime}`);
                        const duration = Math.round(
                          (endTime.getTime() - startTime.getTime()) /
                            (1000 * 60)
                        );

                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {DAY_NAMES[item.dayOfWeek] ||
                                  `Day ${item.dayOfWeek}`}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatTime(item.startTime)} -{" "}
                                  {formatTime(item.endTime)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {item.subject.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.subject.code}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {item.class.name} - {item.class.section}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.class.academicYear}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{duration} min</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
