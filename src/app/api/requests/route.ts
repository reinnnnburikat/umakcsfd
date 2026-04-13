import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, RequestStatus, RequestType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { generateControlNumber, generateTrackingToken, generateQRCode, addMonths } from "@/lib/utils";

const prisma = new PrismaClient();

// GET - List all requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status && status !== "ALL") {
      where.status = status as RequestStatus;
    }
    
    if (type && type !== "ALL") {
      where.requestType = type as RequestType;
    }
    
    if (search) {
      where.OR = [
        { controlNumber: { contains: search } },
        { requestorFirstName: { contains: search } },
        { requestorLastName: { contains: search } },
        { requestorEmail: { contains: search } },
        { requestorStudentNo: { contains: search } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
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
      prisma.request.count({ where }),
    ]);

    return NextResponse.json({
      data: requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// POST - Create a new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      requestType,
      requestorFirstName,
      requestorMiddleName,
      requestorLastName,
      requestorExtensionName,
      requestorEmail,
      requestorPhone,
      requestorStudentNo,
      requestorCollege,
      requestorCourse,
      requestorYearLevel,
      requestorSex,
      classification,
      yearGraduated,
      purpose,
      otherPurpose,
      additionalData,
      documents,
    } = body;

    // Generate control number and tracking token
    const prefix = requestType as string;
    const controlNumber = generateControlNumber(prefix);
    const trackingToken = generateTrackingToken();
    const qrCode = generateQRCode();

    const newRequest = await prisma.request.create({
      data: {
        controlNumber,
        requestType: requestType as RequestType,
        status: RequestStatus.NEW,
        requestorFirstName,
        requestorMiddleName,
        requestorLastName,
        requestorExtensionName,
        requestorEmail,
        requestorPhone,
        requestorStudentNo,
        requestorCollege,
        requestorCourse,
        requestorYearLevel,
        requestorSex,
        classification,
        yearGraduated,
        purpose,
        otherPurpose,
        additionalData: additionalData ? JSON.stringify(additionalData) : null,
        documents: documents ? JSON.stringify(documents) : null,
        trackingToken,
        qrCode,
      },
    });

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: "Request submitted successfully",
    });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}
