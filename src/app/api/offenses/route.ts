import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { OffenseCategory, EndorsementStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOffenseLevel, shouldTriggerEndorsement } from "@/app/api/disciplinary/route";

// GET - Get single offense details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const offenseId = searchParams.get("id");

    if (!offenseId) {
      return NextResponse.json({ error: "Offense ID required" }, { status: 400 });
    }

    const offense = await db.disciplinaryOffense.findUnique({
      where: { id: offenseId },
      include: {
        record: true,
        processor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!offense) {
      return NextResponse.json({ error: "Offense not found" }, { status: 404 });
    }

    return NextResponse.json({ data: offense });
  } catch (error) {
    console.error("Error fetching offense:", error);
    return NextResponse.json(
      { error: "Failed to fetch offense" },
      { status: 500 }
    );
  }
}

// PATCH - Update offense
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { offenseId, description, controlNumber } = body;

    if (!offenseId) {
      return NextResponse.json({ error: "Offense ID required" }, { status: 400 });
    }

    const offense = await db.disciplinaryOffense.findUnique({
      where: { id: offenseId },
      include: { record: true },
    });

    if (!offense) {
      return NextResponse.json({ error: "Offense not found" }, { status: 404 });
    }

    const updatedOffense = await db.disciplinaryOffense.update({
      where: { id: offenseId },
      data: {
        description,
        controlNumber,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "OFFENSE_UPDATED",
        module: "DISCIPLINARY",
        recordId: offenseId,
        oldValue: JSON.stringify(offense),
        newValue: JSON.stringify(updatedOffense),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedOffense,
      message: "Offense updated successfully",
    });
  } catch (error) {
    console.error("Error updating offense:", error);
    return NextResponse.json(
      { error: "Failed to update offense" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an offense (only if it was added by mistake)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const offenseId = searchParams.get("id");

    if (!offenseId) {
      return NextResponse.json({ error: "Offense ID required" }, { status: 400 });
    }

    const offense = await db.disciplinaryOffense.findUnique({
      where: { id: offenseId },
      include: { record: true },
    });

    if (!offense) {
      return NextResponse.json({ error: "Offense not found" }, { status: 404 });
    }

    // Get the category field to decrement
    const categoryField = getCategoryField(offense.offenseCategory);
    const currentCount = offense.record[categoryField as keyof typeof offense.record] as number;

    // Delete the offense
    await db.disciplinaryOffense.delete({
      where: { id: offenseId },
    });

    // Decrement the count on the record
    await db.disciplinaryRecord.update({
      where: { id: offense.recordId },
      data: {
        [categoryField]: Math.max(0, currentCount - 1),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "OFFENSE_DELETED",
        module: "DISCIPLINARY",
        recordId: offenseId,
        oldValue: JSON.stringify(offense),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Offense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting offense:", error);
    return NextResponse.json(
      { error: "Failed to delete offense" },
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
