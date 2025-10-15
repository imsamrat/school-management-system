import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Validation schemas
const scheduleQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 50)),
  date: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  dayOfWeek: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

// GET: Fetch teacher's schedule
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = scheduleQuerySchema.parse(Object.fromEntries(searchParams));

    // Build where clause for schedule
    const whereClause: any = {
      OR: [
        // Teacher is assigned to the class
        {
          class: {
            teacherId: teacherProfile.id,
          },
        },
        // Teacher teaches the subject
        {
          subject: {
            teacherId: teacherProfile.id,
          },
        },
      ],
    };

    if (params.classId) {
      whereClause.classId = params.classId;
    }

    if (params.subjectId) {
      whereClause.subjectId = params.subjectId;
    }

    if (params.dayOfWeek) {
      whereClause.dayOfWeek = params.dayOfWeek;
    }

    // Get total count
    const total = await prisma.timetable.count({
      where: whereClause,
    });

    // Get schedule records
    const schedule = await prisma.timetable.findMany({
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
          },
        },
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const totalPages = Math.ceil(total / params.limit);

    // Group schedule by day of week for easier frontend consumption
    const scheduleByDay: Record<string, any[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    };

    // Day mapping from number to string
    const dayMapping: Record<number, string> = {
      1: "MONDAY",
      2: "TUESDAY",
      3: "WEDNESDAY",
      4: "THURSDAY",
      5: "FRIDAY",
      6: "SATURDAY",
      7: "SUNDAY",
    };

    schedule.forEach((item: any) => {
      const dayName = dayMapping[item.dayOfWeek];
      if (dayName && scheduleByDay[dayName]) {
        scheduleByDay[dayName].push(item);
      }
    });

    // Get teacher's classes for filtering
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: teacherProfile.id,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        section: true,
      },
    });

    // Get teacher's subjects for filtering
    const teacherSubjects = await prisma.subject.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    // Calculate schedule statistics
    const stats = {
      totalClasses: schedule.length,
      uniqueClasses: new Set(schedule.map((s: any) => s.classId)).size,
      uniqueSubjects: new Set(schedule.map((s: any) => s.subjectId)).size,
      daysWithClasses: new Set(schedule.map((s: any) => s.dayOfWeek)).size,
    };

    return NextResponse.json({
      schedule,
      scheduleByDay,
      stats,
      classes: teacherClasses,
      subjects: teacherSubjects,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
}
