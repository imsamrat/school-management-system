import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { hash } from "bcryptjs";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (
      !session ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await db.studentProfile.findUnique({
      where: { id },
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
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

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
      isActive,
      profileImage,
      emergencyContact,
    } = body;

    // Check if student exists
    const existingStudent = await db.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if email or rollNo conflicts with other students
    const conflictingUser = await db.user.findFirst({
      where: {
        AND: [
          {
            OR: [{ email }, { studentProfile: { rollNo } }],
          },
          { id: { not: existingStudent.userId } },
        ],
      },
    });

    if (conflictingUser) {
      return NextResponse.json(
        { error: "Email or Roll Number already exists" },
        { status: 400 }
      );
    }

    // Prepare update data
    const userUpdateData: any = {
      name,
      email,
      isActive: isActive !== undefined ? isActive : undefined,
    };

    if (password) {
      userUpdateData.password = await hash(password, 12);
    }

    const studentUpdateData: any = {
      rollNo,
      classId: classId || null,
      section,
      parentName,
      parentPhone,
      address,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      profileImage,
      emergencyContact,
    };

    // Update user and student profile
    const updatedUser = await db.user.update({
      where: { id: existingStudent.userId },
      data: {
        ...userUpdateData,
        studentProfile: {
          update: studentUpdateData,
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

    return NextResponse.json({
      message: "Student updated successfully",
      student: {
        id: updatedUser.studentProfile?.id,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          isActive: updatedUser.isActive,
        },
        rollNo: updatedUser.studentProfile?.rollNo,
        class: updatedUser.studentProfile?.class,
        section: updatedUser.studentProfile?.section,
        parentName: updatedUser.studentProfile?.parentName,
        parentPhone: updatedUser.studentProfile?.parentPhone,
        address: updatedUser.studentProfile?.address,
        dateOfBirth: updatedUser.studentProfile?.dateOfBirth,
        admissionDate: updatedUser.studentProfile?.admissionDate,
        profileImage: updatedUser.studentProfile?.profileImage,
        emergencyContact: updatedUser.studentProfile?.emergencyContact,
      },
    });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await db.studentProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Delete user (this will cascade delete the student profile)
    await db.user.delete({
      where: { id: student.userId },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
