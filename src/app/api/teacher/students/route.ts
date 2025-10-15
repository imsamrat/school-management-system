import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has teacher or admin role
    if (!["TEACHER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json(
        { error: "Teacher access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId") || "";

    const skip = (page - 1) * limit;

    // For teachers, only show students from their classes
    let whereCondition: any = {};

    if (session.user.role === "TEACHER") {
      // Get teacher profile
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!teacherProfile) {
        return NextResponse.json(
          { error: "Teacher profile not found" },
          { status: 404 }
        );
      }

      // Get classes taught by this teacher
      const teacherClasses = await prisma.class.findMany({
        where: { teacherId: teacherProfile.id, isActive: true },
        select: { id: true },
      });

      const classIds = teacherClasses.map((cls: { id: string }) => cls.id);

      if (classIds.length === 0) {
        return NextResponse.json({
          students: [],
          pagination: { page, limit, total: 0, pages: 0 },
        });
      }

      whereCondition.classId = { in: classIds };
    }

    // Apply class filter if provided
    if (classId && classId !== "all") {
      whereCondition.classId = classId;
    }

    // Add search condition
    if (search) {
      whereCondition.OR = [
        { rollNo: { contains: search } },
        { parentName: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [students, totalCount] = await Promise.all([
      prisma.studentProfile.findMany({
        where: whereCondition,
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
              academicYear: true,
            },
          },
        },
        orderBy: { rollNo: "asc" },
        skip,
        take: limit,
      }),
      prisma.studentProfile.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}
