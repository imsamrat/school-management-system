import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a teacher
    if (session.user.role !== "TEACHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the teacher's profile
    const teacher = await db.teacherProfile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const { grades } = await request.json();

    if (!grades || !Array.isArray(grades)) {
      return NextResponse.json(
        { error: "Invalid grades data" },
        { status: 400 }
      );
    }

    // Validate each grade entry
    for (const grade of grades) {
      if (
        !grade.studentId ||
        !grade.subjectId ||
        !grade.examType ||
        !grade.examDate
      ) {
        return NextResponse.json(
          {
            error: "Missing required fields in grade entry",
          },
          { status: 400 }
        );
      }

      if (
        typeof grade.maxMarks !== "number" ||
        typeof grade.obtainedMarks !== "number"
      ) {
        return NextResponse.json(
          {
            error: "Invalid marks format",
          },
          { status: 400 }
        );
      }

      if (grade.obtainedMarks < 0 || grade.obtainedMarks > grade.maxMarks) {
        return NextResponse.json(
          {
            error: `Invalid marks: ${grade.obtainedMarks}/${grade.maxMarks}`,
          },
          { status: 400 }
        );
      }
    }

    // Create grades in bulk with the logged-in teacher's ID
    const createdGrades = await db.grade.createMany({
      data: grades.map((grade: any) => ({
        studentId: grade.studentId,
        subjectId: grade.subjectId,
        teacherId: teacher.id, // Automatically assign the logged-in teacher
        examType: grade.examType,
        maxMarks: parseInt(grade.maxMarks),
        obtainedMarks: parseInt(grade.obtainedMarks),
        grade: grade.grade,
        remarks: grade.remarks || null,
        examDate: new Date(grade.examDate),
        published: true, // Auto-publish bulk grades
      })),
    });

    return NextResponse.json({
      message: `Successfully created ${createdGrades.count} grades`,
      count: createdGrades.count,
    });
  } catch (error) {
    console.error("Error creating bulk grades:", error);
    return NextResponse.json(
      { error: "Failed to create grades" },
      { status: 500 }
    );
  }
}
