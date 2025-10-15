import { Suspense } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, GraduationCap, IdCard, Download, Printer } from "lucide-react";

export default function IDCardsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">ID Card Management</h1>
          <p className="text-muted-foreground">
            Generate and manage student and teacher ID cards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/id-cards/bulk-generate">
              <Download className="h-4 w-4 mr-2" />
              Bulk Generate
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Student ID Cards
              </CardTitle>
              <CardDescription>
                Generate and manage ID cards for all students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <IdCard className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">All Students</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate ID cards for all enrolled students
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Active Students</Badge>
                    <Button asChild>
                      <Link href="/admin/id-cards/students">
                        View & Generate
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <GraduationCap className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">By Class</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate ID cards for specific classes
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Class-wise</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/admin/id-cards/students/by-class">
                        Select Class
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Teacher ID Cards
              </CardTitle>
              <CardDescription>
                Generate and manage ID cards for all faculty members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <IdCard className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">All Teachers</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate ID cards for all faculty members
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">Active Faculty</Badge>
                    <Button asChild>
                      <Link href="/admin/id-cards/teachers">
                        View & Generate
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-purple-500" />
                    <div>
                      <h3 className="font-semibold">By Department</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate ID cards for specific departments
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Department-wise</Badge>
                    <Button variant="outline" asChild>
                      <Link href="/admin/id-cards/teachers/by-department">
                        Select Department
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4" asChild>
              <Link
                href="/admin/settings/school"
                className="flex flex-col items-center gap-2"
              >
                <IdCard className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-medium">School Settings</div>
                  <div className="text-sm text-muted-foreground">
                    Configure school information
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link
                href="/admin/id-cards/templates"
                className="flex flex-col items-center gap-2"
              >
                <Printer className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-medium">Card Templates</div>
                  <div className="text-sm text-muted-foreground">
                    Customize ID card designs
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="h-auto p-4" asChild>
              <Link
                href="/admin/id-cards/history"
                className="flex flex-col items-center gap-2"
              >
                <Download className="h-8 w-8" />
                <div className="text-center">
                  <div className="font-medium">Generation History</div>
                  <div className="text-sm text-muted-foreground">
                    View past ID card generations
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
