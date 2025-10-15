import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Unpublishing Alice Johnson's grade...\n");

  // Find Alice's grade
  const alice = await prisma.grade.findFirst({
    where: {
      student: {
        user: {
          name: "Alice Johnson",
        },
      },
    },
    include: {
      student: {
        include: { user: true },
      },
      subject: true,
    },
  });

  if (!alice) {
    console.log("Alice's grade not found");
    return;
  }

  console.log("Before:");
  console.log(`Grade ID: ${alice.id}`);
  console.log(`Student: ${alice.student.user.name}`);
  console.log(`Subject: ${alice.subject.name}`);
  console.log(`Published: ${alice.published}`);
  console.log();

  // Unpublish
  const updated = await prisma.grade.update({
    where: { id: alice.id },
    data: { published: false },
  });

  console.log("After unpublishing:");
  console.log(`Published: ${updated.published}`);
  console.log();
  console.log("✅ Alice's grade is now in DRAFT status");
  console.log("   - Admin should see: Draft badge");
  console.log("   - Alice should NOT see this grade");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
