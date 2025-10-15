import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTestAttendance() {
  try {
    console.log("Creating test attendance data...");

    // Get existing data
    const students = await prisma.studentProfile.findMany({
      include: { user: true },
    });

    const teachers = await prisma.teacherProfile.findMany({
      include: { user: true },
    });

    const classes = await prisma.class.findMany();

    const subjects = await prisma.subject.findMany();

    if (
      students.length === 0 ||
      teachers.length === 0 ||
      classes.length === 0
    ) {
      console.log(
        "No students, teachers, or classes found. Please run the seed script first."
      );
      return;
    }

    // Create attendance records for the last 30 days
    const today = new Date();
    const attendanceRecords = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      // Create attendance for each student
      for (const student of students) {
        for (const classItem of classes) {
          // Random chance for different attendance status
          const random = Math.random();
          let status = "PRESENT";

          if (random < 0.05) status = "ABSENT";
          else if (random < 0.08) status = "LATE";
          else if (random < 0.02) status = "EXCUSED";

          // Get a random subject for this class
          const classSubjects = subjects.filter(
            (s: any) => s.classId === classItem.id
          );
          const subject =
            classSubjects.length > 0
              ? classSubjects[Math.floor(Math.random() * classSubjects.length)]
              : null;

          // Get a random teacher
          const teacher = teachers[Math.floor(Math.random() * teachers.length)];

          attendanceRecords.push({
            studentId: student.id,
            teacherId: teacher.id,
            classId: classItem.id,
            subjectId: subject?.id,
            date: date.toISOString().split("T")[0],
            status,
            remarks:
              status === "LATE"
                ? "Arrived 10 minutes late"
                : status === "EXCUSED"
                ? "Medical appointment"
                : null,
          });
        }
      }
    }

    console.log(`Creating ${attendanceRecords.length} attendance records...`);

    // Create attendance records in batches
    const batchSize = 100;
    for (let i = 0; i < attendanceRecords.length; i += batchSize) {
      const batch = attendanceRecords.slice(i, i + batchSize);
      await prisma.attendance.createMany({
        data: batch,
        skipDuplicates: true,
      });
    }

    console.log("✅ Test attendance data created successfully!");

    // Display some statistics
    const totalAttendance = await prisma.attendance.count();
    const presentCount = await prisma.attendance.count({
      where: { status: "PRESENT" },
    });
    const absentCount = await prisma.attendance.count({
      where: { status: "ABSENT" },
    });

    console.log("\nAttendance Statistics:");
    console.log(`Total Records: ${totalAttendance}`);
    console.log(`Present: ${presentCount}`);
    console.log(`Absent: ${absentCount}`);
    console.log(
      `Attendance Rate: ${((presentCount / totalAttendance) * 100).toFixed(1)}%`
    );
  } catch (error) {
    console.error("Error creating test attendance:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAttendance();
