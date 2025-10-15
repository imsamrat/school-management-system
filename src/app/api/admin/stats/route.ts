import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has admin or staff role
    if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
      return NextResponse.json(
        { error: "Admin or staff access required" },
        { status: 403 }
      );
    }

    // Get today's date for attendance calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch all statistics in parallel for better performance
    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      todayAttendance,
      feeStats,
    ] = await Promise.all([
      // Total students
      prisma.studentProfile.count(),

      // Total teachers
      prisma.teacherProfile.count(),

      // Total classes
      prisma.class.count(),

      // Total subjects
      prisma.subject.count(),

      // Today's attendance
      prisma.attendance.findMany({
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        select: {
          status: true,
        },
      }),

      // Fee statistics
      prisma.feeRecord.findMany({
        select: {
          amount: true,
          status: true,
        },
      }),
    ]);

    // Calculate attendance statistics
    const presentToday = todayAttendance.filter(
      (record: { status: string }) => record.status === "PRESENT"
    ).length;
    const absentToday = todayAttendance.filter(
      (record: { status: string }) => record.status === "ABSENT"
    ).length;

    // Calculate fee statistics
    const paidFees = feeStats
      .filter((fee: { status: string; amount: any }) => fee.status === "PAID")
      .reduce(
        (sum: number, fee: { amount: any }) => sum + Number(fee.amount),
        0
      );

    const pendingFees = feeStats
      .filter(
        (fee: { status: string; amount: any }) => fee.status === "PENDING"
      )
      .reduce(
        (sum: number, fee: { amount: any }) => sum + Number(fee.amount),
        0
      );

    const stats = {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      presentToday,
      absentToday,
      paidFees,
      pendingFees,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
