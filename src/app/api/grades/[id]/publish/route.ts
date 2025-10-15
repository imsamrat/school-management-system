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

    // Check if user is admin or staff
    if (!["ADMIN", "STAFF"].includes(session.user.role)) {
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
      },
    });

    if (!existingGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // For now, we'll use a workaround since published field doesn't exist yet
    // We'll store the published status in a special way in the remarks field
    // This is a temporary solution until the database schema is updated

    let updatedRemarks = existingGrade.remarks || "";

    // Remove existing publish markers
    updatedRemarks = updatedRemarks
      .replace(/\[PUBLISHED\]|\[DRAFT\]/g, "")
      .trim();

    // Add new publish marker
    const publishMarker = published ? "[PUBLISHED]" : "[DRAFT]";
    updatedRemarks =
      publishMarker + (updatedRemarks ? " " + updatedRemarks : "");

    const updatedGrade = await db.grade.update({
      where: { id: params.id },
      data: {
        remarks: updatedRemarks,
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

    return NextResponse.json({
      message: `Grade ${action} successfully`,
      grade: {
        ...updatedGrade,
        published: published, // Add published field to response
      },
    });
  } catch (error) {
    console.error("Error updating grade published status:", error);
    return NextResponse.json(
      { error: "Failed to update grade status" },
      { status: 500 }
    );
  }
}
