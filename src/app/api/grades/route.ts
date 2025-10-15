import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const gradeSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  subjectId: z.string().min(1, "Subject is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  examType: z.string().min(1, "Exam type is required"),
  maxMarks: z.number().min(1, "Max marks must be at least 1"),
  obtainedMarks: z.number().min(0, "Obtained marks cannot be negative"),
  grade: z.string().optional(),
  remarks: z.string().optional(),
  examDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid exam date",
  }),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const examType = searchParams.get("examType");
    const published = searchParams.get("published");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        {
          student: {
            user: {
              name: {
                contains: search,
              },
            },
          },
        },
        {
          student: {
            rollNo: {
              contains: search,
            },
          },
        },
        {
          subject: {
            name: {
              contains: search,
            },
          },
        },
        { examType: { contains: search } },
        { grade: { contains: search } },
      ];
    }

    if (classId && classId !== "all") {
      where.student = {
        ...where.student,
        classId: classId,
      };
    }

    if (subjectId && subjectId !== "all") {
      where.subjectId = subjectId;
    }

    if (examType && examType !== "all") {
      where.examType = examType;
    }

    if (published && published !== "all") {
      const publishedBool = published === "true";
      if (publishedBool) {
        where.remarks = {
          contains: "[PUBLISHED]",
        };
      } else {
        where.OR = [{ remarks: { contains: "[DRAFT]" } }, { remarks: null }];
      }
    }

    const [gradesFromDB, total] = await Promise.all([
      db.grade.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              rollNo: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              class: {
                select: {
                  id: true,
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
            select: {
              id: true,
              user: {
                select: {
                  id: true,
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
      db.grade.count({ where }),
    ]);

    // Add published status based on remarks field (temporary solution)
    const grades = gradesFromDB.map((grade) => ({
      ...grade,
      published: grade.remarks?.includes("[PUBLISHED]")
        ? true
        : grade.remarks?.includes("[DRAFT]")
        ? false
        : true, // Default to published for existing records
    }));

    return NextResponse.json({
      grades,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = gradeSchema.parse(body);

    // Verify student exists
    const student = await db.studentProfile.findUnique({
      where: { id: validatedData.studentId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 400 });
    }

    // Verify subject exists
    const subject = await db.subject.findUnique({
      where: { id: validatedData.subjectId },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 400 });
    }

    // Verify teacher exists
    const teacher = await db.teacherProfile.findUnique({
      where: { id: validatedData.teacherId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 400 });
    }

    // Calculate grade if not provided
    let calculatedGrade = validatedData.grade;
    if (!calculatedGrade) {
      const percentage =
        (validatedData.obtainedMarks / validatedData.maxMarks) * 100;
      if (percentage >= 90) calculatedGrade = "A+";
      else if (percentage >= 80) calculatedGrade = "A";
      else if (percentage >= 70) calculatedGrade = "B";
      else if (percentage >= 60) calculatedGrade = "C";
      else if (percentage >= 50) calculatedGrade = "D";
      else calculatedGrade = "F";
    }

    const grade = await db.grade.create({
      data: {
        studentId: validatedData.studentId,
        subjectId: validatedData.subjectId,
        teacherId: validatedData.teacherId,
        examType: validatedData.examType,
        maxMarks: validatedData.maxMarks,
        obtainedMarks: validatedData.obtainedMarks,
        grade: calculatedGrade,
        remarks: validatedData.remarks,
        examDate: new Date(validatedData.examDate),
      },
      include: {
        student: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        teacher: {
          select: {
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

    return NextResponse.json(
      {
        message: "Grade created successfully",
        grade,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating grade:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create grade" },
      { status: 500 }
    );
  }
}
