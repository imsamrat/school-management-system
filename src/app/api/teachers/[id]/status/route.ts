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

    // Find the teacher
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Update the user's isActive status
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { isActive },
    });

    const action = isActive ? "activated" : "deactivated";
    return NextResponse.json({
      message: `Teacher ${action} successfully`,
      teacher: {
        ...teacher,
        user: {
          ...teacher.user,
          isActive,
        },
      },
    });
  } catch (error) {
    console.error("Error updating teacher status:", error);
    return NextResponse.json(
      { error: "Failed to update teacher status" },
      { status: 500 }
    );
  }
}
