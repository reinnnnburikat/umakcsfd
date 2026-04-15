import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OffenseCategory, OffenseLevel, EndorsementType, EndorsementStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// Color coding configuration based on offense category and count
export const offenseColorConfig = {
  MINOR: {
    colors: ["#ffc400", "#ff9500", "#dc2626", "#7c3aed", "#ec4899"],
    labels: ["1st Offense", "2nd Offense", "3rd Offense (Major)", "4th Offense", "5th Offense"],
    becomesMajorAt: 3,
  },
  MAJOR: {
    colors: ["#dc2626", "#7c3aed", "#be123c", "#6b21a8", "#1e293b"],
    labels: ["1st Offense", "2nd Offense", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 1,
  },
  LATE_FACULTY_EVALUATION: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    labels: ["1st Offense", "2nd Offense (Major)", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 2,
  },
  LATE_ACCESS_ROG: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    labels: ["1st Offense", "2nd Offense (Major)", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 2,
  },
  LATE_PAYMENT: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    labels: ["1st Offense", "2nd Offense (Major)", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 2,
  },
  OTHER: {
    colors: ["#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280"],
    labels: ["1st Offense", "2nd Offense", "3rd Offense", "4th Offense", "5th Offense"],
    becomesMajorAt: 999, // Never becomes major
  },
};

// Get color for offense based on category and count
export function getOffenseColor(category: OffenseCategory, count: number): string {
  const config = offenseColorConfig[category];
  const index = Math.min(count - 1, config.colors.length - 1);
  return config.colors[Math.max(0, index)];
}

// Get offense level from count
export function getOffenseLevel(count: number): OffenseLevel {
  switch (count) {
    case 1: return OffenseLevel.FIRST;
    case 2: return OffenseLevel.SECOND;
    case 3: return OffenseLevel.THIRD;
    case 4: return OffenseLevel.FOURTH;
    default: return OffenseLevel.FIFTH;
  }
}

// Check if offense should trigger endorsement
export function shouldTriggerEndorsement(category: OffenseCategory, count: number): boolean {
  const config = offenseColorConfig[category];
  return count >= config.becomesMajorAt;
}

// GET - List all disciplinary records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const hasActiveOffenses = searchParams.get("hasActiveOffenses");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { studentNumber: { contains: search, mode: "insensitive" } },
        { studentName: { contains: search, mode: "insensitive" } },
        { college: { contains: search, mode: "insensitive" } },
      ];
    }

    if (hasActiveOffenses === "true") {
      where.hasActiveOffenses = true;
    }

    const [records, total] = await Promise.all([
      db.disciplinaryRecord.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          offenses: {
            orderBy: { createdAt: "desc" },
            include: {
              processor: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          clearances: {
            orderBy: { createdAt: "desc" },
            include: {
              clearedByUser: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          endorsements: {
            orderBy: { createdAt: "desc" },
            include: {
              processor: {
                select: { id: true, name: true, email: true },
              },
            },
          },
        },
      }),
      db.disciplinaryRecord.count({ where }),
    ]);

    // Add color information to each record
    const recordsWithColors = records.map((record) => {
      const colors: Record<string, string> = {};
      
      // Calculate color for each category
      if (record.minorCount > 0) {
        colors.MINOR = getOffenseColor(OffenseCategory.MINOR, record.minorCount);
      }
      if (record.majorCount > 0) {
        colors.MAJOR = getOffenseColor(OffenseCategory.MAJOR, record.majorCount);
      }
      if (record.lateFacultyCount > 0) {
        colors.LATE_FACULTY_EVALUATION = getOffenseColor(OffenseCategory.LATE_FACULTY_EVALUATION, record.lateFacultyCount);
      }
      if (record.lateRogCount > 0) {
        colors.LATE_ACCESS_ROG = getOffenseColor(OffenseCategory.LATE_ACCESS_ROG, record.lateRogCount);
      }
      if (record.latePaymentCount > 0) {
        colors.LATE_PAYMENT = getOffenseColor(OffenseCategory.LATE_PAYMENT, record.latePaymentCount);
      }

      return {
        ...record,
        colors,
      };
    });

    return NextResponse.json({
      data: recordsWithColors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching disciplinary records:", error);
    return NextResponse.json(
      { error: "Failed to fetch disciplinary records" },
      { status: 500 }
    );
  }
}

// POST - Create or update disciplinary record with new offense
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      studentNumber,
      studentName,
      college,
      course,
      yearLevel,
      offenseCategory,
      description,
      controlNumber,
      specifyOther,
    } = body;

    if (!studentNumber || !studentName || !offenseCategory) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find or create disciplinary record
    let record = await db.disciplinaryRecord.findUnique({
      where: { studentNumber },
    });

    if (!record) {
      record = await db.disciplinaryRecord.create({
        data: {
          studentNumber,
          studentName,
          college,
          course,
          yearLevel,
          hasActiveOffenses: true,
        },
      });
    }

    // Get current count for this category
    const categoryField = getCategoryField(offenseCategory as OffenseCategory);
    const currentCount = record[categoryField as keyof typeof record] as number;
    const newCount = currentCount + 1;

    // Determine offense level
    const offenseLevel = getOffenseLevel(newCount);

    // Create the offense
    const offense = await db.disciplinaryOffense.create({
      data: {
        recordId: record.id,
        offenseCategory: offenseCategory as OffenseCategory,
        offenseLevel,
        description,
        controlNumber,
        specifyOther: offenseCategory === "OTHER" ? specifyOther : null,
        processedBy: session.user.id,
        processedAt: new Date(),
        isCleared: false,
      },
    });

    // Update the record counts
    const updateData: Record<string, unknown> = {
      [categoryField]: newCount,
      hasActiveOffenses: true,
      studentName, // Update name in case it changed
      college, // Update college
    };

    await db.disciplinaryRecord.update({
      where: { id: record.id },
      data: updateData,
    });

    // Check if endorsement should be created
    if (shouldTriggerEndorsement(offenseCategory as OffenseCategory, newCount)) {
      // Check if there's already a pending endorsement
      const existingEndorsement = await db.endorsement.findFirst({
        where: {
          recordId: record.id,
          status: { in: [EndorsementStatus.PENDING, EndorsementStatus.IN_PROGRESS] },
        },
      });

      if (!existingEndorsement) {
        // Create endorsement (default to ADMINISTRATIVE_SERVICE, can be changed)
        await db.endorsement.create({
          data: {
            recordId: record.id,
            type: EndorsementType.ADMINISTRATIVE_SERVICE,
            status: EndorsementStatus.PENDING,
            triggeredByCategory: offenseCategory as OffenseCategory,
            triggeredByLevel: offenseLevel,
            details: `Triggered by ${offenseCategory} offense (${offenseLevel})`,
            hoursRequired: 20, // Default hours
          },
        });

        // Update record to show endorsed
        await db.disciplinaryRecord.update({
          where: { id: record.id },
          data: { isEndorsed: true },
        });
      }
    }

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "OFFENSE_CREATED",
        module: "DISCIPLINARY",
        recordId: offense.id,
        newValue: JSON.stringify({
          studentNumber,
          offenseCategory,
          offenseLevel,
          description,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        offense,
        record: await db.disciplinaryRecord.findUnique({
          where: { id: record.id },
          include: {
            offenses: true,
            endorsements: true,
          },
        }),
      },
      message: "Offense recorded successfully",
    });
  } catch (error) {
    console.error("Error creating offense:", error);
    return NextResponse.json(
      { error: "Failed to create offense" },
      { status: 500 }
    );
  }
}

