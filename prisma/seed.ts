import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create admin user
  const adminPassword = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@school.com" },
    update: {},
    create: {
      email: "admin@school.com",
      name: "Admin User",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create staff user
  const staffPassword = await hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@school.com" },
    update: {},
    create: {
      email: "staff@school.com",
      name: "Staff Member",
      password: staffPassword,
      role: "STAFF",
      staffProfile: {
        create: {
          employeeId: "STF001",
          department: "Administration",
          position: "Registrar",
          phone: "+1234567890",
        },
      },
    },
  });

  // Create teacher user
  const teacherPassword = await hash("teacher123", 12);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@school.com" },
    update: {},
    create: {
      email: "teacher@school.com",
      name: "John Smith",
      password: teacherPassword,
      role: "TEACHER",
      teacherProfile: {
        create: {
          employeeId: "TCH001",
          department: "Mathematics",
          qualification: "M.Sc Mathematics",
          experience: "5 years",
          phone: "+1234567891",
        },
      },
    },
  });

  // Get the teacher profile for class assignment
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: teacher.id },
  });

  // Create classes
  const class10A = await prisma.class.upsert({
    where: {
      name_section_academicYear: {
        name: "10th Grade",
        section: "A",
        academicYear: "2024-25",
      },
    },
    update: {
      teacherId: teacherProfile?.id,
    },
    create: {
      name: "10th Grade",
      section: "A",
      academicYear: "2024-25",
      teacherId: teacherProfile?.id,
    },
  });

  const class10B = await prisma.class.upsert({
    where: {
      name_section_academicYear: {
        name: "10th Grade",
        section: "B",
        academicYear: "2024-25",
      },
    },
    update: {
      teacherId: teacherProfile?.id,
    },
    create: {
      name: "10th Grade",
      section: "B",
      academicYear: "2024-25",
      teacherId: teacherProfile?.id,
    },
  });

  // Create subjects
  const mathSubject = await prisma.subject.upsert({
    where: { code: "MATH101" },
    update: {
      teacherId: teacherProfile?.id,
    },
    create: {
      name: "Mathematics",
      code: "MATH101",
      classId: class10A.id,
      teacherId: teacherProfile?.id,
      credits: 4,
    },
  });

  // Create student users and profiles
  const studentPassword = await hash("student123", 12);

  const students = [
    {
      name: "Alice Johnson",
      email: "alice@student.com",
      rollNo: "STU001",
      parentName: "Robert Johnson",
      parentPhone: "+1234567892",
    },
    {
      name: "Bob Williams",
      email: "bob@student.com",
      rollNo: "STU002",
      parentName: "Mary Williams",
      parentPhone: "+1234567893",
    },
    {
      name: "Carol Brown",
      email: "carol@student.com",
      rollNo: "STU003",
      parentName: "David Brown",
      parentPhone: "+1234567894",
    },
    {
      name: "David Davis",
      email: "david@student.com",
      rollNo: "STU004",
      parentName: "Susan Davis",
      parentPhone: "+1234567895",
    },
    {
      name: "Eva Miller",
      email: "eva@student.com",
      rollNo: "STU005",
      parentName: "James Miller",
      parentPhone: "+1234567896",
    },
  ];

  for (const studentData of students) {
    await prisma.user.upsert({
      where: { email: studentData.email },
      update: {},
      create: {
        email: studentData.email,
        name: studentData.name,
        password: studentPassword,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNo: studentData.rollNo,
            classId: class10A.id,
            parentName: studentData.parentName,
            parentPhone: studentData.parentPhone,
            address: "123 Main St, City, State 12345",
          },
        },
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log("\n📋 Demo credentials:");
  console.log("Admin: admin@school.com / admin123");
  console.log("Staff: staff@school.com / staff123");
  console.log("Teacher: teacher@school.com / teacher123");
  console.log("Student: alice@student.com / student123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
