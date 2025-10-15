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
import { TrendingUp, Award, BookOpen, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Grade {
  id: string;
  subject: string;
  subjectCode: string;
  examType: string;
  obtainedMarks: number;
  maxMarks: number;
  percentage: number;
  grade: string;
  date: string;
}

interface SubjectAverage {
  subject: string;
  subjectCode: string;
  averageMarks: number;
  averagePercentage: number;
  totalGrades: number;
  grade: string;
}

interface GradeStats {
  totalGrades: number;
  averagePercentage: number;
  highestPercentage: number;
  lowestPercentage: number;
  averageGrade: string;
}

interface GradesData {
  grades: Grade[];
  subjectAverages: SubjectAverage[];
  stats: GradeStats;
}

export default function StudentGradesPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [gradesData, setGradesData] = useState<GradesData | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchGradesData();
    }
  }, [status]);

  const fetchGradesData = async () => {
    try {
      setLoading(true);
      // Add cache-busting query parameter
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/student/grades?_=${timestamp}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch grades data");
      }

      const data = await response.json();
      console.log("Fetched grades data:", data);
      setGradesData(data);
    } catch (error) {
      console.error("Error fetching grades data:", error);
      toast.error("Failed to load grades");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-green-600 bg-green-50";
    if (grade.startsWith("B")) return "text-blue-600 bg-blue-50";
    if (grade.startsWith("C")) return "text-yellow-600 bg-yellow-50";
    if (grade.startsWith("D")) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
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

  if (!gradesData || gradesData.grades.length === 0) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
            <p className="text-gray-600">View your academic performance</p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No grades have been published yet
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Grades</h1>
            <p className="text-gray-600">
              View your academic performance and statistics
            </p>
          </div>
          <Button
            onClick={fetchGradesData}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Grades
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gradesData.stats.totalGrades}
              </div>
              <p className="text-xs text-gray-500">Published grades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gradesData.stats.averagePercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">Overall average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Highest Score
              </CardTitle>
              <Award className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gradesData.stats.highestPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-gray-500">Best performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Grade
              </CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {gradesData.stats.averageGrade}
              </div>
              <p className="text-xs text-gray-500">Letter grade</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Performance</CardTitle>
            <CardDescription>
              Your average performance in each subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gradesData.subjectAverages.map((subject) => (
                <div
                  key={subject.subject}
                  className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{subject.subject}</h3>
                      <p className="text-xs text-gray-500">
                        {subject.subjectCode}
                      </p>
                    </div>
                    <Badge className={getGradeColor(subject.grade)}>
                      {subject.grade}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-semibold">
                        {subject.averagePercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${subject.averagePercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {subject.totalGrades}{" "}
                      {subject.totalGrades === 1 ? "grade" : "grades"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Grades */}
        <Card>
          <CardHeader>
            <CardTitle>All Grades</CardTitle>
            <CardDescription>
              Complete list of your published grades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Subject
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Exam Type
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      Marks
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      Percentage
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">
                      Grade
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gradesData.grades.map((grade) => (
                    <tr key={grade.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{grade.subject}</p>
                          <p className="text-xs text-gray-500">
                            {grade.subjectCode}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{grade.examType}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold">
                          {grade.obtainedMarks}/{grade.maxMarks}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold">
                          {grade.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getGradeColor(grade.grade)}>
                          {grade.grade}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(grade.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
