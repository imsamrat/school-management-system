const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

async function seedStudents() {
  try {
    console.log("🌱 Starting to seed students...");

    // First, create some classes if they don't exist
    const existingClasses = await prisma.class.findMany();

    let testClass;
    if (existingClasses.length === 0) {
      testClass = await prisma.class.create({
        data: {
          name: "Grade 10",
          section: "A",
          academicYear: "2024-2025",
          capacity: 30,
          description: "Grade 10 Section A",
        },
      });
      console.log("✅ Created test class:", testClass.name);
    } else {
      testClass = existingClasses[0];
      console.log("📚 Using existing class:", testClass.name);
    }

    // Check if students already exist
    const existingStudents = await prisma.studentProfile.findMany();
    if (existingStudents.length > 0) {
      console.log("👥 Students already exist, skipping seed");
      return;
    }

    // Create test students
    const students = [
      {
        name: "John Smith",
        email: "john.smith@student.school.com",
        rollNo: "STU001",
        parentName: "David Smith",
        parentPhone: "+1-555-0101",
      },
      {
        name: "Emma Johnson",
        email: "emma.johnson@student.school.com",
        rollNo: "STU002",
        parentName: "Sarah Johnson",
        parentPhone: "+1-555-0102",
      },
      {
        name: "Michael Brown",
        email: "michael.brown@student.school.com",
        rollNo: "STU003",
        parentName: "Robert Brown",
        parentPhone: "+1-555-0103",
      },
      {
        name: "Sophia Davis",
        email: "sophia.davis@student.school.com",
        rollNo: "STU004",
        parentName: "Jennifer Davis",
        parentPhone: "+1-555-0104",
      },
      {
        name: "William Wilson",
        email: "william.wilson@student.school.com",
        rollNo: "STU005",
        parentName: "James Wilson",
        parentPhone: "+1-555-0105",
      },
    ];

    // Create users and student profiles
    for (const student of students) {
      const hashedPassword = await hash("student123", 12);

      await prisma.user.create({
        data: {
          name: student.name,
          email: student.email,
          password: hashedPassword,
          role: "STUDENT",
          isActive: true,
          studentProfile: {
            create: {
              rollNo: student.rollNo,
              classId: testClass.id,
              section: testClass.section,
              parentName: student.parentName,
              parentPhone: student.parentPhone,
              address: `123 Main St, City, State 12345`,
              dateOfBirth: new Date("2008-01-15"),
            },
          },
        },
      });

      console.log(`✅ Created student: ${student.name} (${student.rollNo})`);
    }

    console.log("🎉 Successfully seeded students!");
  } catch (error) {
    console.error("❌ Error seeding students:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStudents();
