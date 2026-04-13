/**
 * Cron Job API Endpoints for CSFD
 * 
 * This file provides API endpoints for scheduled tasks:
 * - Processing reminders (requests pending > 3 days)
 * - Daily admin summary
 * 
 * These endpoints should be called by a cron scheduler (e.g., Vercel Cron, GitHub Actions, or external cron service)
 * 
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from "next/server";
import { RequestStatus, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { 
  sendProcessingReminderEmail, 
  sendDailySummaryEmail, 
  getRequestTypeDisplayName,
  ADMIN_EMAIL 
} from "@/lib/email";

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET || "your-cron-secret-key";

// Verify cron authorization
function verifyCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");
  
  // Check either Authorization header or custom X-Cron-Secret header
  if (authHeader === `Bearer ${CRON_SECRET}` || cronHeader === CRON_SECRET) {
    return true;
  }
  
  return false;
}

/**
 * Main cron handler - routes to different tasks based on action parameter
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  
  // Verify authorization
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { error: "Unauthorized - Invalid cron secret" },
      { status: 401 }
    );
  }
  
  switch (action) {
    case "processing-reminders":
      return handleProcessingReminders();
    case "daily-summary":
      return handleDailySummary();
    case "health-check":
      return NextResponse.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        message: "Cron endpoints are operational"
      });
    default:
      return NextResponse.json(
        { error: "Invalid action. Use: processing-reminders, daily-summary, or health-check" },
        { status: 400 }
      );
  }
}

/**
 * POST handler for cron jobs (alternative to GET)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    // Verify authorization
    if (!verifyCronAuth(request)) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid cron secret" },
        { status: 401 }
      );
    }
    
    switch (action) {
      case "processing-reminders":
        return handleProcessingReminders();
      case "daily-summary":
        return handleDailySummary();
      default:
        return NextResponse.json(
          { error: "Invalid action. Use: processing-reminders or daily-summary" },
          { status: 400 }
        );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

/**
 * Handle Processing Reminders
 * 
 * Sends reminder emails for requests that have been in PROCESSING status for more than 3 days
 */
