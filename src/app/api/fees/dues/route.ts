import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/fees/dues - Get all dues with comprehensive filtering
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classId = searchParams.get("classId");
    const feeTypeId = searchParams.get("feeTypeId");
    const status = searchParams.get("status");
    const academicYear = searchParams.get("academicYear") || "2024-25";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = { academicYear };

    if (studentId) {
      where.studentId = studentId;
    }

    if (feeTypeId) {
      where.feeTypeId = feeTypeId;
    }

    if (status) {
      where.status = status;
    } else {
      // By default, show only pending/partial/overdue (not fully paid)
      where.status = { in: ["PENDING", "PARTIAL", "OVERDUE"] };
    }

    // Filter by class if provided
    if (classId) {
      where.student = {
        classId,
      };
    }

    const [studentFees, total] = await Promise.all([
      prisma.studentFee.findMany({
        where,
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              class: { select: { name: true, section: true } },
            },
          },
          feeType: true,
          feeStructure: true,
          _count: {
            select: {
              payments: true,
              monthlyDues: true,
            },
          },
        },
        orderBy: [{ dueDate: "asc" }, { student: { user: { name: "asc" } } }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.studentFee.count({ where }),
    ]);

    // Calculate summary statistics
    const summary = await prisma.studentFee.aggregate({
      where,
      _sum: {
        totalAmount: true,
        paidAmount: true,
        discountAmount: true,
        dueAmount: true,
      },
      _count: true,
    });

    return NextResponse.json({
      dues: studentFees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalDues: total,
        totalAmount: summary._sum.totalAmount || 0,
        totalPaid: summary._sum.paidAmount || 0,
        totalDiscount: summary._sum.discountAmount || 0,
        totalDueAmount: summary._sum.dueAmount || 0,
      },
    });
  } catch (error) {
    console.error("Dues fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dues" },
      { status: 500 }
    );
  }
}

// GET /api/fees/dues/monthly - Get monthly dues breakdown (for tuition fees)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { studentId, year, classId, status } = body;

    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (year) {
      where.year = parseInt(year);
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { in: ["PENDING", "PARTIAL", "OVERDUE"] };
    }

    // Filter by class if provided
    if (classId) {
      where.student = {
        classId,
      };
    }

    const monthlyDues = await prisma.monthlyDue.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
            class: { select: { name: true, section: true } },
          },
        },
        studentFee: {
          include: {
            feeType: true,
          },
        },
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { student: { user: { name: "asc" } } },
      ],
    });

    // Group by month for summary
    const monthlyBreakdown = monthlyDues.reduce((acc: any, due: any) => {
      const key = `${due.year}-${String(due.month).padStart(2, "0")}`;
      if (!acc[key]) {
        acc[key] = {
          month: due.month,
          year: due.year,
          totalAmount: 0,
          paidAmount: 0,
          dueAmount: 0,
          count: 0,
        };
      }
      acc[key].totalAmount += parseFloat(due.amount.toString());
      acc[key].paidAmount += parseFloat(due.paidAmount.toString());
      acc[key].dueAmount +=
        parseFloat(due.amount.toString()) -
        parseFloat(due.paidAmount.toString());
      acc[key].count += 1;
      return acc;
    }, {});

    return NextResponse.json({
      monthlyDues,
      breakdown: Object.values(monthlyBreakdown),
    });
  } catch (error) {
    console.error("Monthly dues fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly dues" },
      { status: 500 }
    );
  }
}
