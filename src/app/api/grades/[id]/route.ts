import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

interface Params {
  id: string;
}

const gradeUpdateSchema = z.object({
  studentId: z.string().min(1, "Student is required").optional(),
  subjectId: z.string().min(1, "Subject is required").optional(),
  teacherId: z.string().min(1, "Teacher is required").optional(),
  examType: z.string().min(1, "Exam type is required").optional(),
  maxMarks: z.number().min(1, "Max marks must be at least 1").optional(),
  obtainedMarks: z
    .number()
    .min(0, "Obtained marks cannot be negative")
    .optional(),
  grade: z.string().optional(),
  remarks: z.string().optional(),
  examDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid exam date",
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (
      !session ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const grade = await db.grade.findUnique({
      where: { id },
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
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    return NextResponse.json({ grade });
  } catch (error) {
    console.error("Error fetching grade:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (
      !session ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = gradeUpdateSchema.parse(body);

    // Check if grade exists
    const existingGrade = await db.grade.findUnique({
      where: { id },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Calculate grade if marks are updated
    let calculatedGrade = validatedData.grade;
    if (
      validatedData.obtainedMarks !== undefined &&
      validatedData.maxMarks !== undefined &&
      !calculatedGrade
    ) {
      const percentage =
        (validatedData.obtainedMarks / validatedData.maxMarks) * 100;
      if (percentage >= 90) calculatedGrade = "A+";
      else if (percentage >= 80) calculatedGrade = "A";
      else if (percentage >= 70) calculatedGrade = "B";
      else if (percentage >= 60) calculatedGrade = "C";
      else if (percentage >= 50) calculatedGrade = "D";
      else calculatedGrade = "F";
    }

    const updateData: any = {};

    if (validatedData.studentId) updateData.studentId = validatedData.studentId;
    if (validatedData.subjectId) updateData.subjectId = validatedData.subjectId;
    if (validatedData.teacherId) updateData.teacherId = validatedData.teacherId;
    if (validatedData.examType) updateData.examType = validatedData.examType;
    if (validatedData.maxMarks !== undefined)
      updateData.maxMarks = validatedData.maxMarks;
    if (validatedData.obtainedMarks !== undefined)
      updateData.obtainedMarks = validatedData.obtainedMarks;
    if (calculatedGrade) updateData.grade = calculatedGrade;
    if (validatedData.remarks !== undefined)
      updateData.remarks = validatedData.remarks;
    if (validatedData.examDate)
      updateData.examDate = new Date(validatedData.examDate);

    const updatedGrade = await db.grade.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({
      message: "Grade updated successfully",
      grade: updatedGrade,
    });
  } catch (error) {
    console.error("Error updating grade:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const grade = await db.grade.findUnique({
      where: { id },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    await db.grade.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: "Failed to delete grade" },
      { status: 500 }
    );
  }
}
