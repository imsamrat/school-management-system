import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
  department: z.string().min(1, "Department is required"),
  qualification: z.string().optional(),
  experience: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  profileImage: z.string().optional(),
  bio: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      ...(department && {
        department: { contains: department },
      }),
    };

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { employeeId: { contains: search } },
      ];
    }

    const [teachers, total] = await Promise.all([
      db.teacherProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isActive: true,
            },
          },
        },
        orderBy: { employeeId: "asc" },
        skip,
        take: limit,
      }),
      db.teacherProfile.count({ where }),
    ]);

    return NextResponse.json({
      teachers,
      pagination: {
        page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
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
    const validatedData = teacherSchema.parse(body);

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Check if employee ID already exists
    const existingTeacher = await db.teacherProfile.findUnique({
      where: { employeeId: validatedData.employeeId },
    });

    if (existingTeacher) {
      return NextResponse.json(
        { error: "Employee ID already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(
      validatedData.password || "teacher123",
      12
    );

    const teacher = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "TEACHER",
        teacherProfile: {
          create: {
            employeeId: validatedData.employeeId,
            department: validatedData.department,
            qualification: validatedData.qualification,
            experience: validatedData.experience,
            phone: validatedData.phone,
            address: validatedData.address,
            profileImage: validatedData.profileImage,
            bio: validatedData.bio,
            joinDate: new Date(),
          },
        },
      },
      include: {
        teacherProfile: true,
      },
    });

    return NextResponse.json({
      message: "Teacher created successfully",
      teacher,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
