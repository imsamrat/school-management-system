import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

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

    console.log(`[PUBLISH API] Received request to update grade ${params.id}`);
    console.log(`[PUBLISH API] New published value: ${published}`);

    if (typeof published !== "boolean") {
      console.error(
        `[PUBLISH API] Invalid published value type: ${typeof published}`
      );
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
      console.error(`[PUBLISH API] Grade not found: ${params.id}`);
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    console.log(
      `[PUBLISH API] Current published status: ${existingGrade.published}`
    );
    console.log(`[PUBLISH API] Updating to: ${published}`);

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

    console.log(`[PUBLISH API] ✅ Database updated successfully`);
    console.log(
      `[PUBLISH API] Grade ${params.id} ${action} by ${session.user.role} (${session.user.email})`
    );
    console.log(
      `[PUBLISH API] Student: ${updatedGrade.student.user.name}, Subject: ${updatedGrade.subject.name}`
    );
    console.log(
      `[PUBLISH API] Final published status: ${updatedGrade.published}`
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
