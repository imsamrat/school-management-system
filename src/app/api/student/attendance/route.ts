import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    console.log("Attendance API params:", { month, year });

    // Set date range
    let startDate: Date;
    let endDate: Date;

    if (month && year) {
      // Start of the month at 00:00:00
      startDate = new Date(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0, 0);
      // End of the month at 23:59:59
      endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      endDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    }

    console.log("Date range:", {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    // Get attendance records
    const attendanceRecords = await db.attendance.findMany({
      where: {
        studentId: studentProfile.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
        teacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    console.log(
      `Found ${attendanceRecords.length} attendance records for student ${studentProfile.id}`
    );

    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (record) => record.status === "PRESENT"
    ).length;
    const absentDays = attendanceRecords.filter(
      (record) => record.status === "ABSENT"
    ).length;
    const lateDays = attendanceRecords.filter(
      (record) => record.status === "LATE"
    ).length;
    const excusedDays = attendanceRecords.filter(
      (record) => record.status === "EXCUSED"
    ).length;

    const attendanceRate =
      totalDays > 0
        ? parseFloat(((presentDays / totalDays) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendanceRate,
      },
      records: attendanceRecords.map((record) => ({
        id: record.id,
        date: record.date.toISOString(),
        status: record.status,
        subject: {
          name: record.subject?.name || "N/A",
          code: record.subject?.code || "N/A",
        },
        teacher: record.teacher.user.name,
        remarks: record.remarks,
      })),
    });
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
