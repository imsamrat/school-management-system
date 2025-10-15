import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// In a real app, this would come from a database
// For now, we'll use static data that can be easily modified
const schoolSettings = {
  schoolName: "Greenfield International School",
  schoolAddress: "123 Education Boulevard, Knowledge City, KC 12345",
  schoolPhone: "+1 (555) 123-4567",
  schoolEmail: "info@greenfield.edu",
  schoolWebsite: "www.greenfield.edu",
  establishedYear: "1995",
  principalName: "Dr. Sarah Johnson",
  schoolLogo: "/school-logo.png", // Add your school logo to public folder
  schoolMotto: "Excellence in Education, Character in Life",
  affiliation: "International Baccalaureate Organization",
  schoolCode: "GIS2025",
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      settings: schoolSettings,
      message: "School settings retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching school settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch school settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // In a real app, you would update the database here
    // For now, we'll just return success

    return NextResponse.json({
      message: "School settings updated successfully",
      settings: { ...schoolSettings, ...body },
    });
  } catch (error) {
    console.error("Error updating school settings:", error);
    return NextResponse.json(
      { error: "Failed to update school settings" },
      { status: 500 }
    );
  }
}
