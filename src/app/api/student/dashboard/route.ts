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
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get subjects for the student's class
    const subjects = studentProfile.classId
      ? await db.subject.findMany({
          where: {
            classId: studentProfile.classId,
            isActive: true,
          },
        })
      : [];

    // Get attendance statistics for current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const attendanceRecords = await db.attendance.findMany({
      where: {
        studentId: studentProfile.id,
        date: {
          gte: firstDayOfMonth,
        },
      },
    });

    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (record) => record.status === "PRESENT"
    ).length;
    const attendanceRate =
      totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Get published grades
    const grades = await db.grade.findMany({
      where: {
        studentId: studentProfile.id,
        published: true,
      },
      include: {
        subject: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    });

    // Calculate average grade
    const totalGrades = await db.grade.findMany({
      where: {
        studentId: studentProfile.id,
        published: true,
      },
    });

    const averageGrade =
      totalGrades.length > 0
        ? (
            totalGrades.reduce((sum, grade) => sum + grade.obtainedMarks, 0) /
            totalGrades.length
          ).toFixed(1)
        : 0;

    // Get today's schedule
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfWeek = today === 0 ? 7 : today; // Convert to 1-7 format
    
    const timetables = studentProfile.classId
      ? await db.timetable.findMany({
          where: {
            classId: studentProfile.classId,
            dayOfWeek: dayOfWeek,
            isActive: true,
          },
          include: {
            subject: {
              select: {
                name: true,
                teacherId: true,
              },
            },
          },
          orderBy: {
            startTime: "asc",
          },
        })
      : [];

    // Get teacher names for timetables
    const teacherIds = timetables
      .map((t) => t.subject.teacherId)
      .filter((id): id is string => id !== null);
    
    const teachers = await db.teacherProfile.findMany({
      where: {
        id: {
          in: teacherIds,
        },
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const teacherMap = new Map(
      teachers.map((t) => [t.id, t.user.name])
    );

    // Get announcements for student role
    const announcements = await db.announcement.findMany({
      where: {
        OR: [{ targetRole: "STUDENT" }, { targetRole: null }],
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return NextResponse.json({
      student: {
        id: studentProfile.id,
        name: studentProfile.user.name,
        email: studentProfile.user.email,
        rollNo: studentProfile.rollNo,
        class: studentProfile.class,
        profileImage: studentProfile.profileImage,
      },
      stats: {
        totalSubjects: subjects.length,
        attendanceRate: parseFloat(attendanceRate as string),
        averageGrade: parseFloat(averageGrade as string),
        totalGrades: totalGrades.length,
      },
      subjects: subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        teacher: subject.teacherId
          ? teacherMap.get(subject.teacherId) || "N/A"
          : "N/A",
        credits: subject.credits,
      })),
      recentGrades: grades.map((grade) => ({
        id: grade.id,
        subject: grade.subject.name,
        assignment: grade.examType,
        grade:
          grade.grade ||
          getLetterGrade((grade.obtainedMarks / grade.maxMarks) * 100),
        score: grade.obtainedMarks,
        totalMarks: grade.maxMarks,
        date: grade.createdAt,
      })),
      todaySchedule: timetables.map((timetable) => ({
        id: timetable.id,
        subject: timetable.subject.name,
        teacher: timetable.subject.teacherId
          ? teacherMap.get(timetable.subject.teacherId) || "N/A"
          : "N/A",
        startTime: timetable.startTime,
        endTime: timetable.endTime,
        room: timetable.room,
      })),
      announcements: announcements.map((announcement) => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: "NORMAL",
        publishDate: announcement.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching student dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to convert percentage to letter grade
function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 85) return "A";
  if (percentage >= 80) return "A-";
  if (percentage >= 75) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 65) return "B-";
  if (percentage >= 60) return "C+";
  if (percentage >= 55) return "C";
  if (percentage >= 50) return "C-";
  if (percentage >= 45) return "D";
  return "F";
}
