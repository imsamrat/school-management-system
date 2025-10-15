import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Setting up test data for bulk operations...\n");

  // Get all grades
  const allGrades = await prisma.grade.findMany({
    include: {
      student: { include: { user: true, class: true } },
      subject: true,
    },
  });

  console.log(`Total grades in database: ${allGrades.length}\n`);

  // Show breakdown by class
  const byClass = allGrades.reduce((acc: any, grade) => {
    const className = grade.student.class
      ? `${grade.student.class.name} - ${grade.student.class.section}`
      : "No Class";
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {});

  console.log("Grades by Class:");
  Object.entries(byClass).forEach(([className, count]) => {
    console.log(`  ${className}: ${count} grades`);
  });
  console.log();

  // Show breakdown by subject
  const bySubject = allGrades.reduce((acc: any, grade) => {
    const subjectName = `${grade.subject.name} (${grade.subject.code})`;
    acc[subjectName] = (acc[subjectName] || 0) + 1;
    return acc;
  }, {});

  console.log("Grades by Subject:");
  Object.entries(bySubject).forEach(([subjectName, count]) => {
    console.log(`  ${subjectName}: ${count} grades`);
  });
  console.log();

  // Show breakdown by exam type
  const byExamType = allGrades.reduce((acc: any, grade) => {
    acc[grade.examType] = (acc[grade.examType] || 0) + 1;
    return acc;
  }, {});

  console.log("Grades by Exam Type:");
  Object.entries(byExamType).forEach(([examType, count]) => {
    console.log(`  ${examType}: ${count} grades`);
  });
  console.log();

  // Show published status
  const published = allGrades.filter((g) => g.published).length;
  const draft = allGrades.filter((g) => !g.published).length;

  console.log("Published Status:");
  console.log(`  ✅ Published: ${published} grades`);
  console.log(`  📝 Draft: ${draft} grades`);
  console.log();

  console.log("✅ Ready for testing bulk operations!");
  console.log("\nTest scenarios:");
  console.log(
    "1. Filter by Class → Bulk Publish → Check all grades in that class are published"
  );
  console.log(
    "2. Filter by Subject → Bulk Unpublish → Check all grades for that subject are draft"
  );
  console.log("3. Filter by Exam Type → Export Excel → Check file downloads");
  console.log("4. No filters → Bulk action → Confirm warning appears");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
