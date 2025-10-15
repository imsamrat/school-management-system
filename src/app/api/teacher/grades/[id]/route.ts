import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const GradeUpdateSchema = z.object({
  studentId: z.string().min(1, "Student is required").optional(),
  subjectId: z.string().min(1, "Subject is required").optional(),
  examType: z.string().min(1, "Exam type is required").optional(),
  maxMarks: z.number().min(1, "Max marks must be at least 1").optional(),
  obtainedMarks: z
    .number()
    .min(0, "Obtained marks cannot be negative")
    .optional(),
  examDate: z.string().min(1, "Exam date is required").optional(),
  grade: z.string().optional(),
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = GradeUpdateSchema.parse(body);

    // Check if grade exists and belongs to the teacher
    const existingGrade = await prisma.grade.findUnique({
      where: { id: params.id },
      include: {
        teacher: true,
      },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // For teachers, verify ownership
    if (session.user.role === "TEACHER") {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (teacherProfile?.id !== existingGrade.teacherId) {
        return NextResponse.json(
          { error: "You can only edit your own grades" },
          { status: 403 }
        );
      }
    }

    // Calculate new grade if marks are updated
    let updatedGrade = validatedData.grade;
    if (validatedData.maxMarks && validatedData.obtainedMarks) {
      const percentage =
        (validatedData.obtainedMarks / validatedData.maxMarks) * 100;
      updatedGrade = updatedGrade || calculateGrade(percentage);
    } else if (validatedData.maxMarks || validatedData.obtainedMarks) {
      // If only one is updated, recalculate with the existing value
      const maxMarks = validatedData.maxMarks || existingGrade.maxMarks;
      const obtainedMarks =
        validatedData.obtainedMarks || existingGrade.obtainedMarks;
      const percentage = (obtainedMarks / maxMarks) * 100;
      updatedGrade = updatedGrade || calculateGrade(percentage);
    }

    // Update the grade record
    const updateData: any = {};

    if (validatedData.studentId) updateData.studentId = validatedData.studentId;
    if (validatedData.subjectId) updateData.subjectId = validatedData.subjectId;
    if (validatedData.examType) updateData.examType = validatedData.examType;
    if (validatedData.maxMarks !== undefined)
      updateData.maxMarks = validatedData.maxMarks;
    if (validatedData.obtainedMarks !== undefined)
      updateData.obtainedMarks = validatedData.obtainedMarks;
    if (validatedData.examDate)
      updateData.examDate = new Date(validatedData.examDate);
    if (updatedGrade) updateData.grade = updatedGrade;
    if (validatedData.remarks !== undefined)
      updateData.remarks = validatedData.remarks;

    const updated = await prisma.grade.update({
      where: { id: params.id },
      data: updateData,
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
      message: "Grade updated successfully",
      grade: updated,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.issues);
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating grade:", error);
    console.error("Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return NextResponse.json(
      {
        error: "Failed to update grade",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if grade exists and belongs to the teacher
    const existingGrade = await prisma.grade.findUnique({
      where: { id: params.id },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // For teachers, verify ownership
    if (session.user.role === "TEACHER") {
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (teacherProfile?.id !== existingGrade.teacherId) {
        return NextResponse.json(
          { error: "You can only delete your own grades" },
          { status: 403 }
        );
      }
    }

    // Delete the grade record
    await prisma.grade.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Grade deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting grade:", error);
    console.error("Error details:", {
      message: (error as Error).message,
      stack: (error as Error).stack,
    });
    return NextResponse.json(
      {
        error: "Failed to delete grade",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
