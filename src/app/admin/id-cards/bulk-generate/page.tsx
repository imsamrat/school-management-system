import { Suspense } from "react";
import { db } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Download,
  Users,
  GraduationCap,
  FileText,
} from "lucide-react";
import Link from "next/link";

async function getClasses() {
  try {
    const classes = await db.class.findMany({
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: { name: "asc" },
    });
    return classes;
  } catch (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
}

async function getStats() {
  try {
    const [studentCount, teacherCount] = await Promise.all([
      db.studentProfile.count(),
      db.teacherProfile.count(),
    ]);
    return { studentCount, teacherCount };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { studentCount: 0, teacherCount: 0 };
  }
}

export default async function BulkGeneratePage() {
  const [classes, stats] = await Promise.all([getClasses(), getStats()]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/id-cards">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Bulk ID Card Generation</h1>
          <p className="text-muted-foreground">
            Generate ID cards for multiple students and teachers at once
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Bulk Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Student ID Cards
            </CardTitle>
            <CardDescription>
              Generate ID cards for students by class or all at once
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Total Students</span>
              </div>
              <Badge variant="secondary">{stats.studentCount}</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="all-students" />
                <label htmlFor="all-students" className="text-sm font-medium">
                  Select all students ({stats.studentCount})
                </label>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Or select by class:
                </label>
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between space-x-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`class-${classItem.id}`} />
                      <label
                        htmlFor={`class-${classItem.id}`}
                        className="text-sm"
                      >
                        {classItem.name}
                      </label>
                    </div>
                    <Badge variant="outline">
                      {classItem._count.students} students
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Student ID Cards
            </Button>
          </CardContent>
        </Card>

        {/* Teacher Bulk Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-green-500" />
              Teacher ID Cards
            </CardTitle>
            <CardDescription>
              Generate ID cards for all faculty members
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">Total Teachers</span>
              </div>
              <Badge variant="secondary">{stats.teacherCount}</Badge>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="all-teachers" />
                <label htmlFor="all-teachers" className="text-sm font-medium">
                  Select all teachers ({stats.teacherCount})
                </label>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Filter by department:
                </label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="social-studies">
                      Social Studies
                    </SelectItem>
                    <SelectItem value="physical-education">
                      Physical Education
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Generate Teacher ID Cards
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Options
          </CardTitle>
          <CardDescription>
            Choose how you want to export the generated ID cards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="pdf-export" defaultChecked />
              <label htmlFor="pdf-export" className="text-sm font-medium">
                Export as PDF
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="print-ready" />
              <label htmlFor="print-ready" className="text-sm font-medium">
                Print-ready format
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="separate-files" />
              <label htmlFor="separate-files" className="text-sm font-medium">
                Separate files per person
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Generations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Generations</CardTitle>
          <CardDescription>
            View recently generated ID card batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent generations found.</p>
            <p className="text-sm">Generated ID cards will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
