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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface Class {
  id: string;
  name: string;
  section: string;
  academicYear: string;
  capacity?: number;
  description?: string;
  isActive: boolean;
  teacher?: {
    user: {
      name: string;
      email: string;
    };
  };
  _count: {
    students: number;
    subjects: number;
  };
}

interface Teacher {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
}

const academicYears = ["2024-25", "2025-26", "2026-27"];

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [assignTeacherDialogOpen, setAssignTeacherDialogOpen] = useState(false);
  const [selectedClassForAssignment, setSelectedClassForAssignment] =
    useState<Class | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("none");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    academicYear: "2024-25",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    fetchClasses();
  }, [currentPage, searchTerm, selectedAcademicYear]);

  const fetchClasses = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedAcademicYear &&
          selectedAcademicYear !== "all" && {
            academicYear: selectedAcademicYear,
          }),
      });

      const response = await fetch(`/api/classes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setClasses(data.classes);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        toast.error(data.error || "Failed to fetch classes");
      }
    } catch (error) {
      toast.error("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      const url = editingClass
        ? `/api/classes/${editingClass.id}`
        : "/api/classes";
      const method = editingClass ? "PUT" : "POST";

      console.log("Submitting class data:", submitData);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      console.log("Response status:", response.status);

      let data;
      try {
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        toast.error("Server returned invalid response");
        return;
      }

      if (response.ok) {
        toast.success(data.message || "Class saved successfully");
        setIsDialogOpen(false);
        resetForm();
        fetchClasses();
      } else {
        console.error("API error:", data);
        const errorMessage =
          data.error ||
          data.details ||
          `Failed to ${editingClass ? "update" : "create"} class`;
        toast.error(
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage)
        );
      }
    } catch (error) {
      console.error("Request error:", error);
      toast.error(
        `Network error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleEdit = (classData: Class) => {
    setEditingClass(classData);
    setFormData({
      name: classData.name,
      section: classData.section,
      academicYear: classData.academicYear,
      capacity: classData.capacity?.toString() || "",
      description: classData.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (classData: Class) => {
    if (
      !confirm(
        `Are you sure you want to delete ${classData.name} - ${classData.section}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/classes/${classData.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchClasses();
      } else {
        toast.error(data.error || "Failed to delete class");
      }
    } catch (error) {
      toast.error("Failed to delete class");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      section: "",
      academicYear: "2024-25",
      capacity: "",
      description: "",
    });
    setEditingClass(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  // Teacher assignment functions
  const handleAssignTeacher = async (classData: Class) => {
    setSelectedClassForAssignment(classData);

    // Fetch fresh teacher data when dialog opens
    try {
      const response = await fetch("/api/teachers?limit=100");
      const data = await response.json();

      if (response.ok) {
        // Filter only active teachers
        const activeTeachers = (data.teachers || []).filter(
          (t: Teacher) => t.user.isActive
        );
        setTeachers(activeTeachers);

        // Find the teacher ID from the teachers list based on email
        const assignedTeacher = classData.teacher
          ? activeTeachers.find(
              (t: Teacher) => t.user.email === classData.teacher?.user.email
            )
          : null;
        setSelectedTeacherId(assignedTeacher?.id || "none");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to fetch teachers");
        setTeachers([]);
        setSelectedTeacherId("none");
      }
    } catch (error) {
      toast.error("Failed to fetch teachers");
      setTeachers([]);
      setSelectedTeacherId("none");
    }

    setAssignTeacherDialogOpen(true);
  };

  const assignTeacher = async () => {
    if (!selectedClassForAssignment) return;

    try {
      // If "none" is selected, remove the teacher assignment
      if (selectedTeacherId === "none") {
        const response = await fetch(
          `/api/admin/assign-teacher?classId=${selectedClassForAssignment.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          toast.success("Teacher removed successfully");
          setAssignTeacherDialogOpen(false);
          setSelectedClassForAssignment(null);
          setSelectedTeacherId("none");
          fetchClasses();
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to remove teacher");
        }
        return;
      }

      const response = await fetch("/api/admin/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassForAssignment.id,
          teacherId: selectedTeacherId,
        }),
      });

      if (response.ok) {
        toast.success("Teacher assigned successfully");
        setAssignTeacherDialogOpen(false);
        setSelectedClassForAssignment(null);
        setSelectedTeacherId("none");
        fetchClasses();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to assign teacher");
      }
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast.error("Failed to assign teacher");
    }
  };

  const removeTeacher = async (classData: Class) => {
    if (!classData.teacher) return;

    if (
      !confirm(
        `Remove ${classData.teacher.user.name} from ${classData.name} - ${classData.section}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/assign-teacher?classId=${classData.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Teacher removed successfully");
        fetchClasses();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to remove teacher");
      }
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast.error("Failed to remove teacher");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Class Management
            </h1>
            <p className="text-gray-600">
              Manage classes, sections, and academic organization
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? "Edit Class" : "Add New Class"}
                </DialogTitle>
                <DialogDescription>
                  {editingClass
                    ? "Update class information"
                    : "Create a new class for the academic year"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., 10th Grade, Grade 1"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="section">Section *</Label>
                    <Input
                      id="section"
                      placeholder="e.g., A, B, C"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year *</Label>
                    <Select
                      value={formData.academicYear}
                      onValueChange={(value) =>
                        setFormData({ ...formData, academicYear: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Class Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="e.g., 30"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Optional class description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDialogClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClass ? "Update Class" : "Create Class"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Teacher Assignment Dialog */}
          <Dialog
            open={assignTeacherDialogOpen}
            onOpenChange={setAssignTeacherDialogOpen}
          >
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Assign Teacher</DialogTitle>
                <DialogDescription>
                  {selectedClassForAssignment &&
                    `Assign a teacher to ${selectedClassForAssignment.name} - ${selectedClassForAssignment.section}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher">Select Teacher</Label>
                  <Select
                    value={selectedTeacherId}
                    onValueChange={setSelectedTeacherId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No teacher assigned</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.user.name} ({teacher.user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAssignTeacherDialogOpen(false);
                      setSelectedTeacherId("none");
                      setSelectedClassForAssignment(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={assignTeacher}
                    disabled={!selectedTeacherId || selectedTeacherId === ""}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    {selectedTeacherId === "none"
                      ? "Remove Teacher"
                      : "Assign Teacher"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Classes
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
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
              <div className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + c._count.students, 0)}
              </div>
              <p className="text-xs text-gray-500">Enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subjects
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((sum, c) => sum + c._count.subjects, 0)}
              </div>
              <p className="text-xs text-gray-500">Assigned subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Size
              </CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.length > 0
                  ? Math.round(
                      classes.reduce((sum, c) => sum + c._count.students, 0) /
                        classes.length
                    )
                  : 0}
              </div>
              <p className="text-xs text-gray-500">Students per class</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by class name or section..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>

              <Select
                value={selectedAcademicYear}
                onValueChange={(value) => {
                  setSelectedAcademicYear(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  {academicYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
            <CardDescription>{classes.length} classes found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classData) => (
                      <TableRow key={classData.id}>
                        <TableCell className="font-medium">
                          {classData.name}
                        </TableCell>
                        <TableCell>{classData.section}</TableCell>
                        <TableCell>{classData.academicYear}</TableCell>
                        <TableCell>
                          {classData.teacher ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">
                                {classData.teacher.user.name}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeTeacher(classData)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                ×
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAssignTeacher(classData)}
                              className="text-xs"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-600 font-medium">
                            {classData._count.students}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">
                            {classData._count.subjects}
                          </span>
                        </TableCell>
                        <TableCell>
                          {classData.capacity || "No limit"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(classData)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              {classData.teacher && (
                                <DropdownMenuItem
                                  onClick={() => handleAssignTeacher(classData)}
                                >
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Change Teacher
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(classData)}
                                className="text-red-600"
                                disabled={
                                  classData._count.students > 0 ||
                                  classData._count.subjects > 0
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
