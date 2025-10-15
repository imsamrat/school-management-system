const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testStudentQuery() {
  try {
    console.log("🧪 Testing student queries...");

    // Test basic query
    console.log("1. Testing basic findMany...");
    const allStudents = await prisma.studentProfile.findMany({
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
    console.log(`✅ Found ${allStudents.length} students`);

    // Test search query
    console.log("2. Testing search query...");
    const searchResults = await prisma.studentProfile.findMany({
      where: {
        OR: [
          {
            user: {
              name: {
                contains: "john",
              },
            },
          },
          {
            rollNo: {
              contains: "STU",
            },
          },
        ],
      },
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
    console.log(`✅ Search found ${searchResults.length} students`);

    // Test count query
    console.log("3. Testing count query...");
    const totalCount = await prisma.studentProfile.count();
    console.log(`✅ Total count: ${totalCount}`);

    if (allStudents.length > 0) {
      console.log("📋 Sample student data:");
      console.log(JSON.stringify(allStudents[0], null, 2));
    }
  } catch (error) {
    console.error("❌ Error testing queries:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testStudentQuery();
