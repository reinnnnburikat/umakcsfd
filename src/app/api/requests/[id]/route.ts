import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, RequestStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { addMonths } from "@/lib/utils";

const prisma = new PrismaClient();

// GET - Get a single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const req = await prisma.request.findUnique({
      where: { id },
      include: {
        processor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ data: req });
  } catch (error) {
    console.error("Error fetching request:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

// PATCH - Update a request (process, issue, hold, reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, remarks } = body;

    const updateData: any = {
      status: status as RequestStatus,
      remarks,
      processedBy: session.user.id,
      processedAt: new Date(),
    };

    // If issuing, set certificate dates
    if (status === "ISSUED") {
      updateData.certificateIssuedAt = new Date();
      updateData.certificateExpiresAt = addMonths(new Date(), 6);
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: updateData,
      include: {
        processor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: `REQUEST_${status}`,
        module: "REQUESTS",
        recordId: id,
        newValue: JSON.stringify(updatedRequest),
        remarks,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: `Request ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}
