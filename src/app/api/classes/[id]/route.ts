import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const UpdateClassSchema = z.object({
  name: z.string().min(1, "Class name is required").optional(),
  section: z.string().min(1, "Section is required").optional(),
  academicYear: z.string().min(1, "Academic year is required").optional(),
  capacity: z.number().min(1).optional(),
  description: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (
      !session?.user ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const class_ = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        students: {
          select: {
            id: true,
            rollNo: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
            code: true,
            teacher: {
              select: {
                id: true,
                name: true,
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
    });

    if (!class_) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ class: class_ });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UpdateClassSchema.parse(body);

    // Check if class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: params.id },
    });

    if (!existingClass) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if new name and section combination conflicts with existing classes
    if (
      (validatedData.name && validatedData.name !== existingClass.name) ||
      (validatedData.section &&
        validatedData.section !== existingClass.section) ||
      (validatedData.academicYear &&
        validatedData.academicYear !== existingClass.academicYear)
    ) {
      const conflictingClass = await prisma.class.findFirst({
        where: {
          name: validatedData.name || existingClass.name,
          section: validatedData.section || existingClass.section,
          academicYear:
            validatedData.academicYear || existingClass.academicYear,
          id: { not: params.id },
        },
      });

      if (conflictingClass) {
        return NextResponse.json(
          {
            error:
              "A class with this name, section, and academic year already exists",
          },
          { status: 400 }
        );
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Class updated successfully",
      class: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if class exists
    const class_ = await prisma.class.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            students: true,
            subjects: true,
          },
        },
      },
    });

    if (!class_) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Check if class has students or subjects
    if (class_._count.students > 0) {
      return NextResponse.json(
        { error: "Cannot delete class with enrolled students" },
        { status: 400 }
      );
    }

    if (class_._count.subjects > 0) {
      return NextResponse.json(
        { error: "Cannot delete class with assigned subjects" },
        { status: 400 }
      );
    }

    await prisma.class.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Class deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
