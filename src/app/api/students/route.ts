import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

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
    const classId = searchParams.get("classId");
    const section = searchParams.get("section");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Add class filter if provided
    if (classId && classId !== "all") {
      where.classId = classId;
    }

    // Add section filter if provided
    if (section && section !== "all") {
      where.section = section;
    }

    // Add search filter if provided (SQLite compatible)
    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
            },
          },
        },
        {
          user: {
            email: {
              contains: search,
            },
          },
        },
        {
          rollNo: {
            contains: search,
          },
        },
      ];
    }

    const [students, total] = await Promise.all([
      db.studentProfile.findMany({
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
          class: {
            select: {
              id: true,
              name: true,
              section: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { rollNo: "asc" },
      }),
      db.studentProfile.count({ where }),
    ]);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      rollNo,
      classId,
      section,
      parentName,
      parentPhone,
      address,
      dateOfBirth,
      profileImage,
      emergencyContact,
    } = body;

    // Check if email or rollNo already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [{ email }, { studentProfile: { rollNo } }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or Roll Number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user and student profile
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNo,
            classId: classId || null,
            section,
            parentName,
            parentPhone,
            address,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            profileImage,
            emergencyContact,
          },
        },
      },
      include: {
        studentProfile: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
                section: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Student created successfully",
        student: {
          id: user.studentProfile?.id,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
          },
          rollNo: user.studentProfile?.rollNo,
          class: user.studentProfile?.class,
          section: user.studentProfile?.section,
          parentName: user.studentProfile?.parentName,
          parentPhone: user.studentProfile?.parentPhone,
          address: user.studentProfile?.address,
          dateOfBirth: user.studentProfile?.dateOfBirth,
          admissionDate: user.studentProfile?.admissionDate,
          profileImage: user.studentProfile?.profileImage,
          emergencyContact: user.studentProfile?.emergencyContact,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
