/**
 * Email Service for iCSFD+
 * 
 * Handles sending emails using Nodemailer with Gmail SMTP
 * Provides functions for:
 * - Request confirmation emails
 * - Status update notifications
 * - Certificate ready notifications
 * - Processing reminders
 * - Daily admin summary
 */

import * as nodemailer from 'nodemailer';
import {
  getRequestConfirmationTemplate,
  getStatusUpdateTemplate,
  getCertificateReadyTemplate,
  getRequestConfirmationPlainText,
  getStatusUpdatePlainText,
  getCertificateReadyPlainText,
  getProcessingReminderTemplate,
  getProcessingReminderPlainText,
  getDailySummaryTemplate,
  getDailySummaryPlainText,
  getProcessingEmailTemplate,
  getReadyForPickupEmailTemplate,
  getIssuedEmailTemplate,
  getHoldEmailTemplate,
  getRejectedEmailTemplate,
  REQUEST_TYPE_NAMES,
} from './email-templates';

// SMTP Configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

// Default sender
const SMTP_FROM = process.env.EMAIL_FROM || 'iCSFD+ <noreply@umak.edu.ph>';

// Admin email for daily summaries
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'csfd@umak.edu.ph';

// Email logger
function logEmail(action: string, details: Record<string, unknown>): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [EMAIL] ${action}:`, JSON.stringify(details));
}

// Create transporter (reusable or create new each time)
function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    auth: SMTP_CONFIG.auth,
    // Gmail specific settings
    tls: {
      ciphers: 'SSLv3',
    },
  });
}

// Check if SMTP is configured
function isSmtpConfigured(): boolean {
  return !!(SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass);
}

// Verify SMTP connection
export async function verifySmtpConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logEmail('SMTP_VERIFY', { success: true });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEmail('SMTP_VERIFY_ERROR', { success: false, error: errorMessage });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send Request Confirmation Email
 * 
 * Called when a new request is submitted
 */
export async function sendRequestConfirmationEmail(
  email: string,
  data: {
    controlNumber: string;
    requestType: string;
    requestorName: string;
    trackingToken: string;
    estimatedDays?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  const emailData = {
    to: email,
    from: SMTP_FROM,
    subject: `[iCSFD+] Request Submitted - ${data.controlNumber}`,
    html: getRequestConfirmationTemplate(data),
    text: getRequestConfirmationPlainText(data),
  };

  logEmail('SEND_CONFIRMATION', {
    to: email,
    controlNumber: data.controlNumber,
    requestType: requestTypeName,
  });

  try {
    // Check if SMTP credentials are configured
    if (!isSmtpConfigured()) {
      logEmail('SMTP_NOT_CONFIGURED', { to: email });
      return { 
        success: false, 
        error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    
    const info = await transporter.sendMail(emailData);
    
    logEmail('SEND_CONFIRMATION_SUCCESS', {
      to: email,
      messageId: info.messageId,
      response: info.response,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEmail('SEND_CONFIRMATION_ERROR', {
      to: email,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send Status Update Email
 * 
 * Called when request status changes
 */
export async function sendStatusUpdateEmail(
  email: string,
  data: {
    controlNumber: string;
    requestType: string;
    requestorName: string;
    status: string;
    remarks?: string;
    trackingToken?: string;
    processorName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  // Add tracking token to template data
  const templateData = {
    ...data,
    trackingToken: data.trackingToken || '',
    processorName: data.processorName,
  };

  // Generate appropriate subject based on status
  let subject = `[iCSFD+] Status Update - ${data.controlNumber}`;
  switch (data.status) {
    case 'PROCESSING':
      subject = `[iCSFD+] Your Request is Being Processed - ${data.controlNumber}`;
      break;
    case 'READY_FOR_PICKUP':
      subject = `[iCSFD+] Certificate Ready for Pickup! - ${data.controlNumber}`;
      break;
    case 'ISSUED':
      subject = `[iCSFD+] Certificate Issued - ${data.controlNumber}`;
      break;
    case 'HOLD':
      subject = `[iCSFD+] Action Required - Request On Hold - ${data.controlNumber}`;
      break;
    case 'REJECTED':
      subject = `[iCSFD+] Request Rejected - ${data.controlNumber}`;
      break;
  }

  const emailData = {
    to: email,
    from: SMTP_FROM,
    subject,
    html: getStatusUpdateTemplate(templateData),
    text: getStatusUpdatePlainText(templateData),
  };

  logEmail('SEND_STATUS_UPDATE', {
    to: email,
    controlNumber: data.controlNumber,
    status: data.status,
  });

  try {
    // Check if SMTP credentials are configured
    if (!isSmtpConfigured()) {
      logEmail('SMTP_NOT_CONFIGURED', { to: email });
      return { 
        success: false, 
        error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    
    const info = await transporter.sendMail(emailData);
    
    logEmail('SEND_STATUS_UPDATE_SUCCESS', {
      to: email,
      messageId: info.messageId,
      response: info.response,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEmail('SEND_STATUS_UPDATE_ERROR', {
      to: email,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send Certificate Ready Email
 * 
 * Called when certificate is issued and ready for claiming
 */
export async function sendCertificateReadyEmail(
  email: string,
  data: {
    controlNumber: string;
    requestType: string;
    requestorName: string;
    claimLocation: string;
    validUntil?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  const emailData = {
    to: email,
    from: SMTP_FROM,
    subject: `[iCSFD+] Certificate Ready - ${data.controlNumber}`,
    html: getCertificateReadyTemplate(data),
    text: getCertificateReadyPlainText(data),
  };

  logEmail('SEND_CERTIFICATE_READY', {
    to: email,
    controlNumber: data.controlNumber,
    requestType: requestTypeName,
  });

  try {
    // Check if SMTP credentials are configured
    if (!isSmtpConfigured()) {
      logEmail('SMTP_NOT_CONFIGURED', { to: email });
      return { 
        success: false, 
        error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    
    const info = await transporter.sendMail(emailData);
    
    logEmail('SEND_CERTIFICATE_READY_SUCCESS', {
      to: email,
      messageId: info.messageId,
      response: info.response,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEmail('SEND_CERTIFICATE_READY_ERROR', {
      to: email,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send Processing Reminder Email
 * 
 * Sent for requests pending > 3 days
 */
export async function sendProcessingReminderEmail(
  email: string,
  data: {
    controlNumber: string;
    requestType: string;
    requestorName: string;
    trackingToken?: string;
    daysPending: number;
  }
): Promise<{ success: boolean; error?: string }> {
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  const emailData = {
    to: email,
    from: SMTP_FROM,
    subject: `[iCSFD+] Request Processing Update - ${data.controlNumber}`,
    html: getProcessingReminderTemplate(data),
    text: getProcessingReminderPlainText(data),
  };

  logEmail('SEND_PROCESSING_REMINDER', {
    to: email,
    controlNumber: data.controlNumber,
    daysPending: data.daysPending,
  });

  try {
    // Check if SMTP credentials are configured
    if (!isSmtpConfigured()) {
      logEmail('SMTP_NOT_CONFIGURED', { to: email });
      return { 
        success: false, 
        error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    
    const info = await transporter.sendMail(emailData);
    
    logEmail('SEND_PROCESSING_REMINDER_SUCCESS', {
      to: email,
      messageId: info.messageId,
      response: info.response,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEmail('SEND_PROCESSING_REMINDER_ERROR', {
      to: email,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send Daily Summary Email to Admins
 * 
 * Sent daily to administrators with request statistics
 */
export async function sendDailySummaryEmail(
  email: string,
  data: {
    date: string;
    newRequests: number;
    processing: number;
    issued: number;
    hold: number;
    rejected: number;
    totalPending: number;
    overdueRequests: number;
    recentRequests: Array<{
      controlNumber: string;
      requestType: string;
      requestorName: string;
      status: string;
      createdAt: string;
    }>;
  }
): Promise<{ success: boolean; error?: string }> {
  const emailData = {
    to: email,
    from: SMTP_FROM,
    subject: `[iCSFD+] Daily Summary - ${data.date}`,
    html: getDailySummaryTemplate(data),
    text: getDailySummaryPlainText(data),
  };

  logEmail('SEND_DAILY_SUMMARY', {
    to: email,
    date: data.date,
    totalPending: data.totalPending,
  });

  try {
    // Check if SMTP credentials are configured
    if (!isSmtpConfigured()) {
      logEmail('SMTP_NOT_CONFIGURED', { to: email });
      return { 
        success: false, 
        error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    
    const info = await transporter.sendMail(emailData);
    
    logEmail('SEND_DAILY_SUMMARY_SUCCESS', {
      to: email,
      messageId: info.messageId,
      response: info.response,
    });

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEmail('SEND_DAILY_SUMMARY_ERROR', {
      to: email,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Send a test email (for configuration verification)
 */
export async function sendTestEmail(
  toEmail: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  logEmail('SEND_TEST', { to: toEmail });

  try {
    // Check if SMTP credentials are configured
    if (!isSmtpConfigured()) {
      logEmail('SMTP_NOT_CONFIGURED', { to: toEmail });
      return { 
        success: false, 
        error: 'SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.' 
      };
    }

    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      to: toEmail,
      from: SMTP_FROM,
      subject: '[iCSFD+] Test Email - Configuration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #111c4e;">Email Configuration Test</h2>
          <p>This is a test email from the iCSFD+ system.</p>
          <p>If you received this email, your SMTP configuration is working correctly.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">
            Sent at: ${new Date().toLocaleString('en-PH')}<br>
            From: ${SMTP_FROM}
          </p>
        </div>
      `,
      text: `
Email Configuration Test

This is a test email from the iCSFD+ system.
If you received this email, your SMTP configuration is working correctly.

Sent at: ${new Date().toLocaleString('en-PH')}
From: ${SMTP_FROM}
      `.trim(),
    });
    
    logEmail('SEND_TEST_SUCCESS', {
      to: toEmail,
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logEmail('SEND_TEST_ERROR', {
      to: toEmail,
      error: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Get request type display name
 */
export function getRequestTypeDisplayName(type: string): string {
  return REQUEST_TYPE_NAMES[type] || type;
}

// Export types for use in other modules
export type RequestConfirmationData = Parameters<typeof sendRequestConfirmationEmail>[1];
export type StatusUpdateData = Parameters<typeof sendStatusUpdateEmail>[1];
export type CertificateReadyData = Parameters<typeof sendCertificateReadyEmail>[1];
export type ProcessingReminderData = Parameters<typeof sendProcessingReminderEmail>[1];
export type DailySummaryData = Parameters<typeof sendDailySummaryEmail>[1];

// Export admin email constant
export { ADMIN_EMAIL };
