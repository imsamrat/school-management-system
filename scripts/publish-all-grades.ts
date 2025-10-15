import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function publishAllGrades() {
  try {
    console.log("Publishing all unpublished grades...");

    // Update all grades to published = true
    const result = await prisma.grade.updateMany({
      where: {
        published: false,
      },
      data: {
        published: true,
      },
    });

    console.log(`✅ Successfully published ${result.count} grades`);

    // Show summary
    const totalGrades = await prisma.grade.count();
    const publishedGrades = await prisma.grade.count({
      where: { published: true },
    });

    console.log(`\nSummary:`);
    console.log(`Total grades: ${totalGrades}`);
    console.log(`Published grades: ${publishedGrades}`);
    console.log(`Unpublished grades: ${totalGrades - publishedGrades}`);
  } catch (error) {
    console.error("Error publishing grades:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

publishAllGrades();
