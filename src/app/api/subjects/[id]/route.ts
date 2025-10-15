import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const UpdateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required").optional(),
  code: z.string().min(1, "Subject code is required").optional(),
  description: z.string().optional(),
  credits: z.number().min(0).optional(),
  teacherId: z.string().nullish(),
  classIds: z.array(z.string()).optional(),
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

    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
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
            _count: {
              select: {
                students: true,
              },
            },
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

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ subject });
  } catch (error) {
    console.error("Error fetching subject:", error);
    return NextResponse.json(
      { error: "Failed to fetch subject" },
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
    const validatedData = UpdateSubjectSchema.parse(body);

    // Check if subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: params.id },
    });

    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if new subject code conflicts with existing ones
    if (validatedData.code && validatedData.code !== existingSubject.code) {
      const codeExists = await prisma.subject.findFirst({
        where: {
          code: validatedData.code,
          id: { not: params.id },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Subject code already exists" },
          { status: 400 }
        );
      }
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

    // Prepare update data
    const updateData: any = {};

    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.code !== undefined) updateData.code = validatedData.code;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.credits !== undefined)
      updateData.credits = validatedData.credits;
    if (validatedData.teacherId !== undefined) {
      updateData.teacherId = validatedData.teacherId || null;
    }

    // Handle class assignment (single class based on schema)
    if (
      validatedData.classIds !== undefined &&
      validatedData.classIds.length > 0
    ) {
      // Use the first selected class (since schema supports only one class per subject)
      updateData.classId = validatedData.classIds[0];
    }

    const subject = await prisma.subject.update({
      where: { id: params.id },
      data: updateData,
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
    });

    return NextResponse.json({
      message: "Subject updated successfully",
      subject,
    });
  } catch (error) {
    console.error("Error updating subject:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update subject" },
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

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            attendances: true,
          },
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Check if subject has attendance records
    if (subject._count.attendances > 0) {
      return NextResponse.json(
        { error: "Cannot delete subject with attendance records" },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: "Subject deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 }
    );
  }
}
