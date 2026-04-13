import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Track a request by control number or tracking token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const controlNumber = searchParams.get("controlNumber");
    const trackingToken = searchParams.get("token");

    if (!controlNumber && !trackingToken) {
      return NextResponse.json(
        { error: "Please provide a control number or tracking token" },
        { status: 400 }
      );
    }

    const where: any = {};
    if (controlNumber) {
      where.controlNumber = controlNumber;
    } else if (trackingToken) {
      where.trackingToken = trackingToken;
    }

    const req = await prisma.request.findFirst({
      where,
      select: {
        controlNumber: true,
        requestType: true,
        status: true,
        requestorFirstName: true,
        requestorLastName: true,
        requestorEmail: true,
        purpose: true,
        remarks: true,
        createdAt: true,
        updatedAt: true,
        processedAt: true,
        certificateIssuedAt: true,
        certificateExpiresAt: true,
        certificateUrl: true,
        trackingToken: true,
        qrCode: true,
      },
    });

    if (!req) {
      return NextResponse.json(
        { error: "Request not found. Please check your control number and try again." },
        { status: 404 }
      );
    }

    // Calculate status timeline
    const timeline = [
      {
        status: "SUBMITTED",
        date: req.createdAt,
        completed: true,
        label: "Request Submitted",
        description: "Your request has been received",
      },
      {
        status: "NEW",
        date: req.createdAt,
        completed: ["NEW", "PROCESSING", "ISSUED"].includes(req.status),
        label: "Under Review",
        description: "Your request is being reviewed by CSFD staff",
      },
      {
        status: "PROCESSING",
        date: req.processedAt,
        completed: ["PROCESSING", "ISSUED"].includes(req.status),
        label: "Processing",
        description: "Your request is being processed",
      },
      {
        status: "ISSUED",
        date: req.certificateIssuedAt,
        completed: req.status === "ISSUED",
        label: "Certificate Issued",
        description: req.status === "ISSUED" 
          ? "Your certificate is ready for download"
          : "Waiting for issuance",
      },
    ];

    return NextResponse.json({
      data: {
        ...req,
        timeline,
        requestorName: `${req.requestorFirstName} ${req.requestorLastName}`,
      },
    });
  } catch (error) {
    console.error("Error tracking request:", error);
    return NextResponse.json(
      { error: "Failed to track request" },
      { status: 500 }
    );
  }
}
