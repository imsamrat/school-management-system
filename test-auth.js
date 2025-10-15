const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function testAuth() {
  try {
    console.log("🔍 Testing authentication...\n");

    // Find the admin user
    const admin = await prisma.user.findUnique({
      where: { email: "admin@school.com" },
    });

    if (!admin) {
      console.log("❌ Admin user not found!");
      return;
    }

    console.log("✅ Admin user found:");
    console.log(`   ID: ${admin.id}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Active: ${admin.isActive}`);
    console.log(`   Password Hash: ${admin.password.substring(0, 20)}...`);

    // Test password verification
    const testPassword = "admin123";
    const isValid = await bcrypt.compare(testPassword, admin.password);

    console.log(
      `\n🔐 Password test for "${testPassword}": ${
        isValid ? "✅ VALID" : "❌ INVALID"
      }`
    );

    // Count all users
    const userCount = await prisma.user.count();
    console.log(`\n👥 Total users in database: ${userCount}`);
  } catch (error) {
    console.error("❌ Error testing auth:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
