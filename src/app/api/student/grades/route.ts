import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get all published grades for the student
    const grades = await db.grade.findMany({
      where: {
        studentId: studentProfile.id,
        published: true,
      },
      include: {
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

    // Calculate statistics
    const totalGrades = grades.length;

    // Calculate percentages for all grades
    const percentages = grades.map((g) => (g.obtainedMarks / g.maxMarks) * 100);

    const averagePercentage =
      totalGrades > 0
        ? parseFloat(
            (percentages.reduce((sum, p) => sum + p, 0) / totalGrades).toFixed(
              1
            )
          )
        : 0;

    const highestPercentage = totalGrades > 0 ? Math.max(...percentages) : 0;
    const lowestPercentage = totalGrades > 0 ? Math.min(...percentages) : 0;

    // Group grades by subject
    const gradesBySubject = grades.reduce((acc: any, grade) => {
      const subjectName = grade.subject?.name || "Unknown";
      const subjectCode = grade.subject?.code || "N/A";
      const key = `${subjectName}|${subjectCode}`;
      if (!acc[key]) {
        acc[key] = {
          subject: subjectName,
          subjectCode: subjectCode,
          grades: [],
        };
      }
      acc[key].grades.push(grade);
      return acc;
    }, {});

    // Calculate subject averages
    const subjectAverages = Object.values(gradesBySubject).map((data: any) => {
      const subjectGrades = data.grades;
      const totalMarks = subjectGrades.reduce(
        (sum: number, g: any) => sum + g.obtainedMarks,
        0
      );
      const totalMaxMarks = subjectGrades.reduce(
        (sum: number, g: any) => sum + g.maxMarks,
        0
      );
      const averagePercentage = (totalMarks / totalMaxMarks) * 100;
      const averageMarks = totalMarks / subjectGrades.length;

      return {
        subject: data.subject,
        subjectCode: data.subjectCode,
        averageMarks: parseFloat(averageMarks.toFixed(1)),
        averagePercentage: parseFloat(averagePercentage.toFixed(1)),
        totalGrades: subjectGrades.length,
        grade: getLetterGrade(averagePercentage),
      };
    });

    return NextResponse.json({
      stats: {
        totalGrades,
        averagePercentage,
        highestPercentage: parseFloat(highestPercentage.toFixed(1)),
        lowestPercentage: parseFloat(lowestPercentage.toFixed(1)),
        averageGrade: getLetterGrade(averagePercentage),
      },
      subjectAverages,
      grades: grades.map((grade) => ({
        id: grade.id,
        subject: grade.subject?.name || "Unknown",
        subjectCode: grade.subject?.code || "N/A",
        examType: grade.examType,
        obtainedMarks: grade.obtainedMarks,
        maxMarks: grade.maxMarks,
        percentage: parseFloat(
          ((grade.obtainedMarks / grade.maxMarks) * 100).toFixed(1)
        ),
        grade:
          grade.grade ||
          getLetterGrade((grade.obtainedMarks / grade.maxMarks) * 100),
        remarks: grade.remarks,
        date: grade.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching student grades:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to convert percentage to letter grade
function getLetterGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 85) return "A";
  if (percentage >= 80) return "A-";
  if (percentage >= 75) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 65) return "B-";
  if (percentage >= 60) return "C+";
  if (percentage >= 55) return "C";
  if (percentage >= 50) return "C-";
  if (percentage >= 45) return "D";
  return "F";
}
