import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient, RequestStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { addMonths } from "@/lib/utils";
import { sendStatusUpdateEmail, getRequestTypeDisplayName } from "@/lib/email";
import { notifyRequestStatusUpdate, notifyUsersByRole } from "@/lib/notifications";

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
    const { status, remarks, certificateUrl } = body;

    // Get the current request to check previous status and get requestor info
    const currentRequest = await prisma.request.findUnique({
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

    // If issuing, set certificate dates and URL
    if (status === "ISSUED") {
      updateData.certificateIssuedAt = new Date();
      updateData.certificateExpiresAt = addMonths(new Date(), 6);
      if (certificateUrl) {
        updateData.certificateUrl = certificateUrl;
      }
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
      } = {
        controlNumber: currentRequest.controlNumber,
        requestType: requestTypeName,
        requestorName: requestorFullName,
        status: status,
        remarks: remarks || currentRequest.remarks || undefined,
        trackingToken: currentRequest.trackingToken,
      };

      // Send email in background (don't block the response)
      sendStatusUpdateEmail(currentRequest.requestorEmail, emailData)
        .then(result => {
          if (result.success) {
            // Update email sent timestamp
            prisma.request.update({
              where: { id },
              data: { emailSentAt: new Date() },
            }).catch(err => console.error("Failed to update emailSentAt:", err));
          }
        })
        .catch(err => {
          console.error("Failed to send status update email:", err);
        });

      // Try to find the user by email to send in-app notification
      prisma.user.findUnique({
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
    const existingRequest = await prisma.request.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Delete the request
    await prisma.request.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
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
