import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Validation schemas
const attendanceQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  classId: z.string().optional(),
  date: z.string().optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
});

const markAttendanceSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  classId: z.string().min(1, "Class ID is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .transform((val) => new Date(val)),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  remarks: z.string().optional(),
});

const bulkAttendanceSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
  date: z
    .string()
    .min(1, "Date is required")
    .transform((val) => new Date(val)),
  attendance: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
      remarks: z.string().optional(),
    })
  ),
});

// GET: Fetch attendance records for teacher's classes
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
    const teacherProfile = await db.teacherProfile.findUnique({
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
    const params = attendanceQuerySchema.parse(
      Object.fromEntries(searchParams)
    );

    // Get teacher's classes
    const teacherClasses = await db.class.findMany({
      where: {
        teacherId: teacherProfile.id,
        isActive: true,
      },
      select: { id: true },
    });

    const classIds = teacherClasses.map((c: { id: string }) => c.id);

    if (classIds.length === 0) {
      return NextResponse.json({
        attendance: [],
        total: 0,
        page: params.page,
        limit: params.limit,
        totalPages: 0,
      });
    }

    // Build where clause
    const whereClause: any = {
      class: {
        id: { in: classIds },
      },
    };

    if (params.classId) {
      whereClause.classId = params.classId;
    }

    if (params.date) {
      const selectedDate = new Date(params.date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (params.status) {
      whereClause.status = params.status;
    }

    if (params.search) {
      whereClause.OR = [
        {
          student: {
            user: {
              name: { contains: params.search, mode: "insensitive" },
            },
          },
        },
        {
          student: {
            rollNo: { contains: params.search, mode: "insensitive" },
          },
        },
      ];
    }

    // Get total count
    const total = await db.attendance.count({
      where: whereClause,
    });

    // Get attendance records
    const attendance = await db.attendance.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            class: {
              select: {
                id: true,
                name: true,
                section: true,
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            section: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { student: { rollNo: "asc" } }],
      skip: (params.page - 1) * params.limit,
      take: params.limit,
    });

    const totalPages = Math.ceil(total / params.limit);

    return NextResponse.json({
      attendance,
      total,
      page: params.page,
      limit: params.limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

// POST: Mark attendance for students
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get teacher profile
    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Teacher profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Check if it's bulk attendance or single attendance
    if (body.attendance && Array.isArray(body.attendance)) {
      // Bulk attendance marking
      const { classId, date, attendance } = bulkAttendanceSchema.parse(body);

      // Verify teacher has access to this class
      const teacherClass = await db.class.findFirst({
        where: {
          id: classId,
          teacherId: teacherProfile.id,
          isActive: true,
        },
      });

      if (!teacherClass) {
        console.log(
          `Teacher ${teacherProfile.id} tried to access class ${classId} but was denied`
        );

        // Debug: Check what classes this teacher actually has
        const teacherClasses = await db.class.findMany({
          where: { teacherId: teacherProfile.id },
          select: { id: true, name: true, section: true, isActive: true },
        });

        console.log(`Teacher's classes:`, teacherClasses);

        return NextResponse.json(
          { error: "Class not found or access denied", teacherClasses },
          { status: 403 }
        );
      }

      // Process bulk attendance
      const attendanceRecords = [];

      for (const record of attendance) {
        // Check if attendance already exists
        const existingAttendance = await db.attendance.findFirst({
          where: {
            studentId: record.studentId,
            classId,
            date: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lte: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
        });

        if (existingAttendance) {
          // Update existing attendance
          const updated = await db.attendance.update({
            where: { id: existingAttendance.id },
            data: {
              status: record.status,
              remarks: record.remarks,
              updatedAt: new Date(),
            },
            include: {
              student: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          });
          attendanceRecords.push(updated);
        } else {
          // Create new attendance
          const created = await db.attendance.create({
            data: {
              studentId: record.studentId,
              classId,
              teacherId: teacherProfile.id,
              date,
              status: record.status,
              remarks: record.remarks,
            },
            include: {
              student: {
                include: {
                  user: { select: { id: true, name: true, email: true } },
                },
              },
            },
          });
          attendanceRecords.push(created);
        }
      }

      return NextResponse.json({
        message: "Bulk attendance marked successfully",
        attendance: attendanceRecords,
      });
    } else {
      // Single attendance marking
      const { studentId, classId, date, status, remarks } =
        markAttendanceSchema.parse(body);

      // Verify teacher has access to this class
      const teacherClass = await db.class.findFirst({
        where: {
          id: classId,
          teacherId: teacherProfile.id,
          isActive: true,
        },
      });

      if (!teacherClass) {
        console.log(
          `Teacher ${teacherProfile.id} tried to access class ${classId} but was denied for single attendance`
        );

        // Debug: Check what classes this teacher actually has
        const teacherClasses = await db.class.findMany({
          where: { teacherId: teacherProfile.id },
          select: { id: true, name: true, section: true, isActive: true },
        });

        console.log(`Teacher's classes for single attendance:`, teacherClasses);

        return NextResponse.json(
          { error: "Class not found or access denied", teacherClasses },
          { status: 403 }
        );
      }

      // Check if attendance already exists for this date
      const existingAttendance = await db.attendance.findFirst({
        where: {
          studentId,
          classId,
          date: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
      });

      let attendance;

      if (existingAttendance) {
        // Update existing attendance
        attendance = await db.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status,
            remarks,
            updatedAt: new Date(),
          },
          include: {
            student: {
              include: {
                user: { select: { id: true, name: true, email: true } },
                class: { select: { id: true, name: true, section: true } },
              },
            },
            class: { select: { id: true, name: true, section: true } },
          },
        });
      } else {
        // Create new attendance
        attendance = await db.attendance.create({
          data: {
            studentId,
            classId,
            teacherId: teacherProfile.id,
            date,
            status,
            remarks,
          },
          include: {
            student: {
              include: {
                user: { select: { id: true, name: true, email: true } },
                class: { select: { id: true, name: true, section: true } },
              },
            },
            class: { select: { id: true, name: true, section: true } },
          },
        });
      }

      return NextResponse.json({
        message: "Attendance marked successfully",
        attendance,
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error marking attendance:", error);
    return NextResponse.json(
      { error: "Failed to mark attendance" },
      { status: 500 }
    );
  }
}