async function handleProcessingReminders(): Promise<NextResponse> {
  const logPrefix = "[CRON:PROCESSING_REMINDERS]";
  console.log(`${logPrefix} Starting processing reminders check...`);
  
  try {
    // Calculate the threshold date (3 days ago)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Find requests that have been in PROCESSING status for more than 3 days
    const overdueRequests = await db.request.findMany({
      where: {
        status: RequestStatus.PROCESSING,
        createdAt: {
          lt: threeDaysAgo,
        },
      },
    });
    
    console.log(`${logPrefix} Found ${overdueRequests.length} overdue request(s)`);
    
    if (overdueRequests.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No overdue requests found",
        processed: 0,
      });
    }
    
    // Send reminder emails
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    for (const req of overdueRequests) {
      try {
        const daysPending = Math.floor(
          (Date.now() - new Date(req.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        const requestorFullName = `${req.requestorFirstName} ${req.requestorMiddleName ? req.requestorMiddleName + ' ' : ''}${req.requestorLastName}${req.requestorExtensionName ? ' ' + req.requestorExtensionName : ''}`;
        const requestTypeName = getRequestTypeDisplayName(req.requestType);
        
        const emailResult = await sendProcessingReminderEmail(req.requestorEmail, {
          controlNumber: req.controlNumber,
          requestType: requestTypeName,
          requestorName: requestorFullName,
          trackingToken: req.trackingToken,
          daysPending,
        });
        
        if (emailResult.success) {
          results.success++;
          console.log(`${logPrefix} Sent reminder for ${req.controlNumber}`);
        } else {
          results.failed++;
          results.errors.push(`${req.controlNumber}: ${emailResult.error}`);
          console.error(`${logPrefix} Failed to send reminder for ${req.controlNumber}: ${emailResult.error}`);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`${req.controlNumber}: ${errorMsg}`);
        console.error(`${logPrefix} Error processing ${req.controlNumber}:`, error);
      }
    }
    
    console.log(`${logPrefix} Completed: ${results.success} sent, ${results.failed} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Processing reminders completed: ${results.success} sent, ${results.failed} failed`,
      processed: results.success,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to process reminders",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Handle Daily Summary
 * 
 * Sends a daily summary email to administrators with request statistics
 */
async function handleDailySummary(): Promise<NextResponse> {
  const logPrefix = "[CRON:DAILY_SUMMARY]";
  console.log(`${logPrefix} Starting daily summary...`);
  
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    
    // Get today's statistics
    const [
      newToday,
      processingCount,
      issuedToday,
      holdCount,
      rejectedToday,
      totalPending,
      overdueRequests,
      recentRequests,
    ] = await Promise.all([
      // New requests today
      db.request.count({
        where: {
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      
      // Currently in processing
      db.request.count({
        where: { status: RequestStatus.PROCESSING },
      }),
      
      // Issued today
      db.request.count({
        where: {
          certificateIssuedAt: { gte: startOfDay, lt: endOfDay },
          status: RequestStatus.ISSUED,
        },
      }),
      
      // On hold
      db.request.count({
        where: { status: RequestStatus.HOLD },
      }),
      
      // Rejected today
      db.request.count({
        where: {
          status: RequestStatus.REJECTED,
          updatedAt: { gte: startOfDay, lt: endOfDay },
        },
      }),
      
      // Total pending (NEW + PROCESSING)
      db.request.count({
        where: {
          status: { in: [RequestStatus.NEW, RequestStatus.PROCESSING] },
        },
      }),
      
      // Overdue requests (processing > 3 days)
      db.request.count({
        where: {
          status: RequestStatus.PROCESSING,
          createdAt: {
            lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Recent requests for display
      db.request.findMany({
        where: {
          createdAt: { gte: startOfDay, lt: endOfDay },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          controlNumber: true,
          requestType: true,
          requestorFirstName: true,
          requestorLastName: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);
    
    // Format date
    const dateStr = today.toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    // Format recent requests
    const formattedRecentRequests = recentRequests.map(req => ({
      controlNumber: req.controlNumber,
      requestType: req.requestType,
      requestorName: `${req.requestorFirstName} ${req.requestorLastName}`,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
    }));
    
    // Get all admin and super admin users
    const admins = await db.user.findMany({
      where: {
        role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
        status: "ACTIVE",
      },
      select: { email: true, name: true },
    });
    
    // Prepare summary data
    const summaryData = {
      date: dateStr,
      newRequests: newToday,
      processing: processingCount,
      issued: issuedToday,
      hold: holdCount,
      rejected: rejectedToday,
      totalPending,
      overdueRequests,
      recentRequests: formattedRecentRequests,
    };
    
    // Send emails to all admins
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };
    
    // Also send to the default admin email if no admins found
    const recipients = admins.length > 0 
      ? admins.map(a => a.email) 
      : [ADMIN_EMAIL];
    
    for (const email of recipients) {
      try {
        const emailResult = await sendDailySummaryEmail(email, summaryData);
        
        if (emailResult.success) {
          results.success++;
          console.log(`${logPrefix} Sent daily summary to ${email}`);
        } else {
          results.failed++;
          results.errors.push(`${email}: ${emailResult.error}`);
          console.error(`${logPrefix} Failed to send to ${email}: ${emailResult.error}`);
        }
      } catch (error) {
        results.failed++;
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        results.errors.push(`${email}: ${errorMsg}`);
        console.error(`${logPrefix} Error sending to ${email}:`, error);
      }
    }
    
    console.log(`${logPrefix} Completed: ${results.success} sent, ${results.failed} failed`);
    
    return NextResponse.json({
      success: true,
      message: `Daily summary sent to ${results.success} admin(s)`,
      date: dateStr,
      statistics: summaryData,
      recipients: results.success,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error(`${logPrefix} Error:`, error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to generate daily summary",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
