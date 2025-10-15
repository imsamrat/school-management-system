import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function unpublishOneGrade() {
  try {
    console.log("Setting one grade to unpublished (draft) for testing...\n");

    // Get the first grade
    const firstGrade = await prisma.grade.findFirst({
      include: {
        student: {
          include: {
            user: true,
          },
        },
        subject: true,
      },
    });

    if (!firstGrade) {
      console.log("No grades found");
      return;
    }

    console.log(`Found grade:`);
    console.log(`  Student: ${firstGrade.student.user.name}`);
    console.log(`  Subject: ${firstGrade.subject.name}`);
    console.log(`  Marks: ${firstGrade.obtainedMarks}/${firstGrade.maxMarks}`);
    console.log(`  Currently Published: ${firstGrade.published}`);
    console.log("");

    // Unpublish it
    const updated = await prisma.grade.update({
      where: { id: firstGrade.id },
      data: { published: false },
    });

    console.log(`✅ Grade has been set to DRAFT (published: false)`);
    console.log(`\nNow test:`);
    console.log(`1. Login as student: ${firstGrade.student.user.email}`);
    console.log(`2. Go to Student -> Grades`);
    console.log(`3. This grade should NOT appear`);
    console.log(`\nTo republish, run: npx tsx scripts/publish-all-grades.ts`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

unpublishOneGrade();
