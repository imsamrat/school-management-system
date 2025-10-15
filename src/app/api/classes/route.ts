import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const classSchema = z.object({
  name: z.string().min(1, "Name is required"),
  section: z.string().min(1, "Section is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  description: z.string().optional(),
});

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const academicYear = searchParams.get("academicYear") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      ...(academicYear && { academicYear }),
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { section: { contains: search } },
      ];
    }

    const [classes, total] = await Promise.all([
      db.class.findMany({
        where,
        include: {
          _count: {
            select: {
              students: true,
              subjects: true,
            },
          },
        },
        orderBy: [{ name: "asc" }, { section: "asc" }],
        skip: limit ? skip : undefined,
        take: limit ? limit : undefined,
      }),
      db.class.count({ where }),
    ]);

    return NextResponse.json({
      classes,
      pagination: limit
        ? {
            page,
            pages: Math.ceil(total / limit),
            total,
          }
        : undefined,
    });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = classSchema.parse(body);

    // Check if class with same name, section, and academic year already exists
    const existingClass = await db.class.findUnique({
      where: {
        name_section_academicYear: {
          name: validatedData.name,
          section: validatedData.section,
          academicYear: validatedData.academicYear,
        },
      },
    });

    if (existingClass) {
      return NextResponse.json(
        {
          error:
            "Class with same name, section, and academic year already exists",
        },
        { status: 400 }
      );
    }

    const newClass = await db.class.create({
      data: {
        name: validatedData.name,
        section: validatedData.section,
        academicYear: validatedData.academicYear,
        capacity: validatedData.capacity,
        description: validatedData.description,
      },
    });

    return NextResponse.json({
      message: "Class created successfully",
      class: newClass,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating class:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
