import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/fees/assign - Assign fees to students
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentIds, feeStructureId, academicYear, dueDate, customAmount } =
      body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Student IDs array is required" },
        { status: 400 }
      );
    }

    if (!feeStructureId || !academicYear) {
      return NextResponse.json(
        { error: "Fee structure ID and academic year are required" },
        { status: 400 }
      );
    }

    // Get fee structure details
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: {
        feeType: true,
        class: true,
      },
    });

    if (!feeStructure) {
      return NextResponse.json(
        { error: "Fee structure not found" },
        { status: 404 }
      );
    }

    const amount = customAmount
      ? parseFloat(customAmount)
      : parseFloat(feeStructure.amount.toString());

    // Create student fee assignments
    const results = await Promise.allSettled(
      studentIds.map(async (studentId: string) => {
        // Check if already assigned
        const existing = await prisma.studentFee.findFirst({
          where: {
            studentId,
            feeStructureId,
            academicYear,
          },
        });

        if (existing) {
          return { studentId, status: "skipped", reason: "Already assigned" };
        }

        // Create the student fee
        const studentFee = await prisma.studentFee.create({
          data: {
            studentId,
            feeStructureId,
            feeTypeId: feeStructure.feeTypeId,
            academicYear,
            totalAmount: amount,
            dueAmount: amount,
            paidAmount: 0,
            discountAmount: 0,
            status: "PENDING" as const,
            dueDate: dueDate ? new Date(dueDate) : undefined,
          },
        });

        // If it's a recurring monthly fee (like tuition), create monthly due records
        if (
          feeStructure.feeType.isRecurring &&
          feeStructure.frequency === "MONTHLY"
        ) {
          const currentDate = new Date();
          const monthlyAmount = amount; // Amount per month

          // Create dues for remaining months in the academic year
          // Assuming academic year starts in April and ends in March
          const monthlyDues = [];
          for (let i = 0; i < 12; i++) {
            const month = ((currentDate.getMonth() + i) % 12) + 1;
            const year =
              month < currentDate.getMonth() + 1
                ? currentDate.getFullYear() + 1
                : currentDate.getFullYear();

            const monthDueDate = new Date(year, month - 1, 10); // 10th of each month

            monthlyDues.push({
              studentFeeId: studentFee.id,
              studentId,
              month,
              year,
              amount: monthlyAmount,
              paidAmount: 0,
              status: "PENDING" as const,
              dueDate: monthDueDate,
            });
          }

          await prisma.monthlyDue.createMany({
            data: monthlyDues,
          });
        }

        return { studentId, status: "assigned", feeId: studentFee.id };
      })
    );

    const summary = {
      total: studentIds.length,
      assigned: results.filter(
        (r) =>
          r.status === "fulfilled" && (r.value as any).status === "assigned"
      ).length,
      skipped: results.filter(
        (r) => r.status === "fulfilled" && (r.value as any).status === "skipped"
      ).length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    return NextResponse.json(
      {
        message: "Fee assignment completed",
        summary,
        details: results.map((r) =>
          r.status === "fulfilled"
            ? r.value
            : { status: "failed", reason: (r as any).reason }
        ),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Fee assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign fees" },
      { status: 500 }
    );
  }
}

// POST /api/fees/assign/bulk - Bulk assign fees to all students in a class
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { classId, feeStructureId, academicYear, dueDate } = body;

    if (!classId || !feeStructureId || !academicYear) {
      return NextResponse.json(
        { error: "Class ID, fee structure ID, and academic year are required" },
        { status: 400 }
      );
    }

    // Get all students in the class
    const students = await prisma.studentProfile.findMany({
      where: { classId },
      select: { id: true },
    });

    if (students.length === 0) {
      return NextResponse.json(
        { error: "No students found in this class" },
        { status: 404 }
      );
    }

    // Use the individual assign endpoint logic
    const studentIds = students.map((s) => s.id);

    // Get fee structure details
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: {
        feeType: true,
      },
    });

    if (!feeStructure) {
      return NextResponse.json(
        { error: "Fee structure not found" },
        { status: 404 }
      );
    }

    const amount = parseFloat(feeStructure.amount.toString());

    // Create student fee assignments for all students
    const results = await Promise.allSettled(
      studentIds.map(async (studentId: string) => {
        const existing = await prisma.studentFee.findFirst({
          where: {
            studentId,
            feeStructureId,
            academicYear,
          },
        });

        if (existing) {
          return { studentId, status: "skipped" };
        }

        const studentFee = await prisma.studentFee.create({
          data: {
            studentId,
            feeStructureId,
            feeTypeId: feeStructure.feeTypeId,
            academicYear,
            totalAmount: amount,
            dueAmount: amount,
            paidAmount: 0,
            discountAmount: 0,
            status: "PENDING" as const,
            dueDate: dueDate ? new Date(dueDate) : undefined,
          },
        });

        // Create monthly dues if recurring
        if (
          feeStructure.feeType.isRecurring &&
          feeStructure.frequency === "MONTHLY"
        ) {
          const currentDate = new Date();
          const monthlyDues = [];

          for (let i = 0; i < 12; i++) {
            const month = ((currentDate.getMonth() + i) % 12) + 1;
            const year =
              month < currentDate.getMonth() + 1
                ? currentDate.getFullYear() + 1
                : currentDate.getFullYear();

            monthlyDues.push({
              studentFeeId: studentFee.id,
              studentId,
              month,
              year,
              amount,
              paidAmount: 0,
              status: "PENDING" as const,
              dueDate: new Date(year, month - 1, 10),
            });
          }

          await prisma.monthlyDue.createMany({
            data: monthlyDues,
          });
        }

        return { studentId, status: "assigned" };
      })
    );

    const summary = {
      total: studentIds.length,
      assigned: results.filter(
        (r) =>
          r.status === "fulfilled" && (r.value as any).status === "assigned"
      ).length,
      skipped: results.filter(
        (r) => r.status === "fulfilled" && (r.value as any).status === "skipped"
      ).length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    return NextResponse.json(
      {
        message: "Bulk fee assignment completed",
        summary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk fee assignment error:", error);
    return NextResponse.json(
      { error: "Failed to assign fees in bulk" },
      { status: 500 }
    );
  }
}
