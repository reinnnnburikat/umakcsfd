import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ComplaintStatus, ComplaintCategory } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateControlNumber, generateTrackingToken } from "@/lib/utils";

// GET - List all complaints
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status as ComplaintStatus;
    }

    if (category && category !== "ALL") {
      where.category = category as ComplaintCategory;
    }

    if (search) {
      where.OR = [
        { controlNumber: { contains: search } },
        { subject: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [complaints, total] = await Promise.all([
      db.complaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          processor: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.complaint.count({ where }),
    ]);

    return NextResponse.json({
      data: complaints,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Failed to fetch complaints" },
      { status: 500 }
    );
  }
}

// POST - Create a new complaint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      complainants,
      respondents,
      complaintType,
      subject,
      description,
      dateOfIncident,
      location,
      isOngoing,
      howOften,
      witnesses,
      previousReports,
      documents,
    } = body;

    const controlNumber = generateControlNumber("CMP");
    const trackingToken = generateTrackingToken();

    const newComplaint = await db.complaint.create({
      data: {
        controlNumber,
        complainants: JSON.stringify(complainants),
        respondents: JSON.stringify(respondents),
        complaintType,
        subject,
        description,
        dateOfIncident,
        location,
        isOngoing: isOngoing || false,
        howOften,
        witnesses: witnesses ? JSON.stringify(witnesses) : null,
        previousReports,
        documents: documents ? JSON.stringify(documents) : null,
        trackingToken,
        status: ComplaintStatus.PENDING,
      },
    });

    return NextResponse.json({
      success: true,
      data: newComplaint,
      message: "Complaint submitted successfully",
    });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Failed to create complaint" },
      { status: 500 }
    );
  }
}
