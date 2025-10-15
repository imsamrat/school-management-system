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
    .transform((val) => (val ? parseInt(val) : 20)),
  search: z.string().optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  dayOfWeek: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : undefined)),
});

const createScheduleSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  subjectId: z.string().min(1, "Subject is required"),
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  room: z.string().optional(),
});

const updateScheduleSchema = z.object({
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  dayOfWeek: z.number().min(1).max(7).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  room: z.string().optional(),
});

// GET: Fetch all schedules (Admin view)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const params = scheduleQuerySchema.parse(Object.fromEntries(searchParams));

    // Build where clause
    const whereClause: any = {};

    if (params.classId && params.classId !== "all") {
      whereClause.classId = params.classId;
    }

    if (params.subjectId && params.subjectId !== "all") {
      whereClause.subjectId = params.subjectId;
    }

    if (params.teacherId && params.teacherId !== "all") {
      whereClause.OR = [
        {
          class: {
            teacherId: params.teacherId,
          },
        },
        {
          subject: {
            teacherId: params.teacherId,
          },
        },
      ];
    }

    if (params.dayOfWeek) {
      whereClause.dayOfWeek = params.dayOfWeek;
    }

    if (params.search) {
      whereClause.OR = [
        {
          class: {
            name: { contains: params.search, mode: "insensitive" },
          },
        },
        {
          subject: {
            name: { contains: params.search, mode: "insensitive" },
          },
        },
        {
          room: { contains: params.search, mode: "insensitive" },
        },
      ];
    }

    // Get total count
    const total = await prisma.timetable.count({
      where: whereClause,
    });

    // Get schedule records
    const schedules = await prisma.timetable.findMany({
      where: whereClause,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            academicYear: true,
            teacher: {
              include: {
                user: {
                  select: { name: true, email: true },
                },
              },
            },
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
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const totalPages = Math.ceil(total / params.limit);

    // Get all classes, subjects, and teachers for filters
    const classes = await prisma.class.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        section: true,
      },
      orderBy: [{ name: "asc" }, { section: "asc" }],
    });

    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: { name: "asc" },
    });

    const teachers = await prisma.teacherProfile.findMany({
      select: {
        id: true,
        employeeId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { user: { name: "asc" } },
    });

    // Group schedules by day for week view
    const schedulesByDay: Record<number, any[]> = {
      1: [], // Monday
      2: [], // Tuesday
      3: [], // Wednesday
      4: [], // Thursday
      5: [], // Friday
      6: [], // Saturday
      7: [], // Sunday
    };

    schedules.forEach((schedule: any) => {
      if (schedulesByDay[schedule.dayOfWeek]) {
        schedulesByDay[schedule.dayOfWeek].push(schedule);
      }
    });

    // Calculate statistics
    const stats = {
      totalSchedules: total,
      totalClasses: new Set(schedules.map((s: any) => s.classId)).size,
      totalSubjects: new Set(schedules.map((s: any) => s.subjectId)).size,
      activeDays: Object.values(schedulesByDay).filter((day) => day.length > 0)
        .length,
    };

    return NextResponse.json({
      schedules,
      schedulesByDay,
      classes,
      subjects,
      teachers,
      stats,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

// POST: Create new schedule
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
    const scheduleData = createScheduleSchema.parse(body);

    // Check for time conflicts
    const conflictingSchedule = await prisma.timetable.findFirst({
      where: {
        classId: scheduleData.classId,
        dayOfWeek: scheduleData.dayOfWeek,
        OR: [
          {
            AND: [
              { startTime: { lte: scheduleData.startTime } },
              { endTime: { gt: scheduleData.startTime } },
            ],
          },
          {
            AND: [
              { startTime: { lt: scheduleData.endTime } },
              { endTime: { gte: scheduleData.endTime } },
            ],
          },
          {
            AND: [
              { startTime: { gte: scheduleData.startTime } },
              { endTime: { lte: scheduleData.endTime } },
            ],
          },
        ],
      },
      include: {
        class: { select: { name: true, section: true } },
        subject: { select: { name: true } },
      },
    });

    if (conflictingSchedule) {
      return NextResponse.json(
        {
          error: `Time conflict detected with ${conflictingSchedule.subject.name} for ${conflictingSchedule.class.name}-${conflictingSchedule.class.section} on ${scheduleData.dayOfWeek} from ${conflictingSchedule.startTime} to ${conflictingSchedule.endTime}`,
        },
        { status: 409 }
      );
    }

    // Create schedule
    const schedule = await prisma.timetable.create({
      data: scheduleData,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            academicYear: true,
            teacher: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            teacher: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Schedule created successfully",
      schedule,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}

// PUT: Update schedule
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get("id");

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = updateScheduleSchema.parse(body);

    // Check if schedule exists
    const existingSchedule = await prisma.timetable.findUnique({
      where: { id: scheduleId },
    });

    if (!existingSchedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Check for time conflicts if time or day is being changed
    if (
      updateData.startTime ||
      updateData.endTime ||
      updateData.dayOfWeek ||
      updateData.classId
    ) {
      const checkData = {
        classId: updateData.classId || existingSchedule.classId,
        dayOfWeek: updateData.dayOfWeek || existingSchedule.dayOfWeek,
        startTime: updateData.startTime || existingSchedule.startTime,
        endTime: updateData.endTime || existingSchedule.endTime,
      };

      const conflictingSchedule = await prisma.timetable.findFirst({
        where: {
          id: { not: scheduleId },
          classId: checkData.classId,
          dayOfWeek: checkData.dayOfWeek,
          OR: [
            {
              AND: [
                { startTime: { lte: checkData.startTime } },
                { endTime: { gt: checkData.startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: checkData.endTime } },
                { endTime: { gte: checkData.endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: checkData.startTime } },
                { endTime: { lte: checkData.endTime } },
              ],
            },
          ],
        },
        include: {
          class: { select: { name: true, section: true } },
          subject: { select: { name: true } },
        },
      });

      if (conflictingSchedule) {
        return NextResponse.json(
          {
            error: `Time conflict detected with ${conflictingSchedule.subject.name} for ${conflictingSchedule.class.name}-${conflictingSchedule.class.section}`,
          },
          { status: 409 }
        );
      }
    }

    // Update schedule
    const updatedSchedule = await prisma.timetable.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
            academicYear: true,
            teacher: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            teacher: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

// DELETE: Delete schedule
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
    const scheduleId = searchParams.get("id");

    if (!scheduleId) {
      return NextResponse.json(
        { error: "Schedule ID is required" },
        { status: 400 }
      );
    }

    // Delete schedule
    await prisma.timetable.delete({
      where: { id: scheduleId },
    });

    return NextResponse.json({
      message: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
