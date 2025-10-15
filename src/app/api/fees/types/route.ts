import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db as prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/fees/types - Get all fee types
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isRecurring = searchParams.get("isRecurring");

    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (isRecurring !== null && isRecurring !== undefined) {
      where.isRecurring = isRecurring === "true";
    }

    const feeTypes = await prisma.feeType.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(feeTypes);
  } catch (error) {
    console.error("Fee types fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fee types" },
      { status: 500 }
    );
  }
}

// POST /api/fees/types - Create new fee type (Admin/Staff only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, code, category, isRecurring, description } = body;

    if (!name || !code || !category) {
      return NextResponse.json(
        { error: "Name, code, and category are required" },
        { status: 400 }
      );
    }

    const feeType = await prisma.feeType.create({
      data: {
        name,
        code: code.toUpperCase(),
        category,
        isRecurring: isRecurring ?? false,
        description,
      },
    });

    return NextResponse.json(feeType, { status: 201 });
  } catch (error: any) {
    console.error("Fee type creation error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Fee type with this code already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create fee type" },
      { status: 500 }
    );
  }
}
