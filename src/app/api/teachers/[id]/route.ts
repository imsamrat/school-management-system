import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { z } from "zod";

const updateTeacherSchema = z.object({
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await db.teacherProfile.findUnique({
      where: { id: params.id },
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
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateTeacherSchema.parse(body);

    const existingTeacher = await db.teacherProfile.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Check if email is changing and already exists
    if (validatedData.email !== existingTeacher.user.email) {
      const existingUser = await db.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Check if employee ID is changing and already exists
    if (validatedData.employeeId !== existingTeacher.employeeId) {
      const existingEmployeeId = await db.teacherProfile.findUnique({
        where: { employeeId: validatedData.employeeId },
      });

      if (existingEmployeeId) {
        return NextResponse.json(
          { error: "Employee ID already exists" },
          { status: 400 }
        );
      }
    }

    // Update user data
    const updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
    };

    if (validatedData.password) {
      updateData.password = await hash(validatedData.password, 12);
    }

    const updatedTeacher = await db.user.update({
      where: { id: existingTeacher.userId },
      data: {
        ...updateData,
        teacherProfile: {
          update: {
            employeeId: validatedData.employeeId,
            department: validatedData.department,
            qualification: validatedData.qualification,
            experience: validatedData.experience,
            phone: validatedData.phone,
            address: validatedData.address,
            profileImage: validatedData.profileImage,
            bio: validatedData.bio,
          },
        },
      },
      include: {
        teacherProfile: true,
      },
    });

    return NextResponse.json({
      message: "Teacher updated successfully",
      teacher: updatedTeacher,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingTeacher = await db.teacherProfile.findUnique({
      where: { id: params.id },
      include: { user: true },
    });

    if (!existingTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Delete teacher profile and user
    await db.user.delete({
      where: { id: existingTeacher.userId },
    });

    return NextResponse.json({
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
