import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schema
const assignTeacherSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  teacherId: z.string().min(1, "Teacher ID is required"),
});

const removeTeacherSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
});

// POST: Assign teacher to class
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { classId, teacherId } = assignTeacherSchema.parse(body);

    // Verify teacher exists
    const teacher = await db.teacherProfile.findUnique({
      where: { id: teacherId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Verify class exists
    const classData = await db.class.findUnique({
      where: { id: classId },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Update class with teacher assignment
    const updatedClass = await db.class.update({
      where: { id: classId },
      data: { teacherId },
      include: {
        teacher: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Teacher ${teacher.user.name} assigned to class ${classData.name}-${classData.section} successfully`,
      class: updatedClass,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error assigning teacher:", error);
    return NextResponse.json(
      { error: "Failed to assign teacher" },
      { status: 500 }
    );
  }
}

// DELETE: Remove teacher from class
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      );
    }

    // Remove teacher assignment
    const updatedClass = await db.class.update({
      where: { id: classId },
      data: { teacherId: null },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Teacher removed from class successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error("Error removing teacher:", error);
    return NextResponse.json(
      { error: "Failed to remove teacher" },
      { status: 500 }
    );
  }
}
