import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkGradesStatus() {
  try {
    console.log("Checking grades status in database...\n");

    // Get all grades with their published status
    const grades = await prisma.grade.findMany({
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Total grades in database: ${grades.length}\n`);

    grades.forEach((grade, index) => {
      console.log(`Grade ${index + 1}:`);
      console.log(`  ID: ${grade.id}`);
      console.log(`  Student: ${grade.student.user.name}`);
      console.log(`  Subject: ${grade.subject.name} (${grade.subject.code})`);
      console.log(`  Exam Type: ${grade.examType}`);
      console.log(`  Marks: ${grade.obtainedMarks}/${grade.maxMarks}`);
      console.log(
        `  Published: ${grade.published ? "✅ YES" : "❌ NO (DRAFT)"}`
      );
      console.log(`  Created: ${grade.createdAt}`);
      console.log("");
    });

    // Summary
    const publishedCount = grades.filter((g) => g.published).length;
    const draftCount = grades.filter((g) => !g.published).length;

    console.log("Summary:");
    console.log(`  Published grades: ${publishedCount}`);
    console.log(`  Draft grades: ${draftCount}`);
  } catch (error) {
    console.error("Error checking grades:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkGradesStatus();
