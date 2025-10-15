import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, filters } = await request.json();

    if (!action || !["publish", "unpublish"].includes(action)) {
      return NextResponse.json(
        { error: "Action must be 'publish' or 'unpublish'" },
        { status: 400 }
      );
    }

    const published = action === "publish";

    // Build where clause based on filters
    const where: any = {};

    if (filters?.classId) {
      where.student = {
        classId: filters.classId,
      };
    }

    if (filters?.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters?.examType) {
      where.examType = filters.examType;
    }

    if (filters?.teacherId) {
      where.teacherId = filters.teacherId;
    }

    if (filters?.gradeIds && filters.gradeIds.length > 0) {
      where.id = {
        in: filters.gradeIds,
      };
    }

    console.log(`[BULK PUBLISH] ${action} grades with filters:`, filters);
    console.log(`[BULK PUBLISH] Where clause:`, JSON.stringify(where, null, 2));

    // First, count how many grades will be affected
    const count = await db.grade.count({ where });

    if (count === 0) {
      return NextResponse.json(
        { error: "No grades found matching the criteria" },
        { status: 404 }
      );
    }

    console.log(`[BULK PUBLISH] Found ${count} grades to ${action}`);

    // Update all matching grades
    const result = await db.grade.updateMany({
      where,
      data: {
        published,
      },
    });

    console.log(
      `[BULK PUBLISH] ✅ Successfully updated ${result.count} grades`
    );

    const message = `Successfully ${action}ed ${result.count} grade${
      result.count > 1 ? "s" : ""
    }`;

    return NextResponse.json(
      {
        message,
        count: result.count,
        action,
        filters,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("[BULK PUBLISH] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to bulk update grades",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
