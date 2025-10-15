import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Adding October 2025 attendance data...");

  // Get Alice's student profile
  const alice = await prisma.user.findUnique({
    where: { email: "alice@student.com" },
    include: { studentProfile: true },
  });

  if (!alice || !alice.studentProfile) {
    console.error("Alice student profile not found!");
    return;
  }

  // Get teacher profile
  const teacher = await prisma.user.findUnique({
    where: { email: "teacher@school.com" },
    include: { teacherProfile: true },
  });

  if (!teacher || !teacher.teacherProfile) {
    console.error("Teacher profile not found!");
    return;
  }

  // Get class
  const studentClass = await prisma.class.findFirst({
    where: {
      id: alice.studentProfile.classId!,
    },
  });

  if (!studentClass) {
    console.error("Class not found!");
    return;
  }

  // Get a subject for this class
  const subject = await prisma.subject.findFirst({
    where: {
      classId: studentClass.id,
    },
  });

  if (!subject) {
    console.error("No subjects found for this class!");
    return;
  }

  // Create attendance for October 1-15, 2025
  const attendanceRecords = [];
  for (let day = 1; day <= 15; day++) {
    const date = new Date(2025, 9, day); // Month is 0-indexed, so 9 = October

    // Vary the status
    let status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    if (day % 7 === 0) {
      status = "ABSENT";
    } else if (day % 5 === 0) {
      status = "LATE";
    } else {
      status = "PRESENT";
    }

    attendanceRecords.push({
      studentId: alice.studentProfile.id,
      classId: studentClass.id,
      subjectId: subject.id,
      teacherId: teacher.teacherProfile.id,
      date: date,
      status: status,
      remarks: status === "LATE" ? "Arrived 10 minutes late" : undefined,
    });
  }

  // Bulk create
  await prisma.attendance.createMany({
    data: attendanceRecords,
  });

  console.log(
    `✅ Added ${attendanceRecords.length} attendance records for October 2025!`
  );
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
