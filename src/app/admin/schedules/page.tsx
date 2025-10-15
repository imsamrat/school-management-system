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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  Plus,
  Clock,
  BookOpen,
  Users,
  CalendarDays,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface ScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string;
  class: {
    id: string;
    name: string;
    section: string;
    academicYear: string;
    teacher?: {
      user: {
        name: string;
        email: string;
      };
    };
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

interface Teacher {
  id: string;
  employeeId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ScheduleStats {
  totalSchedules: number;
  totalClasses: number;
  totalSubjects: number;
  activeDays: number;
}

interface ScheduleByDay {
  [key: number]: ScheduleItem[];
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

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [schedulesByDay, setSchedulesByDay] = useState<ScheduleByDay>({});
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<ScheduleStats>({
    totalSchedules: 0,
    totalClasses: 0,
    totalSubjects: 0,
    activeDays: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"week" | "list">("week");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(
    null
  );
  const [formData, setFormData] = useState({
    classId: "",
    subjectId: "",
    dayOfWeek: 0,
    startTime: "",
    endTime: "",
    room: "",
  });

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: viewMode === "week" ? "100" : "20",
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedClass && selectedClass !== "all")
        params.append("classId", selectedClass);
      if (selectedSubject && selectedSubject !== "all")
        params.append("subjectId", selectedSubject);
      if (selectedTeacher && selectedTeacher !== "all")
        params.append("teacherId", selectedTeacher);
      if (selectedDay && selectedDay !== "all")
        params.append("dayOfWeek", selectedDay);

      const response = await fetch(`/api/admin/schedules?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data.schedules || []);
        setSchedulesByDay(data.schedulesByDay || {});
        setClasses(data.classes || []);
        setSubjects(data.subjects || []);
        setTeachers(data.teachers || []);
        setStats(
          data.stats || {
            totalSchedules: 0,
            totalClasses: 0,
            totalSubjects: 0,
            activeDays: 0,
          }
        );
        setTotalPages(data.totalPages || 1);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to fetch schedules:", errorData);
        toast.error(
          errorData.error || "Failed to fetch schedules. Please try again."
        );
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  // Create schedule
  const createSchedule = async () => {
    try {
      const response = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Schedule created successfully");
        setShowCreateDialog(false);
        resetForm();
        fetchSchedules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create schedule");
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
      toast.error("Failed to create schedule");
    }
  };

  // Update schedule
  const updateSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/admin/schedules?id=${scheduleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Schedule updated successfully");
        setEditingSchedule(null);
        resetForm();
        fetchSchedules();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update schedule");
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule");
    }
  };

  // Delete schedule
  const deleteSchedule = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const response = await fetch(`/api/admin/schedules?id=${scheduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Schedule deleted successfully");
        fetchSchedules();
      } else {
        toast.error("Failed to delete schedule");
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      classId: "",
      subjectId: "",
      dayOfWeek: 0,
      startTime: "",
      endTime: "",
      room: "",
    });
  };

  // Handle edit
  const handleEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setFormData({
      classId: schedule.class.id,
      subjectId: schedule.subject.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room || "",
    });
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
    if (hour < 12) return "bg-blue-100 text-blue-800";
    if (hour < 16) return "bg-green-100 text-green-800";
    return "bg-orange-100 text-orange-800";
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedClass("all");
    setSelectedSubject("all");
    setSelectedTeacher("all");
    setSelectedDay("all");
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchSchedules();
  }, [
    currentPage,
    searchTerm,
    selectedClass,
    selectedSubject,
    selectedTeacher,
    selectedDay,
    viewMode,
  ]);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <p className="text-muted-foreground">
              Manage class schedules and timetables
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
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Schedule</DialogTitle>
                  <DialogDescription>
                    Add a new class schedule entry to the timetable.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="class">Class</Label>
                      <Select
                        value={formData.classId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, classId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
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
                      <Label htmlFor="subject">Subject</Label>
                      <Select
                        value={formData.subjectId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, subjectId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="day">Day</Label>
                      <Select
                        value={formData.dayOfWeek.toString()}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            dayOfWeek: parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem
                              key={day.value}
                              value={day.value.toString()}
                            >
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="room">Room (Optional)</Label>
                    <Input
                      id="room"
                      placeholder="e.g., Room 101, Lab A"
                      value={formData.room}
                      onChange={(e) =>
                        setFormData({ ...formData, room: e.target.value })
                      }
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={createSchedule}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Schedule
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Schedules
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Days</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDays}</div>
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
                    placeholder="Search schedules..."
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

              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTeacher}
                onValueChange={setSelectedTeacher}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.user.name}
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

              {(searchTerm ||
                selectedClass !== "all" ||
                selectedSubject !== "all" ||
                selectedTeacher !== "all" ||
                selectedDay !== "all") && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Schedule Content */}
        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  Loading schedules...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "week" ? (
          // Week View
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {DAYS_OF_WEEK.map((day) => {
              const daySchedules = schedulesByDay[day.value] || [];
              return (
                <Card
                  key={day.value}
                  className={daySchedules.length === 0 ? "opacity-50" : ""}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{day.label}</span>
                      <Badge variant="outline">
                        {daySchedules.length} classes
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {daySchedules.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground">
                        No classes scheduled
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {daySchedules
                          .sort((a: any, b: any) =>
                            a.startTime.localeCompare(b.startTime)
                          )
                          .map((schedule: any) => (
                            <div
                              key={schedule.id}
                              className="border rounded-lg p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="secondary"
                                  className={getTimePeriodColor(
                                    schedule.startTime
                                  )}
                                >
                                  {formatTime(schedule.startTime)} -{" "}
                                  {formatTime(schedule.endTime)}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEdit(schedule)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteSchedule(schedule.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <div className="font-medium">
                                  {schedule.subject.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {schedule.subject.code}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {schedule.class.name} - {schedule.class.section}
                                {schedule.room && (
                                  <span> • {schedule.room}</span>
                                )}
                              </div>
                              {schedule.subject.teacher && (
                                <div className="text-xs text-muted-foreground">
                                  Teacher: {schedule.subject.teacher.user.name}
                                </div>
                              )}
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
                Complete list of all scheduled classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="text-center text-muted-foreground"
                        >
                          No schedules found
                        </TableCell>
                      </TableRow>
                    ) : (
                      schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <Badge variant="outline">
                              {DAY_NAMES[schedule.dayOfWeek] ||
                                `Day ${schedule.dayOfWeek}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatTime(schedule.startTime)} -{" "}
                            {formatTime(schedule.endTime)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {schedule.subject.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {schedule.subject.code}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {schedule.class.name} - {schedule.class.section}
                          </TableCell>
                          <TableCell>{schedule.room || "-"}</TableCell>
                          <TableCell>
                            {schedule.subject.teacher?.user.name ||
                              "Not assigned"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(schedule)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteSchedule(schedule.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog
          open={!!editingSchedule}
          onOpenChange={() => setEditingSchedule(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Schedule</DialogTitle>
              <DialogDescription>
                Update the schedule details.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editClass">Class</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, classId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
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
                  <Label htmlFor="editSubject">Subject</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subjectId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="editDay">Day</Label>
                  <Select
                    value={formData.dayOfWeek.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, dayOfWeek: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day) => (
                        <SelectItem
                          key={day.value}
                          value={day.value.toString()}
                        >
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="editStartTime">Start Time</Label>
                  <Input
                    id="editStartTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="editEndTime">End Time</Label>
                  <Input
                    id="editEndTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editRoom">Room (Optional)</Label>
                <Input
                  id="editRoom"
                  placeholder="e.g., Room 101, Lab A"
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingSchedule(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={() => updateSchedule(editingSchedule!.id)}>
                  <Save className="h-4 w-4 mr-2" />
                  Update Schedule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
