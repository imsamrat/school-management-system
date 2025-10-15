import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Testing grade toggle functionality...\n");

  // Get the first grade
  const grade = await prisma.grade.findFirst({
    include: {
      student: { include: { user: true } },
      subject: true,
    },
  });

  if (!grade) {
    console.log("No grades found in database");
    return;
  }

  console.log("Before toggle:");
  console.log(`Grade ID: ${grade.id}`);
  console.log(`Student: ${grade.student.user.name}`);
  console.log(`Subject: ${grade.subject.name}`);
  console.log(`Published: ${grade.published}`);
  console.log();

  // Toggle the published status
  const newStatus = !grade.published;
  console.log(`Toggling to: ${newStatus}\n`);

  const updated = await prisma.grade.update({
    where: { id: grade.id },
    data: { published: newStatus },
    include: {
      student: { include: { user: true } },
      subject: true,
    },
  });

  console.log("After toggle:");
  console.log(`Grade ID: ${updated.id}`);
  console.log(`Student: ${updated.student.user.name}`);
  console.log(`Subject: ${updated.subject.name}`);
  console.log(`Published: ${updated.published}`);
  console.log();

  // Verify by fetching again
  const verified = await prisma.grade.findUnique({
    where: { id: grade.id },
  });

  console.log("Verification fetch:");
  console.log(`Published: ${verified?.published}`);
  console.log();

  if (verified?.published === newStatus) {
    console.log("✅ Toggle successful! Database updated correctly.");
  } else {
    console.log("❌ Toggle failed! Database not updated.");
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