// PUT - Clear offenses for a student
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recordId, reason } = body;

    if (!recordId || !reason) {
      return NextResponse.json(
        { error: "Record ID and reason are required" },
        { status: 400 }
      );
    }

    const record = await db.disciplinaryRecord.findUnique({
      where: { id: recordId },
      include: { offenses: true },
    });

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    // Create clearance record with snapshot of current counts
    const clearance = await db.offenseClearance.create({
      data: {
        recordId,
        clearedBy: session.user.id,
        reason,
        minorCleared: record.minorCount,
        majorCleared: record.majorCount,
        lateFacultyCleared: record.lateFacultyCount,
        lateRogCleared: record.lateRogCount,
        latePaymentCleared: record.latePaymentCount,
        otherCleared: record.otherCount,
      },
    });

    // Mark all offenses as cleared (but keep them for history)
    await db.disciplinaryOffense.updateMany({
      where: { recordId, isCleared: false },
      data: { isCleared: true, clearedAt: new Date() },
    });

    // Update the record - reset counts but keep history
    await db.disciplinaryRecord.update({
      where: { id: recordId },
      data: {
        hasActiveOffenses: false,
        isEndorsed: false,
      },
    });

    // Cancel any pending endorsements
    await db.endorsement.updateMany({
      where: {
        recordId,
        status: { in: [EndorsementStatus.PENDING, EndorsementStatus.IN_PROGRESS] },
      },
      data: { status: EndorsementStatus.CANCELLED },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "OFFENSES_CLEARED",
        module: "DISCIPLINARY",
        recordId: clearance.id,
        newValue: JSON.stringify({
          studentNumber: record.studentNumber,
          reason,
          countsCleared: {
            minor: record.minorCount,
            major: record.majorCount,
            lateFaculty: record.lateFacultyCount,
            lateRog: record.lateRogCount,
            latePayment: record.latePaymentCount,
            other: record.otherCount,
          },
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: clearance,
      message: "Offenses cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing offenses:", error);
    return NextResponse.json(
      { error: "Failed to clear offenses" },
      { status: 500 }
    );
  }
}

// Helper function to get the category field name
function getCategoryField(category: OffenseCategory): string {
  switch (category) {
    case OffenseCategory.MINOR:
      return "minorCount";
    case OffenseCategory.MAJOR:
      return "majorCount";
    case OffenseCategory.LATE_FACULTY_EVALUATION:
      return "lateFacultyCount";
    case OffenseCategory.LATE_ACCESS_ROG:
      return "lateRogCount";
    case OffenseCategory.LATE_PAYMENT:
      return "latePaymentCount";
    case OffenseCategory.OTHER:
      return "otherCount";
    default:
      return "minorCount";
  }
}
