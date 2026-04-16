import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { RequestStatus, OffenseCategory } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addMonths } from "@/lib/utils";
import { sendStatusUpdateEmail, getRequestTypeDisplayName } from "@/lib/email";
import { notifyRequestStatusUpdate, notifyUsersByRole } from "@/lib/notifications";

// Color coding configuration based on offense category and count
const offenseColorConfig = {
  MINOR: {
    colors: ["#ffc400", "#ff9500", "#dc2626", "#7c3aed", "#ec4899"],
    becomesMajorAt: 3,
  },
  MAJOR: {
    colors: ["#dc2626", "#7c3aed", "#be123c", "#6b21a8", "#1e293b"],
    becomesMajorAt: 1,
  },
  LATE_FACULTY_EVALUATION: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    becomesMajorAt: 2,
  },
  LATE_ACCESS_ROG: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    becomesMajorAt: 2,
  },
  LATE_PAYMENT: {
    colors: ["#ff9500", "#dc2626", "#7c3aed", "#6366f1", "#475569"],
    becomesMajorAt: 2,
  },
  OTHER: {
    colors: ["#6b7280", "#6b7280", "#6b7280", "#6b7280", "#6b7280"],
    becomesMajorAt: 999,
  },
};

function getOffenseColor(category: OffenseCategory, count: number): string {
  const config = offenseColorConfig[category];
  const index = Math.min(count - 1, config.colors.length - 1);
  return config.colors[Math.max(0, index)];
}

// GET - Get a single request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const req = await db.request.findUnique({
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

    // Fetch disciplinary record for the student
    const disciplinaryRecord = await db.disciplinaryRecord.findUnique({
      where: { studentNumber: req.requestorStudentNo },
    });

    // Add color coding to disciplinary record
    let disciplinaryWithColors = null;
    if (disciplinaryRecord) {
      const colors: Record<string, string> = {};
      if (disciplinaryRecord.minorCount > 0) colors.MINOR = getOffenseColor(OffenseCategory.MINOR, disciplinaryRecord.minorCount);
      if (disciplinaryRecord.majorCount > 0) colors.MAJOR = getOffenseColor(OffenseCategory.MAJOR, disciplinaryRecord.majorCount);
      if (disciplinaryRecord.lateFacultyCount > 0) colors.LATE_FACULTY_EVALUATION = getOffenseColor(OffenseCategory.LATE_FACULTY_EVALUATION, disciplinaryRecord.lateFacultyCount);
      if (disciplinaryRecord.lateRogCount > 0) colors.LATE_ACCESS_ROG = getOffenseColor(OffenseCategory.LATE_ACCESS_ROG, disciplinaryRecord.lateRogCount);
      if (disciplinaryRecord.latePaymentCount > 0) colors.LATE_PAYMENT = getOffenseColor(OffenseCategory.LATE_PAYMENT, disciplinaryRecord.latePaymentCount);
      
      disciplinaryWithColors = { ...disciplinaryRecord, colors };
    }

    return NextResponse.json({ 
      data: {
        ...req,
        disciplinaryRecord: disciplinaryWithColors,
      }
    });
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
    const { status, remarks, certificateUrl } = body;

    // Get the current request to check previous status and get requestor info
    const currentRequest = await db.request.findUnique({
      where: { id },
      include: {
        processor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const previousStatus = currentRequest.status;
    const statusChanged = status && status !== previousStatus;

    const updateData: Record<string, unknown> = {};
    
    if (status) {
      updateData.status = status as RequestStatus;
    }
    
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }
    
    updateData.processedBy = session.user.id;
    updateData.processedAt = new Date();
    updateData.processorName = session.user.name || "Unknown";

    // If issuing, set certificate dates and URL
    if (status === "ISSUED") {
      updateData.certificateIssuedAt = new Date();
      updateData.certificateExpiresAt = addMonths(new Date(), 6);
      if (certificateUrl) {
        updateData.certificateUrl = certificateUrl;
      }
    }

    const updatedRequest = await db.request.update({
      where: { id },
      data: updateData,
      include: {
        processor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: statusChanged ? `REQUEST_${status}` : "REQUEST_UPDATED",
        module: "REQUESTS",
        recordId: id,
        oldValue: JSON.stringify(currentRequest),
        newValue: JSON.stringify(updatedRequest),
      },
    });

    // Send status update email if status changed
    if (statusChanged && currentRequest.requestorEmail) {
      const requestorFullName = `${currentRequest.requestorFirstName} ${currentRequest.requestorMiddleName ? currentRequest.requestorMiddleName + ' ' : ''}${currentRequest.requestorLastName}${currentRequest.requestorExtensionName ? ' ' + currentRequest.requestorExtensionName : ''}`;
      const requestTypeName = getRequestTypeDisplayName(currentRequest.requestType);
      
      // Prepare email data based on status
      const emailData: {
        controlNumber: string;
        requestType: string;
        requestorName: string;
        status: string;
        remarks?: string;
        trackingToken?: string;
        processorName?: string;
      } = {
        controlNumber: currentRequest.controlNumber,
        requestType: requestTypeName,
        requestorName: requestorFullName,
        status: status,
        remarks: remarks || currentRequest.remarks || undefined,
        trackingToken: currentRequest.trackingToken,
        processorName: session.user.name || undefined,
      };

      // Send email in background (don't block the response)
      sendStatusUpdateEmail(currentRequest.requestorEmail, emailData)
        .then(result => {
          if (result.success) {
            // Update email sent timestamp
            db.request.update({
              where: { id },
              data: { emailSentAt: new Date() },
            }).catch(err => console.error("Failed to update emailSentAt:", err));
          }
        })
        .catch(err => {
          console.error("Failed to send status update email:", err);
        });

      // Try to find the user by email to send in-app notification
      db.user.findUnique({
        where: { email: currentRequest.requestorEmail },
        select: { id: true },
      }).then(user => {
        if (user) {
          notifyRequestStatusUpdate(user.id, currentRequest.controlNumber, status, requestTypeName)
            .catch(err => console.error("Failed to notify user:", err));
        }
      }).catch(err => console.error("Failed to find user for notification:", err));
    }

    return NextResponse.json({
      success: true,
      data: updatedRequest,
      message: statusChanged 
        ? `Request ${status.toLowerCase()} successfully. Notification email sent.`
        : "Request updated successfully",
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a request (soft delete or archive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only super admin can delete requests
    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden - Super Admin only" }, { status: 403 });
    }

    const { id } = await params;

    // Get the request before deleting for audit log
    const existingRequest = await db.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Delete the request
    await db.request.delete({
      where: { id },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "REQUEST_DELETED",
        module: "REQUESTS",
        recordId: id,
        oldValue: JSON.stringify(existingRequest),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
