import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Fetch teacher dashboard statistics
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

    // Get teacher's classes
    const teacherClasses = await prisma.class.findMany({
      where: {
        teacherId: teacherProfile.id,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    // Get total students across all classes
    const totalStudents = teacherClasses.reduce(
      (sum: number, cls: any) => sum + cls._count.students,
      0
    );

    // Get today's schedule
    const today = new Date();
    const dayOfWeekNumber = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday (0) to 7, others stay same

    const todaySchedule = await prisma.timetable.findMany({
      where: {
        dayOfWeek: dayOfWeekNumber,
        OR: [
          {
            class: {
              teacherId: teacherProfile.id,
            },
          },
          {
            subject: {
              teacherId: teacherProfile.id,
            },
          },
        ],
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            section: true,
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
      orderBy: {
        startTime: "asc",
      },
    });

    // Get grades statistics
    const gradesStats = await prisma.grade.groupBy({
      by: ["studentId"],
      where: {
        teacherId: teacherProfile.id,
      },
      _count: {
        id: true,
      },
    });

    // Get recent attendance for current week
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const attendanceStats = await prisma.attendance.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
        class: {
          teacherId: teacherProfile.id,
        },
      },
    });

    // Calculate attendance rate
    const presentCount = attendanceStats.filter(
      (a: any) => a.status === "PRESENT"
    ).length;
    const totalAttendanceRecords = attendanceStats.length;
    const attendanceRate =
      totalAttendanceRecords > 0
        ? Math.round((presentCount / totalAttendanceRecords) * 100)
        : 0;

    // Get recent activities (attendance, grades created in last 7 days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const recentAttendance = await prisma.attendance.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        class: {
          teacherId: teacherProfile.id,
        },
      },
      include: {
        class: {
          select: {
            name: true,
            section: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    const recentGrades = await prisma.grade.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        teacherId: teacherProfile.id,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Calculate attendance by class
    const attendanceByClass = await Promise.all(
      teacherClasses.map(async (cls: any) => {
        const classAttendance = await prisma.attendance.findMany({
          where: {
            classId: cls.id,
            date: {
              gte: weekStart,
              lte: weekEnd,
            },
          },
        });

        const present = classAttendance.filter(
          (a: any) => a.status === "PRESENT"
        ).length;
        const total = classAttendance.length;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        return {
          classId: cls.id,
          className: `${cls.name} - ${cls.section}`,
          attendanceRate: rate,
        };
      })
    );

    // Prepare dashboard statistics
    const stats = {
      totalClasses: teacherClasses.length,
      totalStudents,
      todayClasses: todaySchedule.length,
      totalGrades: gradesStats.length,
      attendanceRate,
    };

    // Format today's schedule
    const formattedSchedule = todaySchedule.map((schedule: any) => ({
      id: schedule.id,
      time: schedule.startTime.substring(0, 5), // Format HH:MM
      endTime: schedule.endTime.substring(0, 5),
      subject: schedule.subject.name,
      subjectCode: schedule.subject.code,
      class: `${schedule.class.name}-${schedule.class.section}`,
      classId: schedule.class.id,
    }));

    // Format recent activities
    const recentActivities = [
      ...recentAttendance.map((att: any) => ({
        type: "attendance",
        message: `Attendance marked for ${att.class.name} - ${att.class.section}`,
        time: att.createdAt,
      })),
      ...recentGrades.map((grade: any) => ({
        type: "grade",
        message: `Grade recorded for ${grade.student.user.name} in ${grade.subject.name}`,
        time: grade.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);

    return NextResponse.json({
      stats,
      todaySchedule: formattedSchedule,
      attendanceByClass,
      recentActivities,
      teacher: {
        name: session.user.name,
        email: session.user.email,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
