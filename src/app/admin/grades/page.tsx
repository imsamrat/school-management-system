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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  GraduationCap,
  Trophy,
  TrendingUp,
  Users,
  X,
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface Grade {
  id: string;
  examType: string;
  maxMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks?: string;
  examDate: string;
  createdAt: string;
  published?: boolean;
  student: {
    id: string;
    rollNo: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    class?: {
      id: string;
      name: string;
      section: string;
    };
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

interface Student {
  id: string;
  rollNo?: string;
  rollNumber?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  firstName?: string;
  lastName?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  firstName?: string;
  lastName?: string;
}

interface Class {
  id: string;
  name: string;
  section: string;
  academicYear: string;
}

const examTypes = [
  "Quiz",
  "Test",
  "Midterm",
  "Final",
  "Assignment",
  "Project",
  "Lab",
  "Practical",
];

const gradeValues = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D",
  "F",
];

export default function AdminGrades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedExamType, setSelectedExamType] = useState<string>("");
  const [selectedPublishedStatus, setSelectedPublishedStatus] =
    useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [showBulkEntry, setShowBulkEntry] = useState(false);
  const [bulkGradeStep, setBulkGradeStep] = useState(1);
  const [selectedClassStudents, setSelectedClassStudents] = useState<Student[]>(
    []
  );

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    subjectId: "",
    teacherId: "",
    examType: "",
    maxMarks: "",
    obtainedMarks: "",
    grade: "",
    remarks: "",
    examDate: "",
  });

  // Bulk entry form state
  const [bulkFormData, setBulkFormData] = useState({
    classId: "",
    subjectId: "",
    teacherId: "",
    examType: "",
    maxMarks: "",
    examDate: "",
  });

  const [studentGrades, setStudentGrades] = useState<{
    [key: string]: {
      obtainedMarks: string;
      remarks: string;
    };
  }>({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchGrades();
  }, [
    currentPage,
    searchTerm,
    selectedClass,
    selectedSubject,
    selectedExamType,
    selectedPublishedStatus,
  ]);

  const fetchData = async () => {
    try {
      const [studentsRes, subjectsRes, teachersRes, classesRes] =
        await Promise.all([
          fetch("/api/students"),
          fetch("/api/subjects"),
          fetch("/api/teachers"),
          fetch("/api/classes"),
        ]);

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(studentsData.students || []);
      }

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.subjects || []);
      }

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData.teachers || []);
      }

      if (classesRes.ok) {
        const classesData = await classesRes.json();
        setClasses(classesData.classes || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedClass &&
          selectedClass !== "all" && { classId: selectedClass }),
        ...(selectedSubject &&
          selectedSubject !== "all" && { subjectId: selectedSubject }),
        ...(selectedExamType &&
          selectedExamType !== "all" && { examType: selectedExamType }),
        ...(selectedPublishedStatus &&
          selectedPublishedStatus !== "all" && {
            published: selectedPublishedStatus,
          }),
      });

      const response = await fetch(`/api/grades?${params}`);
      const data = await response.json();

      if (response.ok) {
        setGrades(data.grades);
        if (data.pagination) {
          setTotalPages(data.pagination.pages);
        }
      } else {
        toast.error(data.error || "Failed to fetch grades");
      }
    } catch (error) {
      toast.error("Failed to fetch grades");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = {
        ...formData,
        maxMarks: parseInt(formData.maxMarks),
        obtainedMarks: parseInt(formData.obtainedMarks),
      };

      const url = editingGrade
        ? `/api/grades/${editingGrade.id}`
        : "/api/grades";
      const method = editingGrade ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setIsDialogOpen(false);
        resetForm();
        fetchGrades();
      } else {
        toast.error(
          data.error || `Failed to ${editingGrade ? "update" : "create"} grade`
        );
      }
    } catch (error) {
      toast.error(`Failed to ${editingGrade ? "update" : "create"} grade`);
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormData({
      studentId: grade.student.id,
      subjectId: grade.subject.id,
      teacherId: grade.teacher.id,
      examType: grade.examType,
      maxMarks: grade.maxMarks.toString(),
      obtainedMarks: grade.obtainedMarks.toString(),
      grade: grade.grade,
      remarks: grade.remarks || "",
      examDate: grade.examDate.split("T")[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (grade: Grade) => {
    if (!confirm(`Are you sure you want to delete this grade record?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/grades/${grade.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchGrades();
      } else {
        toast.error(data.error || "Failed to delete grade");
      }
    } catch (error) {
      toast.error("Failed to delete grade");
    }
  };

  const handlePublishToggle = async (grade: Grade) => {
    const action = grade.published !== false ? "unpublish" : "publish";

    if (
      !confirm(
        `Are you sure you want to ${action} this grade? ${
          grade.published !== false
            ? "Students will no longer be able to see it."
            : "Students will be able to see it."
        }`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/grades/${grade.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: grade.published === false }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        fetchGrades();
      } else {
        toast.error(data.error || `Failed to ${action} grade`);
      }
    } catch (error) {
      toast.error(`Failed to ${action} grade`);
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: "",
      subjectId: "",
      teacherId: "",
      examType: "",
      maxMarks: "",
      obtainedMarks: "",
      grade: "",
      remarks: "",
      examDate: "",
    });
    setEditingGrade(null);
  };

  const resetBulkForm = () => {
    setBulkFormData({
      classId: "",
      subjectId: "",
      teacherId: "",
      examType: "",
      maxMarks: "",
      examDate: "",
    });
    setStudentGrades({});
    setBulkGradeStep(1);
    setSelectedClassStudents([]);
  };

  const handleBulkFormNext = async () => {
    if (
      !bulkFormData.classId ||
      !bulkFormData.subjectId ||
      !bulkFormData.examType ||
      !bulkFormData.examDate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Fetch students for selected class
      const response = await fetch(
        `/api/students?classId=${bulkFormData.classId}&limit=100`
      );
      const data = await response.json();

      if (response.ok) {
        setSelectedClassStudents(data.students || []);
        setBulkGradeStep(2);

        // Initialize student grades object
        const initialGrades: {
          [key: string]: { obtainedMarks: string; remarks: string };
        } = {};
        (data.students || []).forEach((student: any) => {
          const studentId = student.user?.id || student.id;
          initialGrades[studentId] = { obtainedMarks: "", remarks: "" };
        });
        setStudentGrades(initialGrades);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      toast.error("Failed to fetch students");
    }
  };

  const handleBulkSubmit = async () => {
    try {
      // Validate that at least one student has marks entered
      const validEntries = Object.entries(studentGrades).filter(
        ([_, data]) => data.obtainedMarks && !isNaN(Number(data.obtainedMarks))
      );

      if (validEntries.length === 0) {
        toast.error("Please enter marks for at least one student");
        return;
      }

      // Calculate max marks based on highest obtained marks if not specified
      let maxMarks = bulkFormData.maxMarks
        ? parseInt(bulkFormData.maxMarks)
        : 0;
      if (!maxMarks) {
        const allMarks = validEntries.map(([_, data]) =>
          parseInt(data.obtainedMarks)
        );
        maxMarks = Math.max(...allMarks);
      }

      // Prepare bulk grade data
      const grades = validEntries.map(([userId, data]) => {
        // Find the student profile ID from the user ID
        const student = selectedClassStudents.find(
          (s) => (s.user?.id || s.id) === userId
        );
        const studentProfileId = student?.id || student?.user?.id;

        // Find the teacher profile ID if teacher is selected
        const selectedTeacher = teachers.find(
          (t) => (t.user?.id || t.id) === bulkFormData.teacherId
        );
        const teacherProfileId = selectedTeacher?.id;

        const obtainedMarks = parseInt(data.obtainedMarks);
        const percentage = (obtainedMarks / maxMarks) * 100;
        let grade = "F";

        // Auto-calculate grade based on percentage
        if (percentage >= 95) grade = "A+";
        else if (percentage >= 90) grade = "A";
        else if (percentage >= 85) grade = "A-";
        else if (percentage >= 80) grade = "B+";
        else if (percentage >= 75) grade = "B";
        else if (percentage >= 70) grade = "B-";
        else if (percentage >= 65) grade = "C+";
        else if (percentage >= 60) grade = "C";
        else if (percentage >= 55) grade = "C-";
        else if (percentage >= 50) grade = "D";

        return {
          studentId: studentProfileId,
          subjectId: bulkFormData.subjectId,
          teacherId: teacherProfileId,
          examType: bulkFormData.examType,
          maxMarks,
          obtainedMarks,
          grade,
          remarks: data.remarks,
          examDate: bulkFormData.examDate,
        };
      });

      const response = await fetch("/api/grades/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grades }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          `Successfully added grades for ${validEntries.length} students`
        );
        setShowBulkEntry(false);
        resetBulkForm();
        fetchGrades();
      } else {
        toast.error(result.error || "Failed to add grades");
      }
    } catch (error) {
      toast.error("Failed to add grades");
    }
  };

  const updateStudentGrade = (
    studentId: string,
    field: "obtainedMarks" | "remarks",
    value: string
  ) => {
    setStudentGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-100 text-green-800";
      case "A-":
      case "B+":
      case "B":
        return "bg-blue-100 text-blue-800";
      case "B-":
      case "C+":
      case "C":
        return "bg-yellow-100 text-yellow-800";
      case "C-":
      case "D":
        return "bg-orange-100 text-orange-800";
      case "F":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculatePercentage = (obtained: number, max: number) => {
    return ((obtained / max) * 100).toFixed(1);
  };

  const getAverageGrade = () => {
    if (grades.length === 0) return "N/A";
    const total = grades.reduce((sum, grade) => {
      return sum + (grade.obtainedMarks / grade.maxMarks) * 100;
    }, 0);
    return (total / grades.length).toFixed(1) + "%";
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Grade Management
            </h1>
            <p className="text-gray-600">
              Manage student grades, results, and academic performance
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkEntry(true)}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Bulk Entry
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Individual Grade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingGrade ? "Edit Grade" : "Add New Grade"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingGrade
                      ? "Update grade information"
                      : "Enter grade details for student assessment"}
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student *</Label>
                      <Select
                        value={formData.studentId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, studentId: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem
                              key={student.user?.id || student.id}
                              value={student.user?.id || student.id}
                            >
                              {student.rollNo || student.rollNumber} -{" "}
                              {student.user?.name ||
                                `${student.firstName || ""} ${
                                  student.lastName || ""
                                }`.trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subjectId">Subject *</Label>
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
                              {subject.code} - {subject.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="teacherId">Teacher *</Label>
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
                          {teachers.map((teacher) => (
                            <SelectItem
                              key={teacher.user?.id || teacher.id}
                              value={teacher.user?.id || teacher.id}
                            >
                              {teacher.user?.name ||
                                `${teacher.firstName || ""} ${
                                  teacher.lastName || ""
                                }`.trim()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="examType">Exam Type *</Label>
                      <Select
                        value={formData.examType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, examType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select exam type" />
                        </SelectTrigger>
                        <SelectContent>
                          {examTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxMarks">Max Marks *</Label>
                      <Input
                        id="maxMarks"
                        type="number"
                        min="1"
                        placeholder="e.g., 100"
                        value={formData.maxMarks}
                        onChange={(e) =>
                          setFormData({ ...formData, maxMarks: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="obtainedMarks">Obtained Marks *</Label>
                      <Input
                        id="obtainedMarks"
                        type="number"
                        min="0"
                        placeholder="e.g., 85"
                        value={formData.obtainedMarks}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            obtainedMarks: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select
                        value={formData.grade}
                        onValueChange={(value) =>
                          setFormData({ ...formData, grade: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-calculated" />
                        </SelectTrigger>
                        <SelectContent>
                          {gradeValues.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examDate">Exam Date *</Label>
                    <Input
                      id="examDate"
                      type="date"
                      value={formData.examDate}
                      onChange={(e) =>
                        setFormData({ ...formData, examDate: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      placeholder="Additional comments or feedback"
                      value={formData.remarks}
                      onChange={(e) =>
                        setFormData({ ...formData, remarks: e.target.value })
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
                      {editingGrade ? "Update Grade" : "Create Grade"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bulk Entry Dialog */}
        {showBulkEntry && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {bulkGradeStep === 1
                      ? "Select Class & Exam Details"
                      : "Enter Student Grades"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBulkEntry(false);
                      resetBulkForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {bulkGradeStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Class *</Label>
                        <select
                          value={bulkFormData.classId}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              classId: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Class</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name} - {cls.section}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Subject *</Label>
                        <select
                          value={bulkFormData.subjectId}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              subjectId: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Teacher</Label>
                        <select
                          value={bulkFormData.teacherId}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              teacherId: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Teacher</option>
                          {teachers.map((teacher) => (
                            <option
                              key={teacher.user?.id || teacher.id}
                              value={teacher.user?.id || teacher.id}
                            >
                              {teacher.user?.name ||
                                `${teacher.firstName || ""} ${
                                  teacher.lastName || ""
                                }`.trim()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Exam Type *</Label>
                        <select
                          value={bulkFormData.examType}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              examType: e.target.value,
                            })
                          }
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">Select Exam Type</option>
                          {examTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Maximum Marks</Label>
                        <Input
                          type="number"
                          placeholder="Leave empty for auto-calculation"
                          value={bulkFormData.maxMarks}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              maxMarks: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Exam Date *</Label>
                        <Input
                          type="date"
                          value={bulkFormData.examDate}
                          onChange={(e) =>
                            setBulkFormData({
                              ...bulkFormData,
                              examDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowBulkEntry(false);
                          resetBulkForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleBulkFormNext}>
                        Next: Select Students
                      </Button>
                    </div>
                  </div>
                )}

                {bulkGradeStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Exam Details</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Class:</span>
                          <span className="ml-2 font-medium">
                            {(() => {
                              const selectedClass = classes.find(
                                (c) => c.id === bulkFormData.classId
                              );
                              return selectedClass
                                ? `${selectedClass.name} - ${selectedClass.section}`
                                : "";
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Subject:</span>
                          <span className="ml-2 font-medium">
                            {
                              subjects.find(
                                (s) => s.id === bulkFormData.subjectId
                              )?.name
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Exam Type:</span>
                          <span className="ml-2 font-medium">
                            {bulkFormData.examType}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <span className="ml-2 font-medium">
                            {bulkFormData.examDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-medium">
                        Student Grades ({selectedClassStudents.length} students)
                      </h3>
                      <div className="max-h-96 overflow-y-auto border rounded-lg">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b sticky top-0">
                            <tr>
                              <th className="text-left p-3 font-medium">
                                Student
                              </th>
                              <th className="text-left p-3 font-medium">
                                Roll Number
                              </th>
                              <th className="text-left p-3 font-medium">
                                Obtained Marks
                              </th>
                              <th className="text-left p-3 font-medium">
                                Remarks
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedClassStudents.map((student) => (
                              <tr
                                key={student.user?.id || student.id}
                                className="border-b"
                              >
                                <td className="p-3">
                                  {student.user?.name ||
                                    `${student.firstName || ""} ${
                                      student.lastName || ""
                                    }`.trim()}
                                </td>
                                <td className="p-3">
                                  {student.rollNo || student.rollNumber}
                                </td>
                                <td className="p-3">
                                  <Input
                                    type="number"
                                    placeholder="Enter marks"
                                    value={
                                      studentGrades[
                                        student.user?.id || student.id
                                      ]?.obtainedMarks || ""
                                    }
                                    onChange={(e) =>
                                      updateStudentGrade(
                                        student.user?.id || student.id,
                                        "obtainedMarks",
                                        e.target.value
                                      )
                                    }
                                    className="w-24"
                                  />
                                </td>
                                <td className="p-3">
                                  <Input
                                    placeholder="Optional remarks"
                                    value={
                                      studentGrades[
                                        student.user?.id || student.id
                                      ]?.remarks || ""
                                    }
                                    onChange={(e) =>
                                      updateStudentGrade(
                                        student.user?.id || student.id,
                                        "remarks",
                                        e.target.value
                                      )
                                    }
                                    className="w-full"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setBulkGradeStep(1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowBulkEntry(false);
                            resetBulkForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleBulkSubmit}>
                          Save All Grades
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Grades
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{grades.length}</div>
              <p className="text-xs text-gray-500">Records found</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageGrade()}</div>
              <p className="text-xs text-gray-500">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">A Grades</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {grades.filter((g) => g.grade.startsWith("A")).length}
              </div>
              <p className="text-xs text-gray-500">Excellent performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {grades.filter((g) => g.published !== false).length}
              </div>
              <p className="text-xs text-gray-500">Visible to students</p>
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
                    placeholder="Search by student name, subject, or grade..."
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
                value={selectedClass}
                onValueChange={(value) => {
                  setSelectedClass(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
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
                onValueChange={(value) => {
                  setSelectedSubject(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedExamType}
                onValueChange={(value) => {
                  setSelectedExamType(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by exam type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exam Types</SelectItem>
                  {examTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedPublishedStatus}
                onValueChange={(value) => {
                  setSelectedPublishedStatus(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Unpublished</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grades Table */}
        <Card>
          <CardHeader>
            <CardTitle>Grades & Results</CardTitle>
            <CardDescription>
              {grades.length} grade records found
            </CardDescription>
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
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Exam Type</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {grade.student.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {grade.student.rollNo}
                              {grade.student.class && (
                                <span className="ml-1">
                                  • {grade.student.class.name} -{" "}
                                  {grade.student.class.section}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {grade.subject.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {grade.subject.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{grade.examType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {grade.obtainedMarks}/{grade.maxMarks}
                            </div>
                            <div className="text-sm text-gray-500">
                              {calculatePercentage(
                                grade.obtainedMarks,
                                grade.maxMarks
                              )}
                              %
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getGradeBadgeColor(grade.grade)}>
                            {grade.grade}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {grade.published !== false ? (
                              <Badge className="bg-green-100 text-green-800">
                                <Eye className="h-3 w-3 mr-1" />
                                Published
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Draft
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {grade.teacher.user.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(grade.examDate).toLocaleDateString()}
                          </div>
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
                                onClick={() => handleEdit(grade)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handlePublishToggle(grade)}
                                className={
                                  grade.published !== false
                                    ? "text-orange-600"
                                    : "text-green-600"
                                }
                              >
                                {grade.published !== false ? (
                                  <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(grade)}
                                className="text-red-600"
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
