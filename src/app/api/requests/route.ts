import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RequestStatus, RequestType, OffenseCategory } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateControlNumber, generateTrackingToken, generateQRCode, addMonths } from "@/lib/utils";
import { sendRequestConfirmationEmail, getRequestTypeDisplayName } from "@/lib/email";
import { notifyAdminsNewRequest } from "@/lib/notifications";

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
    becomesMajorAt: 999,
  },
};

// Get color for offense based on category and count
function getOffenseColor(category: OffenseCategory, count: number): string {
  const config = offenseColorConfig[category];
  const index = Math.min(count - 1, config.colors.length - 1);
  return config.colors[Math.max(0, index)];
}

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

    const where: Record<string, unknown> = {};
    
    if (status && status !== "ALL") {
      where.status = status as RequestStatus;
    }
    
    if (type && type !== "ALL") {
      where.requestType = type as RequestType;
    }
    
    if (search) {
      where.OR = [
        { controlNumber: { contains: search, mode: "insensitive" } },
        { requestorFirstName: { contains: search, mode: "insensitive" } },
        { requestorLastName: { contains: search, mode: "insensitive" } },
        { requestorEmail: { contains: search, mode: "insensitive" } },
        { requestorStudentNo: { contains: search, mode: "insensitive" } },
      ];
    }

    const [requests, total] = await Promise.all([
      db.request.findMany({
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
      db.request.count({ where }),
    ]);

    // Fetch disciplinary records for all students in the requests
    const studentNumbers = requests.map(r => r.requestorStudentNo);
    const disciplinaryRecords = await db.disciplinaryRecord.findMany({
      where: {
        studentNumber: { in: studentNumbers },
      },
    });

    // Create a map of student numbers to disciplinary records with color info
    const disciplinaryMap = new Map<string, typeof disciplinaryRecords[0] & { colors: Record<string, string> }>();
    disciplinaryRecords.forEach(record => {
      const colors: Record<string, string> = {};
      if (record.minorCount > 0) colors.MINOR = getOffenseColor(OffenseCategory.MINOR, record.minorCount);
      if (record.majorCount > 0) colors.MAJOR = getOffenseColor(OffenseCategory.MAJOR, record.majorCount);
      if (record.lateFacultyCount > 0) colors.LATE_FACULTY_EVALUATION = getOffenseColor(OffenseCategory.LATE_FACULTY_EVALUATION, record.lateFacultyCount);
      if (record.lateRogCount > 0) colors.LATE_ACCESS_ROG = getOffenseColor(OffenseCategory.LATE_ACCESS_ROG, record.lateRogCount);
      if (record.latePaymentCount > 0) colors.LATE_PAYMENT = getOffenseColor(OffenseCategory.LATE_PAYMENT, record.latePaymentCount);
      
      disciplinaryMap.set(record.studentNumber, { ...record, colors });
    });

    // Add disciplinary info to each request
    const requestsWithDisciplinary = requests.map(request => ({
      ...request,
      disciplinaryRecord: disciplinaryMap.get(request.requestorStudentNo) || null,
    }));

    return NextResponse.json({
      data: requestsWithDisciplinary,
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

    // Validate required fields
    if (!requestType || !requestorFirstName || !requestorLastName || !requestorEmail || !requestorStudentNo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate control number and tracking token
    const prefix = requestType as string;
    const controlNumber = generateControlNumber(prefix);
    const trackingToken = generateTrackingToken();
    const qrCode = generateQRCode();

    // Create the request
    const newRequest = await db.request.create({
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

    // Send confirmation email
    const requestorFullName = `${requestorFirstName} ${requestorMiddleName ? requestorMiddleName + ' ' : ''}${requestorLastName}${requestorExtensionName ? ' ' + requestorExtensionName : ''}`;
    const requestTypeName = getRequestTypeDisplayName(requestType);
    
    // Send email and wait for result
    const emailResult = await sendRequestConfirmationEmail(requestorEmail, {
      controlNumber,
      requestType: requestTypeName,
      requestorName: requestorFullName,
      trackingToken,
      estimatedDays: getRequestTypeEstimatedDays(requestType),
    });
    
    if (emailResult.success) {
      // Update email sent timestamp
      try {
        await db.request.update({
          where: { id: newRequest.id },
          data: { emailSentAt: new Date() },
        });
      } catch (err) {
        console.error("Failed to update emailSentAt:", err);
      }
    } else {
      console.error("Failed to send confirmation email:", emailResult.error);
    }

    // Notify admins about the new request (async, don't wait)
    notifyAdminsNewRequest(controlNumber, requestTypeName, requestorFullName)
      .catch(err => console.error("Failed to notify admins:", err));

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: "Request submitted successfully. A confirmation email will be sent to " + requestorEmail,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

// PUT - Batch update requests (for admin operations)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { requestIds, status, remarks } = body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return NextResponse.json({ error: "No request IDs provided" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      status: status as RequestStatus,
      processedBy: session.user.id,
      processedAt: new Date(),
    };

    if (remarks) {
      updateData.remarks = remarks;
    }

    // If issuing, set certificate dates
    if (status === "ISSUED") {
      updateData.certificateIssuedAt = new Date();
      updateData.certificateExpiresAt = addMonths(new Date(), 6);
    }

    // Update all requests
    const updatePromises = requestIds.map(async (id) => {
      const updatedRequest = await db.request.update({
        where: { id },
        data: updateData,
        include: {
          processor: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      // Create audit log for each request
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || "Unknown",
          action: `REQUEST_${status}`,
          module: "REQUESTS",
          recordId: id,
          newValue: JSON.stringify(updatedRequest),
        },
      });

      return updatedRequest;
    });

    const updatedRequests = await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      data: updatedRequests,
      message: `${updatedRequests.length} request(s) updated successfully`,
    });
  } catch (error) {
    console.error("Error batch updating requests:", error);
    return NextResponse.json(
      { error: "Failed to update requests" },
      { status: 500 }
    );
  }
}

// Helper function to get estimated processing days by request type
function getRequestTypeEstimatedDays(requestType: string): number {
  const estimates: Record<string, number> = {
    GMC: 3,
    UER: 2,
    CDC: 2,
    CAC: 3,
  };
  return estimates[requestType] || 3;
}
