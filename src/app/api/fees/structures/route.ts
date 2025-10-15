import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/fees/structures - Get all fee structures
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const feeTypeId = searchParams.get("feeTypeId");
    const academicYear = searchParams.get("academicYear") || "2024-25";

    const where: any = { isActive: true, academicYear };

    if (classId) {
      where.classId = classId;
    }

    if (feeTypeId) {
      where.feeTypeId = feeTypeId;
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        class: true,
        feeType: true,
        _count: {
          select: {
            studentFees: true,
          },
        },
      },
      orderBy: [{ class: { name: "asc" } }, { feeType: { name: "asc" } }],
    });

    return NextResponse.json(feeStructures);
  } catch (error) {
    console.error("Fee structures fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee structures" },
      { status: 500 }
    );
  }
}

// POST /api/fees/structures - Create new fee structure (Admin/Staff only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { classId, feeTypeId, amount, frequency, academicYear, description } =
      body;

    if (!classId || !feeTypeId || !amount || !frequency || !academicYear) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        classId,
        feeTypeId,
        amount: parseFloat(amount),
        frequency,
        academicYear,
        description,
      },
      include: {
        class: true,
        feeType: true,
      },
    });

    return NextResponse.json(feeStructure, { status: 201 });
  } catch (error: any) {
    console.error("Fee structure creation error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Fee structure already exists for this class and fee type" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create fee structure" },
      { status: 500 }
    );
  }
}

// PUT /api/fees/structures - Update fee structure (Admin/Staff only)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, amount, frequency, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Fee structure ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (frequency) updateData.frequency = frequency;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const feeStructure = await prisma.feeStructure.update({
      where: { id },
      data: updateData,
      include: {
        class: true,
        feeType: true,
      },
    });

    return NextResponse.json(feeStructure);
  } catch (error) {
    console.error("Fee structure update error:", error);
    return NextResponse.json(
      { error: "Failed to update fee structure" },
      { status: 500 }
    );
  }
}

// DELETE /api/fees/structures - Delete fee structure (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Fee structure ID is required" },
        { status: 400 }
      );
    }

    // Check if any students are assigned this fee
    const studentCount = await prisma.studentFee.count({
      where: { feeStructureId: id },
    });

    if (studentCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${studentCount} students are assigned this fee`,
        },
        { status: 400 }
      );
    }

    await prisma.feeStructure.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Fee structure deleted successfully" });
  } catch (error) {
    console.error("Fee structure deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete fee structure" },
      { status: 500 }
    );
  }
}
