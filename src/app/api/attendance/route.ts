import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const date = searchParams.get("date");
    const studentId = searchParams.get("studentId");

    // Build where clause
    let where: any = {};

    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    if (date) where.date = new Date(date);
    if (studentId) where.studentId = studentId;

    // If teacher, only show their classes
    if (session.user.role === "TEACHER" && session.user.profile) {
      where.teacherId = session.user.profile.id;
    }

    const attendances = await db.attendance.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        class: {
          select: {
            name: true,
            section: true,
          },
        },
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
      orderBy: [{ date: "desc" }, { student: { rollNo: "asc" } }],
    });

    return NextResponse.json({ attendances });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { attendanceRecords } = body; // Array of { studentId, classId, subjectId, status, date, remarks }

    if (!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) {
      return NextResponse.json(
        { error: "Invalid attendance records" },
        { status: 400 }
      );
    }

    // Get teacher profile if user is teacher
    let teacherId = null;
    if (session.user.role === "TEACHER" && session.user.profile) {
      teacherId = session.user.profile.id;
    } else if (session.user.role === "ADMIN") {
      // Admin needs to specify teacher or we get it from the first record
      const firstRecord = attendanceRecords[0];
      if (firstRecord.teacherId) {
        teacherId = firstRecord.teacherId;
      }
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 }
      );
    }

    // Validate all records have required fields
    for (const record of attendanceRecords) {
      if (
        !record.studentId ||
        !record.classId ||
        !record.status ||
        !record.date
      ) {
        return NextResponse.json(
          { error: "Missing required fields in attendance record" },
          { status: 400 }
        );
      }
    }

    // Create or update attendance records
    const results = [];
    for (const record of attendanceRecords) {
      const { studentId, classId, subjectId, status, date, remarks } = record;

      const existingAttendance = await db.attendance.findUnique({
        where: {
          studentId_classId_subjectId_date: {
            studentId,
            classId,
            subjectId: subjectId || "",
            date: new Date(date),
          },
        },
      });

      let attendanceRecord;
      if (existingAttendance) {
        // Update existing record
        attendanceRecord = await db.attendance.update({
          where: { id: existingAttendance.id },
          data: {
            status,
            remarks: remarks || null,
            teacherId,
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
          },
        });
      } else {
        // Create new record
        attendanceRecord = await db.attendance.create({
          data: {
            studentId,
            classId,
            subjectId: subjectId || null,
            teacherId,
            date: new Date(date),
            status,
            remarks: remarks || null,
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
          },
        });
      }

      results.push(attendanceRecord);
    }

    return NextResponse.json(
      {
        message: "Attendance recorded successfully",
        attendances: results,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error recording attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
