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
  ClipboardCheck,
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

export default function TeacherGrades() {
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
  ]);

  const fetchData = async () => {
    try {
      const [studentsRes, subjectsRes, teachersRes, classesRes] =
        await Promise.all([
          fetch("/api/teacher/students"),
          fetch("/api/subjects"),
          fetch("/api/teachers"),
          fetch("/api/teacher/classes"),
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
      });

      const response = await fetch(`/api/teacher/grades?${params}`);
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
        studentId: formData.studentId,
        subjectId: formData.subjectId,
        examType: formData.examType,
        maxMarks: parseInt(formData.maxMarks),
        obtainedMarks: parseInt(formData.obtainedMarks),
        grade: formData.grade,
        remarks: formData.remarks,
        examDate: formData.examDate,
      };

      console.log("Submitting grade with data:", submitData);
      console.log(
        "Available students:",
        students.map((s) => ({ id: s.id, name: s.user?.name }))
      );

      const url = editingGrade
        ? `/api/teacher/grades/${editingGrade.id}`
        : "/api/teacher/grades";
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
      studentId: grade.student.id, // Use student profile ID, not user ID
      subjectId: grade.subject.id,
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
      const response = await fetch(`/api/teacher/grades/${grade.id}`, {
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

  const resetForm = () => {
    setFormData({
      studentId: "",
      subjectId: "",
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
        `/api/teacher/students?classId=${bulkFormData.classId}&limit=100`
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
          const studentId = student.id; // Use student profile ID
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
      const grades = validEntries.map(([studentId, data]) => {
        // studentId is already the student profile ID
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
          studentId: studentId,
          subjectId: bulkFormData.subjectId,
          examType: bulkFormData.examType,
          maxMarks,
          obtainedMarks,
          grade,
          remarks: data.remarks,
          examDate: bulkFormData.examDate,
        };
      });

      const response = await fetch("/api/teacher/grades/bulk", {
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
    <DashboardLayout role="teacher">
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
                            <SelectItem key={student.id} value={student.id}>
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
                              {subject.name} ({subject.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(grades.map((g) => g.student.id)).size}
              </div>
              <p className="text-xs text-gray-500">With grades</p>
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
                      <TableHead>Teacher</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[70px]">Actions</TableHead>
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

        {/* Bulk Entry Dialog */}
        <Dialog open={showBulkEntry} onOpenChange={setShowBulkEntry}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Bulk Grade Entry
                {bulkGradeStep === 1 && " - Step 1: Select Parameters"}
                {bulkGradeStep === 2 && " - Step 2: Enter Marks"}
              </DialogTitle>
              <DialogDescription>
                {bulkGradeStep === 1
                  ? "First select the class, subject, exam type, and exam date. Then proceed to enter marks for all students."
                  : "Enter obtained marks and remarks for each student. Grades will be calculated automatically."}
              </DialogDescription>
            </DialogHeader>

            {bulkGradeStep === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkClassId">Class *</Label>
                    <Select
                      value={bulkFormData.classId}
                      onValueChange={(value) =>
                        setBulkFormData({ ...bulkFormData, classId: value })
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

                  <div className="space-y-2">
                    <Label htmlFor="bulkSubjectId">Subject *</Label>
                    <Select
                      value={bulkFormData.subjectId}
                      onValueChange={(value) =>
                        setBulkFormData({ ...bulkFormData, subjectId: value })
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulkExamType">Exam Type *</Label>
                    <Select
                      value={bulkFormData.examType}
                      onValueChange={(value) =>
                        setBulkFormData({ ...bulkFormData, examType: value })
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

                  <div className="space-y-2">
                    <Label htmlFor="bulkExamDate">Exam Date *</Label>
                    <Input
                      id="bulkExamDate"
                      type="date"
                      value={bulkFormData.examDate}
                      onChange={(e) =>
                        setBulkFormData({
                          ...bulkFormData,
                          examDate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulkMaxMarks">Max Marks</Label>
                  <Input
                    id="bulkMaxMarks"
                    type="number"
                    min="1"
                    placeholder="e.g., 100 (optional - will auto-calculate)"
                    value={bulkFormData.maxMarks}
                    onChange={(e) =>
                      setBulkFormData({
                        ...bulkFormData,
                        maxMarks: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowBulkEntry(false);
                      resetBulkForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleBulkFormNext}>
                    Next: Enter Marks
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setBulkGradeStep(1)}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Parameters
                  </Button>
                  <div className="text-sm text-gray-600">
                    {selectedClassStudents.length} students found
                  </div>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Obtained Marks *</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClassStudents.map((student) => {
                        const studentId = student.id; // Use student profile ID
                        return (
                          <TableRow key={studentId}>
                            <TableCell>
                              <div className="font-medium">
                                {student.user?.name ||
                                  `${student.firstName || ""} ${
                                    student.lastName || ""
                                  }`.trim()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {student.rollNo || student.rollNumber || "N/A"}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                placeholder="Enter marks"
                                value={
                                  studentGrades[studentId]?.obtainedMarks || ""
                                }
                                onChange={(e) =>
                                  updateStudentGrade(
                                    studentId,
                                    "obtainedMarks",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Optional remarks"
                                value={studentGrades[studentId]?.remarks || ""}
                                onChange={(e) =>
                                  updateStudentGrade(
                                    studentId,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowBulkEntry(false);
                      resetBulkForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleBulkSubmit}
                    className="flex items-center gap-2"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    Submit All Grades
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
