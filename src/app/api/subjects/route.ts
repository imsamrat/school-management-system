import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { z } from "zod";

const SubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
  description: z.string().optional(),
  credits: z.number().min(0).optional(),
  teacherId: z.string().nullish(),
  classIds: z.array(z.string()).min(1, "At least one class must be selected"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const department = searchParams.get("department");
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (department && department !== "all") {
      where.department = department;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (classId) {
      where.classes = {
        some: {
          id: classId,
        },
      };
    }

    const [subjects, totalCount] = await Promise.all([
      prisma.subject.findMany({
        where,
        include: {
          teacher: {
            select: {
              id: true,
              employeeId: true,
              department: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
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
          _count: {
            select: {
              attendances: true,
              assignments: true,
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      prisma.subject.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      subjects,
      pagination: {
        page,
        limit,
        totalCount,
        pages: totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = SubjectSchema.parse(body);

    // Check if subject code already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { code: validatedData.code },
    });

    if (existingSubject) {
      return NextResponse.json(
        { error: "Subject code already exists" },
        { status: 400 }
      );
    }

    // Verify teacher exists if provided
    if (validatedData.teacherId) {
      const teacher = await prisma.teacherProfile.findUnique({
        where: { id: validatedData.teacherId },
      });

      if (!teacher) {
        return NextResponse.json(
          { error: "Teacher not found" },
          { status: 400 }
        );
      }
    }

    // Create subject - note: schema only supports one class per subject
    const subjectData: any = {
      name: validatedData.name,
      code: validatedData.code,
      description: validatedData.description,
      credits: validatedData.credits,
      teacherId: validatedData.teacherId,
      classId:
        validatedData.classIds && validatedData.classIds.length > 0
          ? validatedData.classIds[0] // Take first class if multiple selected
          : undefined,
    };

    // Validate that classId is provided
    if (!subjectData.classId) {
      return NextResponse.json(
        { error: "At least one class must be selected" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: subjectData,
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
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
        _count: {
          select: {
            attendances: true,
            assignments: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Subject created successfully",
      subject,
    });
  } catch (error) {
    console.error("Error creating subject:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 }
    );
  }
}
