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

    const skip = (page - 1) * limit;

    // For teachers, only show their classes. For admins, show all classes.
    let whereCondition: any = {
      isActive: true,
    };

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

      whereCondition.teacherId = teacherProfile.id;
    }

    // Add search condition
    if (search) {
      whereCondition.OR = [
        { name: { contains: search } },
        { section: { contains: search } },
        { academicYear: { contains: search } },
      ];
    }

    const [classes, totalCount] = await Promise.all([
      prisma.class.findMany({
        where: whereCondition,
        include: {
          teacher: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              students: true,
              subjects: true,
            },
          },
        },
        orderBy: [{ name: "asc" }, { section: "asc" }],
        skip,
        take: limit,
      }),
      prisma.class.count({ where: whereCondition }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      classes,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}
