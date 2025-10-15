import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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

      // Fee statistics - using new StudentFee model
      prisma.studentFee.findMany({
        select: {
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
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

    // Calculate fee statistics using new StudentFee model
    const totalFeesAmount = feeStats.reduce(
      (sum: number, fee: any) => sum + Number(fee.totalAmount),
      0
    );

    const paidFees = feeStats.reduce(
      (sum: number, fee: any) => sum + Number(fee.paidAmount),
      0
    );

    const pendingFees = feeStats.reduce(
      (sum: number, fee: any) => sum + Number(fee.dueAmount),
      0
    );

    // Count fee statuses
    const paidFeesCount = feeStats.filter(
      (fee: any) => fee.status === "PAID"
    ).length;
    const pendingFeesCount = feeStats.filter(
      (fee: any) => fee.status === "PENDING" || fee.status === "PARTIAL"
    ).length;

    const stats = {
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      presentToday,
      absentToday,
      totalFeesAmount,
      paidFees,
      pendingFees,
      paidFeesCount,
      pendingFeesCount,
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
