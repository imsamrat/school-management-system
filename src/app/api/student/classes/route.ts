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

    if (!studentProfile.classId) {
      return NextResponse.json({ error: "No class assigned" }, { status: 404 });
    }

    // Get subjects for the student's class
    const subjects = await db.subject.findMany({
      where: {
        classId: studentProfile.classId,
        isActive: true,
      },
    });

    // Get teacher names for subjects
    const teacherIds = subjects
      .map((s) => s.teacherId)
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

    const teacherMap = new Map(teachers.map((t) => [t.id, t.user.name]));

    // Get complete weekly timetable
    const timetables = await db.timetable.findMany({
      where: {
        classId: studentProfile.classId,
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
      orderBy: [
        {
          dayOfWeek: "asc",
        },
        {
          startTime: "asc",
        },
      ],
    });

    // Group timetables by day
    const timetableByDay = timetables.reduce((acc, timetable) => {
      const dayOfWeek = timetable.dayOfWeek;
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = [];
      }
      acc[dayOfWeek].push(timetable);
      return acc;
    }, {} as Record<number, typeof timetables>);

    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    return NextResponse.json({
      class: studentProfile.class,
      subjects: subjects.map((subject) => ({
        id: subject.id,
        name: subject.name,
        code: subject.code,
        teacher: subject.teacherId
          ? teacherMap.get(subject.teacherId) || "N/A"
          : "N/A",
        credits: subject.credits,
      })),
      timetable: Object.entries(timetableByDay).map(([day, schedules]) => ({
        day: daysOfWeek[parseInt(day) - 1],
        dayOfWeek: parseInt(day),
        schedules: schedules.map((schedule) => ({
          id: schedule.id,
          subject: schedule.subject.name,
          teacher: schedule.subject.teacherId
            ? teacherMap.get(schedule.subject.teacherId) || "N/A"
            : "N/A",
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          room: schedule.room,
        })),
      })),
    });
  } catch (error) {
    console.error("Error fetching student classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
