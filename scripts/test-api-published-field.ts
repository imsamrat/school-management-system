import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing published field from database...\n");

  // Fetch grades directly from database
  const grades = await prisma.grade.findMany({
    select: {
      id: true,
      published: true,
      student: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      subject: {
        select: {
          name: true,
        },
      },
    },
    take: 5,
  });

  console.log("Grades from database:");
  console.log("=====================");
  grades.forEach((grade, index) => {
    console.log(
      `${index + 1}. ${grade.student.user.name} - ${grade.subject.name}`
    );
    console.log(`   ID: ${grade.id}`);
    console.log(`   Published field: ${grade.published}`);
    console.log(`   Type: ${typeof grade.published}`);
    console.log();
  });

  // Test the published field with different values
  console.log("\nTesting value comparisons:");
  console.log("==========================");
  grades.forEach((grade) => {
    const student = grade.student.user.name;
    console.log(`${student}:`);
    console.log(`  grade.published === true: ${grade.published === true}`);
    console.log(`  grade.published === false: ${grade.published === false}`);
    console.log(`  grade.published !== false: ${grade.published !== false}`);
    console.log(`  (grade.published ?? true): ${grade.published ?? true}`);
    console.log();
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
