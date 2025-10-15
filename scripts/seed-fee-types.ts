import { PrismaClient, FeeCategory, FeeFrequency } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding fee types...");

  // Default fee types
  const feeTypes = [
    {
      name: "Tuition Fee",
      code: "TUITION",
      category: FeeCategory.ACADEMIC,
      isRecurring: true,
      description: "Monthly tuition fee for regular classes",
    },
    {
      name: "Admission Fee",
      code: "ADMISSION",
      category: FeeCategory.ACADEMIC,
      isRecurring: false,
      description: "One-time admission fee for new students",
    },
    {
      name: "Exam Fee",
      code: "EXAM",
      category: FeeCategory.ACADEMIC,
      isRecurring: false,
      description: "Examination fee for term exams",
    },
    {
      name: "Library Fee",
      code: "LIBRARY",
      category: FeeCategory.FACILITY,
      isRecurring: false,
      description: "Annual library maintenance and book fee",
    },
    {
      name: "Lab Fee",
      code: "LAB",
      category: FeeCategory.FACILITY,
      isRecurring: false,
      description: "Laboratory equipment and materials fee",
    },
    {
      name: "Sports Fee",
      code: "SPORTS",
      category: FeeCategory.FACILITY,
      isRecurring: false,
      description: "Sports activities and equipment fee",
    },
    {
      name: "Transport Fee",
      code: "TRANSPORT",
      category: FeeCategory.TRANSPORT,
      isRecurring: true,
      description: "Monthly transportation fee",
    },
    {
      name: "Computer Lab Fee",
      code: "COMPUTER",
      category: FeeCategory.FACILITY,
      isRecurring: false,
      description: "Computer lab usage and maintenance fee",
    },
    {
      name: "Development Fee",
      code: "DEVELOPMENT",
      category: FeeCategory.OTHER,
      isRecurring: false,
      description: "School development and infrastructure fee",
    },
    {
      name: "Late Fee",
      code: "LATE_FEE",
      category: FeeCategory.OTHER,
      isRecurring: false,
      description: "Penalty for late payment",
    },
    {
      name: "Annual Fee",
      code: "ANNUAL",
      category: FeeCategory.ACADEMIC,
      isRecurring: false,
      description: "Annual charges for the academic year",
    },
    {
      name: "Activity Fee",
      code: "ACTIVITY",
      category: FeeCategory.OTHER,
      isRecurring: false,
      description: "Co-curricular and extra-curricular activities fee",
    },
  ];

  for (const feeType of feeTypes) {
    await prisma.feeType.upsert({
      where: { code: feeType.code },
      update: {},
      create: feeType,
    });
  }

  console.log("✅ Fee types seeded successfully!");

  // Now create sample fee structures for existing classes
  const classes = await prisma.class.findMany();

  if (classes.length > 0) {
    console.log("\n🏫 Creating sample fee structures for classes...");

    const tuitionFeeType = await prisma.feeType.findUnique({
      where: { code: "TUITION" },
    });
    const admissionFeeType = await prisma.feeType.findUnique({
      where: { code: "ADMISSION" },
    });
    const examFeeType = await prisma.feeType.findUnique({
      where: { code: "EXAM" },
    });
    const libraryFeeType = await prisma.feeType.findUnique({
      where: { code: "LIBRARY" },
    });

    for (const classData of classes) {
      // Tuition Fee (Monthly) - varies by class
      if (tuitionFeeType) {
        await prisma.feeStructure.upsert({
          where: {
            classId_feeTypeId_academicYear: {
              classId: classData.id,
              feeTypeId: tuitionFeeType.id,
              academicYear: "2024-25",
            },
          },
          update: {},
          create: {
            classId: classData.id,
            feeTypeId: tuitionFeeType.id,
            amount: classData.name.includes("10")
              ? 5000
              : classData.name.includes("9")
              ? 4500
              : 4000,
            frequency: FeeFrequency.MONTHLY,
            academicYear: "2024-25",
            description: `Monthly tuition fee for ${classData.name} - Section ${classData.section}`,
          },
        });
      }

      // Admission Fee (One-time)
      if (admissionFeeType) {
        await prisma.feeStructure.upsert({
          where: {
            classId_feeTypeId_academicYear: {
              classId: classData.id,
              feeTypeId: admissionFeeType.id,
              academicYear: "2024-25",
            },
          },
          update: {},
          create: {
            classId: classData.id,
            feeTypeId: admissionFeeType.id,
            amount: 2000,
            frequency: FeeFrequency.ONE_TIME,
            academicYear: "2024-25",
            description: `One-time admission fee for ${classData.name}`,
          },
        });
      }

      // Exam Fee (Yearly)
      if (examFeeType) {
        await prisma.feeStructure.upsert({
          where: {
            classId_feeTypeId_academicYear: {
              classId: classData.id,
              feeTypeId: examFeeType.id,
              academicYear: "2024-25",
            },
          },
          update: {},
          create: {
            classId: classData.id,
            feeTypeId: examFeeType.id,
            amount: 1000,
            frequency: FeeFrequency.YEARLY,
            academicYear: "2024-25",
            description: `Annual examination fee for ${classData.name}`,
          },
        });
      }

      // Library Fee (Yearly)
      if (libraryFeeType) {
        await prisma.feeStructure.upsert({
          where: {
            classId_feeTypeId_academicYear: {
              classId: classData.id,
              feeTypeId: libraryFeeType.id,
              academicYear: "2024-25",
            },
          },
          update: {},
          create: {
            classId: classData.id,
            feeTypeId: libraryFeeType.id,
            amount: 500,
            frequency: FeeFrequency.YEARLY,
            academicYear: "2024-25",
            description: `Annual library fee for ${classData.name}`,
          },
        });
      }
    }

    console.log("✅ Sample fee structures created!");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding fee types:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
