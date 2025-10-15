import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const GradeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  examType: z.string().min(1, "Exam type is required"),
  maxMarks: z.number().min(1, "Max marks must be at least 1"),
  obtainedMarks: z.number().min(0, "Obtained marks cannot be negative"),
  examDate: z.string().min(1, "Exam date is required"),
  remarks: z.string().optional(),
});

// Helper function to calculate grade based on percentage
function calculateGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C+";
  if (percentage >= 40) return "C";
  return "F";
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has teacher or admin role
    if (!["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Teacher access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const studentId = searchParams.get("studentId") || "";
    const subjectId = searchParams.get("subjectId") || "";
    const examType = searchParams.get("examType") || "";

    const skip = (page - 1) * limit;

    // For teachers, only show grades for students in their classes
    let whereCondition: any = {};

    if (session.user.role === "TEACHER") {
      // Get teacher profile
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacherProfile) {
        return NextResponse.json(
          { error: "Teacher profile not found" },
          { status: 404 }
        );
      }

      whereCondition.teacherId = teacherProfile.id;
    }

    // Apply filters
    if (studentId && studentId !== "all") {
      whereCondition.studentId = studentId;
    }

    if (subjectId && subjectId !== "all") {
      whereCondition.subjectId = subjectId;
    }

    if (examType && examType !== "all") {
      whereCondition.examType = examType;
    }

    // Add search condition
    if (search) {
      whereCondition.OR = [
        { student: { user: { name: { contains: search } } } },
        { student: { rollNo: { contains: search } } },
        { subject: { name: { contains: search } } },
        { examType: { contains: search } },
        { grade: { contains: search } },
      ];
    }

    const [grades, totalCount] = await Promise.all([
      prisma.grade.findMany({
        where: whereCondition,
        include: {
          student: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
              class: {
                select: {
                  name: true,
                  section: true,
                },
              },
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: [{ examDate: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.grade.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      grades,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has teacher or admin role
    if (!["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Teacher access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = GradeSchema.parse(body);

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile && session.user.role === "TEACHER") {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Calculate percentage and grade
    const percentage =
      (validatedData.obtainedMarks / validatedData.maxMarks) * 100;
    const grade = calculateGrade(percentage);

    // Create the grade record
    const newGrade = await prisma.grade.create({
      data: {
        ...validatedData,
        teacherId: teacherProfile?.id || "", // Use empty string for admin
        grade,
        examDate: new Date(validatedData.examDate),
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            class: {
              select: {
                name: true,
                section: true,
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Grade created successfully",
      grade: newGrade,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating grade:", error);
    return NextResponse.json(
      { error: "Failed to create grade" },
      { status: 500 }
    );
  }
}
