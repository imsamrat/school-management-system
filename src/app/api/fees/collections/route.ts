import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/fees/collections - Get payment collections with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const paymentMethod = searchParams.get("paymentMethod");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) where.paymentDate.lte = new Date(endDate);
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: { name: true, email: true },
              },
              class: {
                select: { name: true, section: true },
              },
            },
          },
          studentFee: {
            include: {
              feeType: true,
            },
          },
        },
        orderBy: { paymentDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Collections fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// POST /api/fees/collections - Record a new payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      studentFeeId,
      studentId,
      amount,
      discountAmount = 0,
      discountReason,
      paymentMethod,
      transactionId,
      remarks,
    } = body;

    if (!studentFeeId || !studentId || !amount || !paymentMethod) {
      return NextResponse.json(
        {
          error:
            "Required fields: studentFeeId, studentId, amount, paymentMethod",
        },
        { status: 400 }
      );
    }

    // Get the student fee to check current status
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
      include: {
        feeType: true,
        feeStructure: true,
      },
    });

    if (!studentFee) {
      return NextResponse.json(
        { error: "Student fee record not found" },
        { status: 404 }
      );
    }

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)
      .toUpperCase()}`;

    // Create payment record and update student fee in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          studentFeeId,
          studentId,
          amount: parseFloat(amount),
          discountAmount: parseFloat(discountAmount),
          discountReason,
          paymentMethod,
          transactionId,
          receiptNumber,
          remarks,
          collectedBy: session.user.id,
          status: "COMPLETED",
        },
        include: {
          student: {
            include: {
              user: { select: { name: true, email: true } },
              class: { select: { name: true, section: true } },
            },
          },
          studentFee: {
            include: { feeType: true },
          },
        },
      });

      // Update student fee
      const newPaidAmount =
        parseFloat(studentFee.paidAmount.toString()) + parseFloat(amount);
      const newDiscountAmount =
        parseFloat(studentFee.discountAmount.toString()) +
        parseFloat(discountAmount);
      const totalAmount = parseFloat(studentFee.totalAmount.toString());
      const newDueAmount = totalAmount - newPaidAmount - newDiscountAmount;

      let newStatus = studentFee.status;
      if (newDueAmount <= 0) {
        newStatus = "PAID";
      } else if (newPaidAmount > 0) {
        newStatus = "PARTIAL";
      }

      await tx.studentFee.update({
        where: { id: studentFeeId },
        data: {
          paidAmount: newPaidAmount,
          discountAmount: newDiscountAmount,
          dueAmount: newDueAmount,
          status: newStatus,
          lastPaymentDate: new Date(),
        },
      });

      // If it's a monthly recurring fee (like tuition), update monthly due records
      if (studentFee.feeType.isRecurring) {
        // Find unpaid monthly dues and mark them as paid proportionally
        const monthlyDues = await tx.monthlyDue.findMany({
          where: {
            studentFeeId,
            status: { in: ["PENDING", "PARTIAL"] },
          },
          orderBy: { dueDate: "asc" },
        });

        let remainingPayment = parseFloat(amount);
        for (const due of monthlyDues) {
          if (remainingPayment <= 0) break;

          const dueAmount =
            parseFloat(due.amount.toString()) -
            parseFloat(due.paidAmount.toString());
          const paymentForThisDue = Math.min(remainingPayment, dueAmount);
          const newPaid =
            parseFloat(due.paidAmount.toString()) + paymentForThisDue;

          await tx.monthlyDue.update({
            where: { id: due.id },
            data: {
              paidAmount: newPaid,
              status:
                newPaid >= parseFloat(due.amount.toString())
                  ? "PAID"
                  : "PARTIAL",
              paidDate:
                newPaid >= parseFloat(due.amount.toString())
                  ? new Date()
                  : due.paidDate,
            },
          });

          remainingPayment -= paymentForThisDue;
        }
      }

      return payment;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Payment collection error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
