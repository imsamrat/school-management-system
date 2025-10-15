import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Fetch all active teachers with their profiles
    const teachers = await db.teacherProfile.findMany({
      where: {
        user: {
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinDate: "desc",
      },
    });

    // Format the response for public display
    const formattedTeachers = teachers.map((teacher: any) => ({
      id: teacher.id,
      name: teacher.user.name,
      department: teacher.department,
      qualification: teacher.qualification,
      experience: teacher.experience,
      bio: teacher.bio,
      profileImage: teacher.profileImage || "/placeholder-teacher.jpg",
    }));

    return NextResponse.json({
      teachers: formattedTeachers,
      total: formattedTeachers.length,
    });
  } catch (error) {
    console.error("Error fetching public teachers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
