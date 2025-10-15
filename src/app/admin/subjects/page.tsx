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
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  BookOpen,
  Users,
  GraduationCap,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  teacherId?: string;
  teacher?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  class?: {
    id: string;
    name: string;
    section: string;
    academicYear: string;
  };
  _count: {
    attendances: number;
    assignments: number;
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

interface Class {
  id: string;
  name: string;
  section: string;
  academicYear: string;
}

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    credits: "",
    teacherId: "unassigned",
    classIds: [] as string[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [currentPage, searchTerm, selectedTeacher]);

  const fetchData = async () => {
    try {
      const [teachersRes, classesRes] = await Promise.all([
        fetch("/api/teachers?limit=100"),
        fetch("/api/classes"),
      ]);

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        // Filter only active teachers
        const activeTeachers = (teachersData.teachers || []).filter(
          (teacher: Teacher) => teacher.user.isActive
        );
        setTeachers(activeTeachers);
      } else {
        const error = await teachersRes.json();
        toast.error(error.error || "Failed to fetch teachers");
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
      } else {
        const error = await classesRes.json();
        toast.error(error.error || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    }
  };

  const fetchSubjects = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),

        ...(selectedTeacher &&
          selectedTeacher !== "all" && { teacherId: selectedTeacher }),
      });

      const response = await fetch(`/api/subjects?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSubjects(data.subjects);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        toast.error(data.error || "Failed to fetch subjects");
      }
    } catch (error) {
      toast.error("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        credits: formData.credits ? parseFloat(formData.credits) : undefined,
        teacherId:
          formData.teacherId === "unassigned"
            ? null
            : formData.teacherId || null,
      };

      console.log("Submitting subject data:", submitData);

      const url = editingSubject
        ? `/api/subjects/${editingSubject.id}`
        : "/api/subjects";
      const method = editingSubject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();
      console.log("API response:", data);

      if (response.ok) {
        toast.success(data.message);
        setIsDialogOpen(false);
        resetForm();
        fetchSubjects();
      } else {
        console.error("API error:", data);
        toast.error(
          data.error ||
            `Failed to ${editingSubject ? "update" : "create"} subject`
        );
        if (data.details) {
          console.error("Validation details:", data.details);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(`Failed to ${editingSubject ? "update" : "create"} subject`);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || "",
      credits: subject.credits?.toString() || "",
      teacherId: subject.teacherId || "unassigned",
      classIds: subject.class ? [subject.class.id] : [],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (subject: Subject) => {
    if (!confirm(`Are you sure you want to delete ${subject.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/subjects/${subject.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchSubjects();
      } else {
        toast.error(data.error || "Failed to delete subject");
      }
    } catch (error) {
      toast.error("Failed to delete subject");
    }
  };

  const handleClassToggle = (classId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      classIds: checked
        ? [...prev.classIds, classId]
        : prev.classIds.filter((id) => id !== classId),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      credits: "",
      teacherId: "unassigned",
      classIds: [],
    });
    setEditingSubject(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Subject Management
            </h1>
            <p className="text-gray-600">
              Manage subjects, curriculum, and teacher assignments
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
                <DialogDescription>
                  {editingSubject
                    ? "Update subject information and assignments"
                    : "Create a new subject and assign to classes"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Mathematics, English"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="code">Subject Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., MATH101, ENG201"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 3, 4.5"
                    value={formData.credits}
                    onChange={(e) =>
                      setFormData({ ...formData, credits: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacherId">Assigned Teacher</Label>
                  <Select
                    value={formData.teacherId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, teacherId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        No teacher assigned
                      </SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.user.name} ({teacher.user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Subject description, objectives, etc."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assign to Classes</Label>
                  <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                    {classes.length === 0 ? (
                      <p className="text-gray-500">No classes available</p>
                    ) : (
                      <div className="space-y-2">
                        {classes.map((cls) => (
                          <div
                            key={cls.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`class-${cls.id}`}
                              checked={formData.classIds.includes(cls.id)}
                              onCheckedChange={(checked) =>
                                handleClassToggle(cls.id, checked as boolean)
                              }
                            />
                            <Label
                              htmlFor={`class-${cls.id}`}
                              className="text-sm"
                            >
                              {cls.name} - {cls.section} ({cls.academicYear})
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                    {editingSubject ? "Update Subject" : "Create Subject"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Subjects
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subjects.length}</div>
              <p className="text-xs text-gray-500">Active subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assigned</CardTitle>
              <User className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjects.filter((s) => s.teacher).length}
              </div>
              <p className="text-xs text-gray-500">With teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Classes
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjects.reduce((sum, s) => sum + (s.class ? 1 : 0), 0)}
              </div>
              <p className="text-xs text-gray-500">Class assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <GraduationCap className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {subjects.reduce((sum, s) => sum + s._count.assignments, 0)}
              </div>
              <p className="text-xs text-gray-500">Total assignments</p>
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
                    placeholder="Search by subject name, code, or description..."
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
                value={selectedTeacher}
                onValueChange={(value) => {
                  setSelectedTeacher(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
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
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>{subjects.length} subjects found</CardDescription>
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
                      <TableHead>Subject</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Assignments</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subject.name}</div>
                            {subject.description && (
                              <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                {subject.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {subject.code}
                        </TableCell>
                        <TableCell>
                          {subject.class ? (
                            `${subject.class.name} - ${subject.class.section}`
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {subject.teacher ? (
                            <div>
                              <div className="font-medium">
                                {subject.teacher.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {subject.teacher.user.email}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-blue-600 font-medium">
                            {subject._count.assignments}
                          </span>
                        </TableCell>
                        <TableCell>
                          {subject.credits || (
                            <span className="text-gray-400">Not set</span>
                          )}
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
                                onClick={() => handleEdit(subject)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(subject)}
                                className="text-red-600"
                                disabled={subject._count.attendances > 0}
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
