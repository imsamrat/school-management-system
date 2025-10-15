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
import { Input } from "@/components/ui/input";
import StudentIDCard from "@/components/id-cards/student-id-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Download, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getStudents() {
  try {
    const students = await db.studentProfile.findMany({
      include: {
        user: true,
        class: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}

export default async function StudentIDCardsPage() {
  const students = await getStudents();

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
          <h1 className="text-3xl font-bold">Student ID Cards</h1>
          <p className="text-muted-foreground">
            Generate and manage ID cards for students
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search students..." className="pl-10 w-64" />
          </div>
          <Badge variant="secondary">{students.length} Students</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
          <Button>
            <Printer className="h-4 w-4 mr-2" />
            Print All
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {students.map((student) => (
          <Card key={student.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={student.profileImage || undefined} />
                    <AvatarFallback>
                      {student.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {student.user.name}
                    </CardTitle>
                    <CardDescription>
                      Student ID: {student.studentId} | Class:{" "}
                      {student.class?.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <div className="transform scale-75 origin-center">
                  <StudentIDCard student={student} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {students.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-muted-foreground text-center">
                <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                <p>There are no students enrolled yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/students/new">Add First Student</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
