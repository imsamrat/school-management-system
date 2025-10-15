import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import * as XLSX from "xlsx";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !["ADMIN", "STAFF", "TEACHER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    const examType = searchParams.get("examType");
    const publishedOnly = searchParams.get("publishedOnly") === "true";

    // Build where clause
    const where: any = {};

    if (classId && classId !== "all") {
      where.student = {
        classId: classId,
      };
    }

    if (subjectId && subjectId !== "all") {
      where.subjectId = subjectId;
    }

    if (examType && examType !== "all") {
      where.examType = examType;
    }

    if (publishedOnly) {
      where.published = true;
    }

    console.log(`[EXCEL EXPORT] Exporting grades with filters:`, {
      classId,
      subjectId,
      examType,
      publishedOnly,
    });

    // Fetch grades
    const grades = await db.grade.findMany({
      where,
      include: {
        student: {
          select: {
            rollNo: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            class: {
              select: {
                name: true,
                section: true,
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
        teacher: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { student: { class: { name: "asc" } } },
        { student: { rollNo: "asc" } },
        { examDate: "desc" },
      ],
    });

    if (grades.length === 0) {
      return NextResponse.json(
        { error: "No grades found to export" },
        { status: 404 }
      );
    }

    console.log(`[EXCEL EXPORT] Found ${grades.length} grades to export`);

    // Prepare data for Excel
    const excelData = grades.map((grade, index) => ({
      "S.No": index + 1,
      "Roll No": grade.student.rollNo,
      "Student Name": grade.student.user.name,
      Class: grade.student.class
        ? `${grade.student.class.name} - ${grade.student.class.section}`
        : "N/A",
      Subject: `${grade.subject.name} (${grade.subject.code})`,
      "Exam Type": grade.examType,
      "Max Marks": grade.maxMarks,
      "Obtained Marks": grade.obtainedMarks,
      Percentage: `${((grade.obtainedMarks / grade.maxMarks) * 100).toFixed(
        2
      )}%`,
      Grade: grade.grade,
      Remarks: grade.remarks || "",
      Teacher: grade.teacher.user.name,
      "Exam Date": new Date(grade.examDate).toLocaleDateString(),
      Status: grade.published ? "Published" : "Draft",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    worksheet["!cols"] = [
      { wch: 6 }, // S.No
      { wch: 10 }, // Roll No
      { wch: 20 }, // Student Name
      { wch: 15 }, // Class
      { wch: 25 }, // Subject
      { wch: 12 }, // Exam Type
      { wch: 10 }, // Max Marks
      { wch: 14 }, // Obtained Marks
      { wch: 12 }, // Percentage
      { wch: 8 }, // Grade
      { wch: 30 }, // Remarks
      { wch: 20 }, // Teacher
      { wch: 12 }, // Exam Date
      { wch: 10 }, // Status
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Grades");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Generate filename
    const timestamp = new Date().toISOString().split("T")[0];
    let filename = `grades_${timestamp}`;

    if (classId && classId !== "all") {
      const classInfo = await db.class.findUnique({ where: { id: classId } });
      if (classInfo) {
        filename += `_${classInfo.name}_${classInfo.section}`;
      }
    }

    if (subjectId && subjectId !== "all") {
      const subjectInfo = await db.subject.findUnique({
        where: { id: subjectId },
      });
      if (subjectInfo) {
        filename += `_${subjectInfo.code}`;
      }
    }

    if (examType && examType !== "all") {
      filename += `_${examType}`;
    }

    filename += ".xlsx";

    console.log(
      `[EXCEL EXPORT] ✅ Exported ${grades.length} grades to ${filename}`
    );

    // Return Excel file
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[EXCEL EXPORT] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to export grades",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
