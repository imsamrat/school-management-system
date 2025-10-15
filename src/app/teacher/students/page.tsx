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
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Mail, Phone, GraduationCap } from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: string;
  rollNo: string;
  parentName?: string;
  parentPhone?: string;
  address?: string;
  dateOfBirth?: string;
  admissionDate: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
  class?: {
    id: string;
    name: string;
    section: string;
    academicYear: string;
  };
}

interface TeacherClass {
  id: string;
  name: string;
  section: string;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, [currentPage, searchTerm, selectedClass]);

  const fetchStudents = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(selectedClass &&
          selectedClass !== "all" && { classId: selectedClass }),
      });

      const response = await fetch(`/api/teacher/students?${params}`);
      const data = await response.json();

      if (response.ok) {
        setStudents(data.students);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error(data.error || "Failed to fetch students");
      }
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/teacher/classes");
      const data = await response.json();

      if (response.ok) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClassFilter = (value: string) => {
    setSelectedClass(value);
    setCurrentPage(1);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-600">
            View students in your assigned classes
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-gray-500">In your classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Students
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {students.filter((s) => s.user.isActive).length}
              </div>
              <p className="text-xs text-gray-500">Currently enrolled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-gray-500">Under your guidance</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or roll number..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              <Select value={selectedClass} onValueChange={handleClassFilter}>
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
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>{students.length} students found</CardDescription>
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
                      <TableHead>Roll No</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Parent Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Admission Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {getInitials(student.user.name)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{student.user.name}</p>
                              <div className="flex items-center text-sm text-gray-500">
                                <Mail className="h-3 w-3 mr-1" />
                                {student.user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.rollNo}
                        </TableCell>
                        <TableCell>
                          {student.class ? (
                            <div>
                              <p className="font-medium">
                                {student.class.name} - {student.class.section}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.class.academicYear}
                              </p>
                            </div>
                          ) : (
                            "Not Assigned"
                          )}
                        </TableCell>
                        <TableCell>
                          {student.parentName ? (
                            <div>
                              <p className="font-medium">
                                {student.parentName}
                              </p>
                              {student.parentPhone && (
                                <div className="flex items-center text-sm text-gray-500">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {student.parentPhone}
                                </div>
                              )}
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.user.isActive ? "default" : "secondary"
                            }
                          >
                            {student.user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(student.admissionDate).toLocaleDateString()}
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
