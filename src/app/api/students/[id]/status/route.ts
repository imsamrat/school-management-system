import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
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

    // Check if user has admin or staff role
    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return NextResponse.json(
        { error: "Admin or staff access required" },
        { status: 403 }
      );
    }

    const { isActive } = await request.json();

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    // Find the student
    const student = await prisma.studentProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Update the user's isActive status
    await prisma.user.update({
      where: { id: student.userId },
      data: { isActive },
    });

    const action = isActive ? "activated" : "deactivated";
    return NextResponse.json({
      message: `Student ${action} successfully`,
      student: {
        ...student,
        user: {
          ...student.user,
          isActive,
        },
      },
    });
  } catch (error) {
    console.error("Error updating student status:", error);
    return NextResponse.json(
      { error: "Failed to update student status" },
      { status: 500 }
    );
  }
}
