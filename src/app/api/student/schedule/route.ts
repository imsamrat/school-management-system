import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET: Fetch student's class schedule
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            academicYear: true,
          },
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const dayOfWeek = searchParams.get("dayOfWeek");

    // Build where clause for student's class schedule
    const whereClause: any = {
      classId: studentProfile.classId,
    };

    if (dayOfWeek) {
      whereClause.dayOfWeek = dayOfWeek;
    }

    // Get schedule for student's class
    const schedules = await db.schedule.findMany({
      where: whereClause,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            academicYear: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            teacher: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    // Group schedule by day of week
    const scheduleByDay: Record<string, any[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    };

    schedules.forEach((schedule: any) => {
      if (scheduleByDay[schedule.dayOfWeek]) {
        scheduleByDay[schedule.dayOfWeek].push(schedule);
      }
    });

    // Get today's schedule
    const today = new Date();
    const todayDayOfWeek = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][today.getDay()];
    const todaySchedule = scheduleByDay[todayDayOfWeek] || [];

    // Calculate statistics
    const stats = {
      totalClasses: schedules.length,
      uniqueSubjects: new Set(schedules.map((s: any) => s.subjectId)).size,
      daysWithClasses: Object.values(scheduleByDay).filter(
        (day) => day.length > 0
      ).length,
      todayClasses: todaySchedule.length,
    };

    return NextResponse.json({
      schedules,
      scheduleByDay,
      todaySchedule,
      stats,
      student: {
        name: session.user.name,
        email: session.user.email,
        rollNo: studentProfile.rollNo,
        class: studentProfile.class,
      },
    });
  } catch (error) {
    console.error("Error fetching student schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
