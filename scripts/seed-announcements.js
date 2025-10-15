const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedAnnouncements() {
  try {
    // First, find the admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      console.log("No admin user found. Please create an admin user first.");
      return;
    }

    // Create test announcements
    const announcements = [
      {
        title: "Welcome to New Academic Year 2024-2025",
        content:
          "We welcome all students and staff to the new academic year. Please note the updated schedule and new policies.",
        targetRole: null, // For all users
        authorId: adminUser.id,
        isActive: true,
      },
      {
        title: "Midterm Exam Schedule Released",
        content:
          "The midterm examination schedule has been published. Students can check their exam dates on the student portal.",
        targetRole: "STUDENT",
        authorId: adminUser.id,
        isActive: true,
      },
      {
        title: "Parent-Teacher Meeting Notice",
        content:
          "Monthly parent-teacher meeting scheduled for this Friday. All parents are requested to attend.",
        targetRole: null,
        authorId: adminUser.id,
        isActive: true,
      },
      {
        title: "Library Maintenance Notice",
        content:
          "The school library will be closed for maintenance this weekend. All borrowed books should be returned by Friday.",
        targetRole: "STUDENT",
        authorId: adminUser.id,
        isActive: true,
      },
    ];

    // Delete existing announcements
    await prisma.announcement.deleteMany({});

    // Create new announcements
    for (const announcement of announcements) {
      await prisma.announcement.create({
        data: announcement,
      });
      console.log(`Created announcement: ${announcement.title}`);
    }

    console.log("✅ Successfully seeded announcements");
  } catch (error) {
    console.error("Error seeding announcements:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAnnouncements();
