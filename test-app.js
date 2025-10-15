// Simple test script to check application functionality
const { PrismaClient } = require("@prisma/client");

async function testApp() {
  const prisma = new PrismaClient();

  try {
    console.log("🔍 Testing School Management System...\n");

    // Test 1: Database Connection
    console.log("1. Testing database connection...");
    const userCount = await prisma.user.count();
    console.log(`   ✅ Database connected. Found ${userCount} users.\n`);

    // Test 2: Check Demo Users
    console.log("2. Checking demo users...");
    const demoUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (demoUsers.length > 0) {
      console.log("   ✅ Demo users found:");
      demoUsers.forEach((user) => {
        console.log(
          `      - ${user.email} (${user.role}) - ${
            user.isActive ? "Active" : "Inactive"
          }`
        );
      });
    } else {
      console.log("   ❌ No demo users found. Please run: npm run db:seed");
    }
    console.log("");

    // Test 3: Check Student Profiles
    console.log("3. Checking student profiles...");
    const students = await prisma.studentProfile.count();
    console.log(`   ✅ Found ${students} student profiles.\n`);

    // Test 4: Check Classes and Subjects
    console.log("4. Checking classes and subjects...");
    const classes = await prisma.class.count();
    const subjects = await prisma.subject.count();
    console.log(`   ✅ Found ${classes} classes and ${subjects} subjects.\n`);

    // Test 5: Check Attendance Records
    console.log("5. Checking attendance records...");
    const attendance = await prisma.attendance.count();
    console.log(`   ✅ Found ${attendance} attendance records.\n`);

    console.log("🎉 Test Summary:");
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Students: ${students}`);
    console.log(`   - Classes: ${classes}`);
    console.log(`   - Subjects: ${subjects}`);
    console.log(`   - Attendance: ${attendance}`);
    console.log("\n📝 Demo Credentials:");
    console.log("   Admin: admin@school.com / admin123");
    console.log("   Staff: staff@school.com / staff123");
    console.log("   Teacher: teacher@school.com / teacher123");
    console.log("   Student: alice@student.com / student123");

    console.log("\n🚀 Application should be running at: http://localhost:3001");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testApp();
