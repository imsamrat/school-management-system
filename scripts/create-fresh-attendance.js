const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function createFreshAttendance() {
  try {
    console.log("Creating fresh attendance data...");

    // Clear existing attendance
    await prisma.attendance.deleteMany({});
    console.log("Cleared existing attendance records");

    // Get required data
    const students = await prisma.studentProfile.findMany({
      include: { user: true },
    });

    const teacher = await prisma.teacherProfile.findFirst({
      include: { user: true },
    });

    const classes = await prisma.class.findMany();
    const subjects = await prisma.subject.findMany();

    if (students.length === 0 || !teacher || classes.length === 0) {
      console.log("Missing required data. Please run the seed script first.");
      return;
    }

    console.log(`Found ${students.length} students, ${classes.length} classes`);

    // Create attendance for last 15 days (school days only)
    const today = new Date();
    const attendanceRecords = [];

    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Create attendance for each student in first class only
      for (const student of students) {
        const random = Math.random();
        let status = "PRESENT";

        if (random < 0.1) status = "ABSENT";
        else if (random < 0.15) status = "LATE";

        const subject = subjects.length > 0 ? subjects[0] : null;

        attendanceRecords.push({
          studentId: student.id,
          teacherId: teacher.id,
          classId: classes[0].id,
          subjectId: subject?.id,
          date: date.toISOString(),
          status,
          remarks: status === "LATE" ? "Arrived late" : null,
        });
      }
    }

    console.log(`Creating ${attendanceRecords.length} attendance records...`);

    // Create all records
    for (const record of attendanceRecords) {
      await prisma.attendance.create({
        data: record,
      });
    }

    console.log("✅ Fresh attendance data created successfully!");

    // Show statistics
    const totalAttendance = await prisma.attendance.count();
    const presentCount = await prisma.attendance.count({
      where: { status: "PRESENT" },
    });
    const absentCount = await prisma.attendance.count({
      where: { status: "ABSENT" },
    });

    console.log("\n📊 Attendance Statistics:");
    console.log(`Total Records: ${totalAttendance}`);
    console.log(`Present: ${presentCount}`);
    console.log(`Absent: ${absentCount}`);
    console.log(
      `Attendance Rate: ${
        totalAttendance > 0
          ? ((presentCount / totalAttendance) * 100).toFixed(1)
          : 0
      }%`
    );
  } catch (error) {
    console.error("Error creating attendance:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createFreshAttendance();
