import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin, staff, or teacher
    if (!["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { published } = await request.json();

    if (typeof published !== "boolean") {
      return NextResponse.json(
        { error: "Published status must be a boolean" },
        { status: 400 }
      );
    }

    // Check if grade exists
    const existingGrade = await db.grade.findUnique({
      where: { id: params.id },
      include: {
        student: {
          include: { user: true },
        },
        subject: true,
        teacher: {
          include: { user: true },
        },
      },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // If teacher, verify they own this grade
    if (session.user.role === "TEACHER") {
      const teacherProfile = await db.teacherProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (teacherProfile?.id !== existingGrade.teacherId) {
        return NextResponse.json(
          { error: "You can only publish/unpublish your own grades" },
          { status: 403 }
        );
      }
    }

    // Update the published field directly in the database
    const updatedGrade = await db.grade.update({
      where: { id: params.id },
      data: {
        published: published,
      },
      include: {
        student: {
          include: { user: true },
        },
        subject: true,
        teacher: {
          include: { user: true },
        },
      },
    });

    const action = published ? "published" : "unpublished";

    console.log(
      `Grade ${params.id} ${action} by ${session.user.role} (${session.user.email})`
    );
    console.log(
      `Student: ${updatedGrade.student.user.name}, Subject: ${updatedGrade.subject.name}`
    );

    return NextResponse.json({
      message: `Grade ${action} successfully. ${
        published
          ? "Students can now see this grade."
          : "Students can no longer see this grade."
      }`,
      grade: updatedGrade,
    });
  } catch (error) {
    console.error("Error updating grade published status:", error);
    return NextResponse.json(
      {
        error: "Failed to update grade status",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
