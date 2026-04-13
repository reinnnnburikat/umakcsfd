import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Verify a certificate by QR code
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Verification code is required" },
        { status: 400 }
      );
    }

    const req = await db.request.findFirst({
      where: { qrCode: code },
      select: {
        controlNumber: true,
        requestType: true,
        status: true,
        requestorFirstName: true,
        requestorLastName: true,
        requestorStudentNo: true,
        requestorCollege: true,
        purpose: true,
        certificateIssuedAt: true,
        certificateExpiresAt: true,
        qrCode: true,
      },
    });

    if (!req) {
      return NextResponse.json({
        status: "NOT_FOUND",
        message: "Certificate not found",
        details: "This verification code does not match any certificate in our system. This could indicate a fraudulent document.",
      });
    }

    if (req.status !== "ISSUED") {
      return NextResponse.json({
        status: "NOT_ISSUED",
        message: "Certificate not yet issued",
        details: "This request is still being processed. Please wait for the certificate to be issued.",
        data: {
          controlNumber: req.controlNumber,
          requestType: req.requestType,
          requestorName: `${req.requestorFirstName} ${req.requestorLastName}`,
          status: req.status,
        },
      });
    }

    const now = new Date();
    const expiresAt = req.certificateExpiresAt ? new Date(req.certificateExpiresAt) : null;
    const isExpired = expiresAt ? now > expiresAt : false;

    if (isExpired) {
      return NextResponse.json({
        status: "EXPIRED",
        message: "Certificate has expired",
        details: `This certificate expired on ${expiresAt?.toLocaleDateString("en-PH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}. Please request a new certificate.`,
        data: {
          controlNumber: req.controlNumber,
          requestType: req.requestType,
          requestorName: `${req.requestorFirstName} ${req.requestorLastName}`,
          studentNumber: req.requestorStudentNo,
          college: req.requestorCollege,
          purpose: req.purpose,
          issuedAt: req.certificateIssuedAt,
          expiresAt: req.certificateExpiresAt,
        },
      });
    }

    return NextResponse.json({
      status: "VALID",
      message: "Certificate is valid",
      details: "This certificate has been verified and is authentic.",
      data: {
        controlNumber: req.controlNumber,
        requestType: req.requestType,
        requestorName: `${req.requestorFirstName} ${req.requestorLastName}`,
        studentNumber: req.requestorStudentNo,
        college: req.requestorCollege,
        purpose: req.purpose,
        issuedAt: req.certificateIssuedAt,
        expiresAt: req.certificateExpiresAt,
        qrCode: req.qrCode,
      },
    });
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return NextResponse.json(
      { error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
