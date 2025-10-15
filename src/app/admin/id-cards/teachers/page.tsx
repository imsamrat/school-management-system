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
import TeacherIDCard from "@/components/id-cards/teacher-id-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Download, Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

async function getTeachers() {
  try {
    const teachers = await db.teacherProfile.findMany({
      include: {
        user: true,
        subjects: true,
      },
      orderBy: {
        user: {
          name: "asc",
        },
      },
    });
    return teachers;
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
}

export default async function TeacherIDCardsPage() {
  const teachers = await getTeachers();

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
          <h1 className="text-3xl font-bold">Teacher ID Cards</h1>
          <p className="text-muted-foreground">
            Generate and manage ID cards for faculty members
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input placeholder="Search teachers..." className="pl-10 w-64" />
          </div>
          <Badge variant="secondary">{teachers.length} Teachers</Badge>
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
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.profileImage || undefined} />
                    <AvatarFallback>
                      {teacher.user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {teacher.user.name}
                    </CardTitle>
                    <CardDescription>
                      Employee ID: {teacher.employeeId} | Department:{" "}
                      {teacher.department}
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
                  <TeacherIDCard teacher={teacher} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {teachers.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-muted-foreground text-center">
                <h3 className="text-lg font-medium mb-2">No Teachers Found</h3>
                <p>There are no teachers registered yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/admin/teachers/new">Add First Teacher</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
