/**
 * Email Templates for iCSFD+
 * 
 * Provides HTML email templates with UMAK branding
 * - Navy Blue: #111c4e
 * - Gold: #ffc400
 */

// Brand colors
const COLORS = {
  navyBlue: '#111c4e',
  gold: '#ffc400',
  white: '#ffffff',
  lightGray: '#f4f4f5',
  darkGray: '#374151',
  mediumGray: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

// Base URL for tracking links (from environment)
const getBaseUrl = (): string => {
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

// Request type display names
const REQUEST_TYPE_NAMES: Record<string, string> = {
  GMC: 'Good Moral Certificate',
  UER: 'Uniform Exemption Request',
  CDC: 'Cross-Dressing Clearance',
  CAC: 'Child Admission Clearance',
};

// Estimated processing days by request type
const ESTIMATED_PROCESSING_DAYS: Record<string, number> = {
  GMC: 3,
  UER: 2,
  CDC: 2,
  CAC: 3,
};

// Get UMAK logo URL (for email, use public URL)
const getUmakLogoUrl = (): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/logos/UMAK LOGO.png`;
};

// Get CSFD logo URL
const getCsfdLogoUrl = (): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/logos/CSFD LOGO.png`;
};

// Common email header with UMAK branding
const getEmailHeader = (title: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    /* Reset styles */
    body, html {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: ${COLORS.darkGray};
      background-color: #f0f0f0;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: ${COLORS.white};
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* Header */
    .email-header {
      background: linear-gradient(135deg, ${COLORS.navyBlue} 0%, #1a2d6b 100%);
      padding: 25px 20px;
      text-align: center;
    }
    
    .logo-container {
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }
    
    .umak-logo {
      width: 70px;
      height: 70px;
      object-fit: contain;
      background-color: ${COLORS.white};
      border-radius: 50%;
      padding: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .csfd-logo {
      width: 60px;
      height: 60px;
      object-fit: contain;
      background-color: ${COLORS.white};
      border-radius: 50%;
      padding: 5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .logo-fallback {
      width: 70px;
      height: 70px;
      background-color: ${COLORS.white};
      border-radius: 50%;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    .logo-text {
      color: ${COLORS.navyBlue};
      font-size: 12px;
      font-weight: bold;
      text-align: center;
    }
    
    .header-title {
      color: ${COLORS.white};
      font-size: 22px;
      font-weight: 600;
      margin: 0;
    }
    
    .header-subtitle {
      color: ${COLORS.gold};
      font-size: 13px;
      margin-top: 5px;
      font-weight: 500;
    }
    
    .csfd-branding {
      display: inline-block;
      background-color: rgba(255, 196, 0, 0.15);
      padding: 4px 12px;
      border-radius: 15px;
      margin-top: 10px;
    }
    
    .csfd-branding-text {
      color: ${COLORS.gold};
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 1px;
    }
    
    /* Content */
    .email-content {
      padding: 30px 20px;
    }
    
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: ${COLORS.darkGray};
    }
    
    .message {
      font-size: 15px;
      margin-bottom: 20px;
      color: ${COLORS.mediumGray};
    }
    
    /* Info Box */
    .info-box {
      background-color: ${COLORS.lightGray};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid ${COLORS.navyBlue};
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    
    .info-row:last-child {
      margin-bottom: 0;
    }
    
    .info-label {
      font-weight: 600;
      color: ${COLORS.navyBlue};
      font-size: 14px;
    }
    
    .info-value {
      color: ${COLORS.darkGray};
      font-size: 14px;
      text-align: right;
      word-break: break-word;
    }
    
    /* Control Number Highlight */
    .control-number-box {
      background: linear-gradient(135deg, ${COLORS.navyBlue} 0%, #1a2d6b 100%);
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    
    .control-number-label {
      color: ${COLORS.gold};
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    
    .control-number-value {
      color: ${COLORS.white};
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 2px;
    }
    
    /* Button */
    .button-container {
      text-align: center;
      margin: 25px 0;
    }
    
    .track-button {
      display: inline-block;
      background: linear-gradient(135deg, ${COLORS.navyBlue} 0%, #1a2d6b 100%);
      color: ${COLORS.white};
      padding: 14px 32px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 6px rgba(17, 28, 78, 0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .track-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(17, 28, 78, 0.4);
    }
    
    .download-button {
      display: inline-block;
      background: linear-gradient(135deg, ${COLORS.success} 0%, #059669 100%);
      color: ${COLORS.white};
      padding: 14px 32px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
      margin: 0 5px;
    }
    
    /* Status Badge */
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-new {
      background-color: #dbeafe;
      color: #1d4ed8;
    }
    
    .status-processing {
      background-color: #fef3c7;
      color: #b45309;
    }
    
    .status-ready {
      background-color: #d1fae5;
      color: #047857;
    }
    
    .status-issued {
      background-color: #d1fae5;
      color: #047857;
    }
    
    .status-hold {
      background-color: #e5e7eb;
      color: #374151;
    }
    
    .status-rejected {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    /* Alert Box */
    .alert-box {
      background-color: #fffbeb;
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    
    .alert-title {
      color: #92400e;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .alert-text {
      color: #a16207;
      font-size: 13px;
    }
    
    /* Success Box */
    .success-box {
      background-color: #ecfdf5;
      border: 1px solid #10b981;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    
    .success-title {
      color: #047857;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .success-text {
      color: #065f46;
      font-size: 13px;
    }
    
    /* Error Box */
    .error-box {
      background-color: #fef2f2;
      border: 1px solid #ef4444;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    
    .error-title {
      color: #991b1b;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .error-text {
      color: #b91c1c;
      font-size: 13px;
    }
    
    /* Info Box Special */
    .info-box-special {
      background-color: #eff6ff;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    }
    
    .info-box-special-title {
      color: #1d4ed8;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .info-box-special-text {
      color: #1e40af;
      font-size: 13px;
    }
    
    /* Divider */
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 20px 0;
    }
    
    /* Timeline */
    .timeline {
      margin: 20px 0;
      padding-left: 20px;
    }
    
    .timeline-item {
      position: relative;
      padding-left: 25px;
      margin-bottom: 15px;
    }
    
    .timeline-item:before {
      content: '';
      position: absolute;
      left: 0;
      top: 6px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${COLORS.navyBlue};
    }
    
    .timeline-item.pending:before {
      background-color: ${COLORS.gold};
    }
    
    .timeline-item-text {
      font-size: 14px;
      color: ${COLORS.darkGray};
    }
    
    /* Contact Box */
    .contact-box {
      background-color: ${COLORS.lightGray};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    
    .contact-title {
      color: ${COLORS.navyBlue};
      font-weight: 600;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .contact-item {
      font-size: 13px;
      color: ${COLORS.darkGray};
      margin: 5px 0;
    }
    
    .contact-item a {
      color: ${COLORS.navyBlue};
      text-decoration: none;
    }
    
    /* Footer */
    .email-footer {
      background-color: ${COLORS.lightGray};
      padding: 25px 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      color: ${COLORS.mediumGray};
      font-size: 12px;
      margin-bottom: 10px;
    }
    
    .footer-link {
      color: ${COLORS.navyBlue};
      text-decoration: none;
      font-weight: 500;
    }
    
    .footer-address {
      color: ${COLORS.mediumGray};
      font-size: 11px;
      margin-top: 15px;
      line-height: 1.5;
    }
    
    .social-links {
      margin: 15px 0;
    }
    
    .social-link {
      display: inline-block;
      width: 32px;
      height: 32px;
      background-color: ${COLORS.navyBlue};
      border-radius: 50%;
      margin: 0 5px;
      line-height: 32px;
      text-align: center;
      color: ${COLORS.white};
      text-decoration: none;
      font-size: 14px;
    }
    
    /* Processor Info Box */
    .processor-box {
      background-color: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 15px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .processor-icon {
      width: 36px;
      height: 36px;
      background-color: #0ea5e9;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
    }
    
    .processor-info {
      flex: 1;
    }
    
    .processor-label {
      font-size: 11px;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .processor-name {
      font-size: 14px;
      color: #0c4a6e;
      font-weight: 600;
    }
    
    /* Responsive */
    @media only screen and (max-width: 480px) {
      .email-container {
        border-radius: 0;
      }
      
      .email-header {
        padding: 20px 15px;
      }
      
      .header-title {
        font-size: 18px;
      }
      
      .logo-container {
        gap: 10px;
      }
      
      .umak-logo {
        width: 55px;
        height: 55px;
      }
      
      .csfd-logo {
        width: 45px;
        height: 45px;
      }
      
      .email-content {
        padding: 20px 15px;
      }
      
      .info-row {
        flex-direction: column;
        margin-bottom: 8px;
      }
      
      .info-value {
        text-align: left;
        margin-top: 4px;
      }
      
      .track-button, .download-button {
        width: 100%;
        padding: 12px 20px;
        margin: 5px 0;
      }
      
      .control-number-value {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="logo-container">
        <img src="${getUmakLogoUrl()}" alt="UMak Logo" class="umak-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="logo-fallback" style="display: none;">
          <span class="logo-text">UMAK</span>
        </div>
        <img src="${getCsfdLogoUrl()}" alt="CSFD Logo" class="csfd-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <div class="logo-fallback" style="display: none;">
          <span class="logo-text">CSFD</span>
        </div>
      </div>
      <h1 class="header-title">${title}</h1>
      <p class="header-subtitle">University of Makati</p>
      <div class="csfd-branding">
        <span class="csfd-branding-text">CENTER FOR STUDENT FORMATION AND DEVELOPMENT</span>
      </div>
    </div>
`;

// Common email footer
const getEmailFooter = (): string => `
    <div class="email-footer">
      <p class="footer-text">
        This is an automated message from <strong>iCSFD+</strong>. Please do not reply to this email.
      </p>
      <p class="footer-text">
        <a href="${getBaseUrl()}" class="footer-link">Visit iCSFD+ Portal</a>
      </p>
      <div class="social-links">
        <a href="https://facebook.com/UMAKofficial" class="social-link">f</a>
        <a href="https://twitter.com/UMAKofficial" class="social-link">t</a>
        <a href="https://umak.edu.ph" class="social-link">in</a>
      </div>
      <p class="footer-address">
        <strong>Center for Student Formation and Development</strong><br>
        University of Makati<br>
        J.P. Rizal Extension, West Rembo, Makati City 1215<br>
        Email: csfd@umak.edu.ph | Tel: (02) 8883-1500 loc. 7200
      </p>
    </div>
  </div>
</body>
</html>
`;

// Status badge mapping
const getStatusBadgeClass = (status: string): string => {
  const statusClasses: Record<string, string> = {
    NEW: 'status-new',
    PROCESSING: 'status-processing',
    READY_FOR_PICKUP: 'status-ready',
    ISSUED: 'status-issued',
    HOLD: 'status-hold',
    REJECTED: 'status-rejected',
  };
  return statusClasses[status] || 'status-new';
};

// Format status label
const formatStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    NEW: 'New',
    PROCESSING: 'Processing',
    READY_FOR_PICKUP: 'Ready for Pickup',
    ISSUED: 'Issued',
    HOLD: 'On Hold',
    REJECTED: 'Rejected',
  };
  return labels[status] || status;
};

// Get estimated processing days
export function getEstimatedProcessingDays(requestType: string): number {
  return ESTIMATED_PROCESSING_DAYS[requestType] || 3;
}

/**
 * Request Confirmation Email Template
 * Sent when a new request is submitted
 */
export function getRequestConfirmationTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken: string;
  estimatedDays?: number;
}): string {
  const trackingUrl = `${getBaseUrl()}/track?token=${data.trackingToken}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  const estimatedDays = data.estimatedDays || getEstimatedProcessingDays(data.requestType);
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + estimatedDays);
  const formattedEstDate = estimatedDate.toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return `
${getEmailHeader('Request Submitted Successfully')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <p class="message">
        Thank you for submitting your <strong>${requestTypeName}</strong> request. 
        Your application has been successfully received and is now in our queue for processing.
      </p>
      
      <div class="control-number-box">
        <p class="control-number-label">Your Control Number</p>
        <p class="control-number-value">${data.controlNumber}</p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Request Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge status-new">New</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Date Submitted:</span>
          <span class="info-value">${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Estimated Processing Time:</span>
          <span class="info-value">${estimatedDays} business day(s)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Expected Completion:</span>
          <span class="info-value"><strong>${formattedEstDate}</strong></span>
        </div>
      </div>
      
      <div class="info-box-special">
        <p class="info-box-special-title">📌 What Happens Next?</p>
        <div class="timeline">
          <div class="timeline-item">
            <p class="timeline-item-text"><strong>Step 1:</strong> Your request is reviewed by our staff</p>
          </div>
          <div class="timeline-item pending">
            <p class="timeline-item-text"><strong>Step 2:</strong> Processing and verification of documents</p>
          </div>
          <div class="timeline-item pending">
            <p class="timeline-item-text"><strong>Step 3:</strong> Certificate issuance or notification</p>
          </div>
        </div>
      </div>
      
      <div class="alert-box">
        <p class="alert-title">⚠️ Important Reminders</p>
        <ul class="alert-text" style="margin: 8px 0 0 20px; padding: 0;">
          <li>Save your Control Number: <strong>${data.controlNumber}</strong></li>
          <li>You will receive email updates on your request status</li>
          <li>Check your spam folder if you don't receive updates</li>
          <li>Contact CSFD if you need to make corrections</li>
        </ul>
      </div>
      
      <div class="button-container">
        <a href="${trackingUrl}" class="track-button">Track Your Request</a>
      </div>
      
      <div class="contact-box">
        <p class="contact-title">Need Help? Contact CSFD</p>
        <p class="contact-item">📧 Email: <a href="mailto:csfd@umak.edu.ph">csfd@umak.edu.ph</a></p>
        <p class="contact-item">📞 Phone: (02) 8883-1500 loc. 7200</p>
        <p class="contact-item">🏢 Visit us at CSFD Office, UMak Main Building</p>
        <p class="contact-item">🕐 Office Hours: Mon-Fri, 8:00 AM - 5:00 PM</p>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Status Update Email Template - Processing
 * Sent when request status changes to PROCESSING
 */
export function getProcessingEmailTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken?: string;
  processorName?: string;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
${getEmailHeader('Your Request is Now Being Processed')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <div class="success-box">
        <p class="success-title">✅ Great News!</p>
        <p class="success-text">
          Your <strong>${requestTypeName}</strong> request is now being processed by our team.
        </p>
      </div>
      
      <div class="control-number-box">
        <p class="control-number-label">Your Control Number</p>
        <p class="control-number-value">${data.controlNumber}</p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Request Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge status-processing">Processing</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Date Updated:</span>
          <span class="info-value">${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
      
      ${data.processorName ? `
      <div class="processor-box">
        <div class="processor-icon">👤</div>
        <div class="processor-info">
          <p class="processor-label">Processed By</p>
          <p class="processor-name">${data.processorName}</p>
        </div>
      </div>
      ` : ''}
      
      <p class="message">
        Our team is now reviewing your submitted documents and processing your request. 
        You will be notified once your certificate is ready for claiming or if additional 
        information is needed.
      </p>
      
      <div class="info-box-special">
        <p class="info-box-special-title">📋 What This Means</p>
        <ul class="info-box-special-text" style="margin: 8px 0 0 20px; padding: 0;">
          <li>Your documents are being verified</li>
          <li>We're checking your academic records</li>
          <li>Certificate is being prepared</li>
          <li>Typical processing time: 1-3 business days</li>
        </ul>
      </div>
      
      <div class="button-container">
        <a href="${trackingUrl}" class="track-button">Track Your Request</a>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Status Update Email Template - Ready for Pickup
 * Sent when certificate is ready for claiming
 */
export function getReadyForPickupEmailTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken?: string;
  claimLocation?: string;
  processorName?: string;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  const claimLocation = data.claimLocation || 'CSFD Office, UMak Main Building, Ground Floor';
  
  return `
${getEmailHeader('Your Certificate is Ready for Pickup!')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <div class="success-box">
        <p class="success-title">🎉 Certificate Ready!</p>
        <p class="success-text">
          Your <strong>${requestTypeName}</strong> is now ready for claiming! 
          Please visit our office during office hours to pick up your document.
        </p>
      </div>
      
      <div class="control-number-box">
        <p class="control-number-label">Your Control Number</p>
        <p class="control-number-value">${data.controlNumber}</p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Document Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge status-ready">Ready for Pickup</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Date Ready:</span>
          <span class="info-value">${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Claim Location:</span>
          <span class="info-value"><strong>${claimLocation}</strong></span>
        </div>
      </div>
      
      ${data.processorName ? `
      <div class="processor-box">
        <div class="processor-icon">👤</div>
        <div class="processor-info">
          <p class="processor-label">Processed By</p>
          <p class="processor-name">${data.processorName}</p>
        </div>
      </div>
      ` : ''}
      
      <div class="alert-box">
        <p class="alert-title">📋 What to Bring</p>
        <ul class="alert-text" style="margin: 8px 0 0 20px; padding: 0;">
          <li><strong>Valid ID</strong> (UMak ID or government-issued ID)</li>
          <li><strong>Copy of request confirmation</strong> or Control Number: ${data.controlNumber}</li>
          <li><strong>Authorization letter</strong> (if claiming on behalf of someone)</li>
          <li><strong>Copy of requestor's valid ID</strong> (for authorized representatives)</li>
        </ul>
      </div>
      
      <div class="contact-box">
        <p class="contact-title">📍 Claim Location & Office Hours</p>
        <p class="contact-item"><strong>${claimLocation}</strong></p>
        <p class="contact-item">🕐 Monday to Friday: 8:00 AM - 12:00 NN, 1:00 PM - 5:00 PM</p>
        <p class="contact-item">⚠️ Closed on weekends and holidays</p>
      </div>
      
      <div class="button-container">
        <a href="${trackingUrl}" class="track-button">View Request Details</a>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Status Update Email Template - Issued (with download link)
 * Sent when certificate is issued and available for download
 */
export function getIssuedEmailTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken?: string;
  downloadLink?: string;
  validUntil?: string;
  certificateUrl?: string;
  processorName?: string;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  const downloadUrl = data.downloadLink || data.certificateUrl || `${getBaseUrl()}/track?token=${data.trackingToken}&download=true`;
  
  return `
${getEmailHeader('Your Certificate Has Been Issued!')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <div class="success-box">
        <p class="success-title">🎉 Certificate Issued Successfully!</p>
        <p class="success-text">
          Your <strong>${requestTypeName}</strong> has been issued and is now available. 
          You can download a digital copy or claim the printed version at our office.
        </p>
      </div>
      
      <div class="control-number-box">
        <p class="control-number-label">Your Control Number</p>
        <p class="control-number-value">${data.controlNumber}</p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Document Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge status-issued">Issued</span></span>
        </div>
        <div class="info-row">
          <span class="info-label">Date Issued:</span>
          <span class="info-value">${new Date().toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        ${data.validUntil ? `
        <div class="info-row">
          <span class="info-label">Valid Until:</span>
          <span class="info-value"><strong>${data.validUntil}</strong></span>
        </div>
        ` : ''}
      </div>
      
      ${data.processorName ? `
      <div class="processor-box">
        <div class="processor-icon">👤</div>
        <div class="processor-info">
          <p class="processor-label">Processed By</p>
          <p class="processor-name">${data.processorName}</p>
        </div>
      </div>
      ` : ''}
      
      <div class="alert-box">
        <p class="alert-title">📥 Download Your Certificate</p>
        <p class="alert-text">
          Click the button below to download a digital copy of your certificate.
          The printed version can still be claimed at the CSFD office.
        </p>
      </div>
      
      <div class="button-container">
        <a href="${downloadUrl}" class="download-button">Download Certificate</a>
        <a href="${trackingUrl}" class="track-button">View Details</a>
      </div>
      
      ${data.validUntil ? `
      <div class="info-box-special">
        <p class="info-box-special-title">⏰ Certificate Validity</p>
        <p class="info-box-special-text">
          This certificate is valid until <strong>${data.validUntil}</strong>. 
          Please use it within the validity period. If you need a new certificate 
          after this date, you will need to submit a new request.
        </p>
      </div>
      ` : ''}
      
      <div class="contact-box">
        <p class="contact-title">Need Help?</p>
        <p class="contact-item">📧 Email: <a href="mailto:csfd@umak.edu.ph">csfd@umak.edu.ph</a></p>
        <p class="contact-item">📞 Phone: (02) 8883-1500 loc. 7200</p>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Status Update Email Template - Hold
 * Sent when request is put on hold
 */
export function getHoldEmailTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken?: string;
  remarks?: string;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
${getEmailHeader('Your Request is On Hold')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <div class="alert-box">
        <p class="alert-title">⚠️ Action Required</p>
        <p class="alert-text">
          Your <strong>${requestTypeName}</strong> request has been put on hold.
          Please review the details below and take the necessary action.
        </p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Control Number:</span>
          <span class="info-value"><strong>${data.controlNumber}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Request Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge status-hold">On Hold</span></span>
        </div>
      </div>
      
      ${data.remarks ? `
      <div class="error-box">
        <p class="error-title">📝 Reason for Hold</p>
        <p class="error-text">${data.remarks}</p>
      </div>
      ` : `
      <div class="error-box">
        <p class="error-title">📝 Action Needed</p>
        <p class="error-text">
          Please contact the CSFD office to clarify what additional information 
          or documents are needed to proceed with your request.
        </p>
      </div>
      `}
      
      <div class="info-box-special">
        <p class="info-box-special-title">📋 What You Need to Do</p>
        <ul class="info-box-special-text" style="margin: 8px 0 0 20px; padding: 0;">
          <li>Review the reason for hold above</li>
          <li>Prepare the required documents or information</li>
          <li>Contact CSFD office or visit during office hours</li>
          <li>Reference your Control Number: <strong>${data.controlNumber}</strong></li>
        </ul>
      </div>
      
      <div class="contact-box">
        <p class="contact-title">Contact CSFD Office</p>
        <p class="contact-item">📧 Email: <a href="mailto:csfd@umak.edu.ph">csfd@umak.edu.ph</a></p>
        <p class="contact-item">📞 Phone: (02) 8883-1500 loc. 7200</p>
        <p class="contact-item">🏢 Visit us at CSFD Office, UMak Main Building</p>
        <p class="contact-item">🕐 Office Hours: Mon-Fri, 8:00 AM - 5:00 PM</p>
      </div>
      
      <div class="button-container">
        <a href="${trackingUrl}" class="track-button">View Request Details</a>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Status Update Email Template - Rejected
 * Sent when request is rejected
 */
export function getRejectedEmailTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken?: string;
  remarks?: string;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
${getEmailHeader('Your Request Has Been Rejected')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <div class="error-box">
        <p class="error-title">❌ Request Rejected</p>
        <p class="error-text">
          Unfortunately, your <strong>${requestTypeName}</strong> request has been rejected.
          Please review the reason below.
        </p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Control Number:</span>
          <span class="info-value"><strong>${data.controlNumber}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Request Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge status-rejected">Rejected</span></span>
        </div>
      </div>
      
      ${data.remarks ? `
      <div class="error-box">
        <p class="error-title">📝 Reason for Rejection</p>
        <p class="error-text">${data.remarks}</p>
      </div>
      ` : ''}
      
      <div class="info-box-special">
        <p class="info-box-special-title">📋 What You Can Do</p>
        <ul class="info-box-special-text" style="margin: 8px 0 0 20px; padding: 0;">
          <li>Review the reason for rejection above</li>
          <li>Contact CSFD office for clarification if needed</li>
          <li>Address the issues mentioned</li>
          <li>Submit a new request with corrected information</li>
        </ul>
      </div>
      
      <div class="alert-box">
        <p class="alert-title">💡 Need Help?</p>
        <p class="alert-text">
          If you believe this rejection was made in error or need assistance, 
          please contact the CSFD office. We're here to help you.
        </p>
      </div>
      
      <div class="contact-box">
        <p class="contact-title">Contact CSFD Office</p>
        <p class="contact-item">📧 Email: <a href="mailto:csfd@umak.edu.ph">csfd@umak.edu.ph</a></p>
        <p class="contact-item">📞 Phone: (02) 8883-1500 loc. 7200</p>
        <p class="contact-item">🏢 Visit us at CSFD Office, UMak Main Building</p>
        <p class="contact-item">🕐 Office Hours: Mon-Fri, 8:00 AM - 5:00 PM</p>
      </div>
      
      <div class="button-container">
        <a href="${trackingUrl}" class="track-button">View Request Details</a>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Generic Status Update Email Template
 * Used for any status change with custom content
 */
export function getStatusUpdateTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  status: string;
  remarks?: string;
  trackingToken?: string;
}): string {
  // Route to specific template based on status
  switch (data.status) {
    case 'PROCESSING':
      return getProcessingEmailTemplate({
        controlNumber: data.controlNumber,
        requestType: data.requestType,
        requestorName: data.requestorName,
        trackingToken: data.trackingToken,
      });
    case 'READY_FOR_PICKUP':
      return getReadyForPickupEmailTemplate({
        controlNumber: data.controlNumber,
        requestType: data.requestType,
        requestorName: data.requestorName,
        trackingToken: data.trackingToken,
      });
    case 'ISSUED':
      return getIssuedEmailTemplate({
        controlNumber: data.controlNumber,
        requestType: data.requestType,
        requestorName: data.requestorName,
        trackingToken: data.trackingToken,
      });
    case 'HOLD':
      return getHoldEmailTemplate({
        controlNumber: data.controlNumber,
        requestType: data.requestType,
        requestorName: data.requestorName,
        trackingToken: data.trackingToken,
        remarks: data.remarks,
      });
    case 'REJECTED':
      return getRejectedEmailTemplate({
        controlNumber: data.controlNumber,
        requestType: data.requestType,
        requestorName: data.requestorName,
        trackingToken: data.trackingToken,
        remarks: data.remarks,
      });
    default:
      // Generic template for unknown status
      return getGenericStatusUpdateTemplate(data);
  }
}

/**
 * Generic Status Update Template
 */
function getGenericStatusUpdateTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  status: string;
  remarks?: string;
  trackingToken?: string;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
${getEmailHeader('Request Status Update')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <p class="message">
        There has been an update on your <strong>${requestTypeName}</strong> request.
      </p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Control Number:</span>
          <span class="info-value"><strong>${data.controlNumber}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Request Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge ${getStatusBadgeClass(data.status)}">${formatStatusLabel(data.status)}</span></span>
        </div>
      </div>
      
      ${data.remarks ? `
      <div class="info-box-special">
        <p class="info-box-special-title">📝 Remarks</p>
        <p class="info-box-special-text">${data.remarks}</p>
      </div>
      ` : ''}
      
      <div class="button-container">
        <a href="${trackingUrl}" class="track-button">View Request Details</a>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Certificate Ready Email Template
 * Sent when certificate is ready for claiming
 */
export function getCertificateReadyTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  claimLocation: string;
  validUntil?: string;
}): string {
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
${getEmailHeader('Certificate Ready for Claiming')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <div class="success-box">
        <p class="success-title">✅ Great News!</p>
        <p class="success-text">
          Your certificate is now ready for claiming. Please visit our office during office hours
          to claim your document.
        </p>
      </div>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Control Number:</span>
          <span class="info-value"><strong>${data.controlNumber}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Document Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Claim Location:</span>
          <span class="info-value">${data.claimLocation}</span>
        </div>
        ${data.validUntil ? `
        <div class="info-row">
          <span class="info-label">Valid Until:</span>
          <span class="info-value">${data.validUntil}</span>
        </div>
        ` : ''}
      </div>
      
      <div class="alert-box">
        <p class="alert-title">📋 What to Bring</p>
        <p class="alert-text">
          Please bring the following when claiming your certificate:
        </p>
        <ul style="margin: 10px 0 0 20px; padding: 0; color: #a16207; font-size: 13px;">
          <li>Valid ID (UMak ID or government-issued ID)</li>
          <li>Copy of your request confirmation or Control Number</li>
          <li>Authorization letter (if claiming on behalf of someone)</li>
        </ul>
      </div>
      
      <div class="divider"></div>
      
      <p class="message">
        <strong>Office Hours:</strong> Monday to Friday, 8:00 AM - 5:00 PM<br>
        <em>(Except on holidays and university suspensions)</em>
      </p>
      
      <p class="message">
        If you are unable to claim personally, you may send an authorized representative with
        a signed authorization letter and a copy of your valid ID.
      </p>
    </div>

${getEmailFooter()}
`;
}

/**
 * Processing Reminder Email Template
 * Sent for requests pending > 3 days
 */
export function getProcessingReminderTemplate(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken?: string;
  daysPending: number;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
${getEmailHeader('Request Processing Update')}

    <div class="email-content">
      <p class="greeting">Dear <strong>${data.requestorName}</strong>,</p>
      
      <p class="message">
        We wanted to update you on the status of your <strong>${requestTypeName}</strong> request.
      </p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Control Number:</span>
          <span class="info-value"><strong>${data.controlNumber}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Request Type:</span>
          <span class="info-value">${requestTypeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Days in Processing:</span>
          <span class="info-value">${data.daysPending} day(s)</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><span class="status-badge status-processing">Processing</span></span>
        </div>
      </div>
      
      <div class="alert-box">
        <p class="alert-title">⏳ We're Still Processing</p>
        <p class="alert-text">
          Your request is taking longer than usual to process. This could be due to:
        </p>
        <ul style="margin: 8px 0 0 20px; padding: 0; color: #a16207; font-size: 13px;">
          <li>High volume of requests</li>
          <li>Additional verification needed</li>
          <li>Pending external confirmation</li>
        </ul>
      </div>
      
      <p class="message">
        We appreciate your patience. If you have urgent concerns or would like to follow up,
        please don't hesitate to contact our office.
      </p>
      
      <div class="contact-box">
        <p class="contact-title">Need Assistance?</p>
        <p class="contact-item">📧 Email: <a href="mailto:csfd@umak.edu.ph">csfd@umak.edu.ph</a></p>
        <p class="contact-item">📞 Phone: (02) 8883-1500 loc. 7200</p>
        <p class="contact-item">Reference: ${data.controlNumber}</p>
      </div>
      
      <div class="button-container">
        <a href="${trackingUrl}" class="track-button">Track Your Request</a>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Daily Summary Email Template for Admins
 */
export function getDailySummaryTemplate(data: {
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
}): string {
  const dashboardUrl = `${getBaseUrl()}/dashboard/admin`;
  
  return `
${getEmailHeader('Daily Summary Report')}

    <div class="email-content">
      <p class="greeting">Dear Administrator,</p>
      
      <p class="message">
        Here's your daily summary for <strong>${data.date}</strong>:
      </p>
      
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">New Requests:</span>
          <span class="info-value"><strong style="color: #3b82f6;">${data.newRequests}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">In Processing:</span>
          <span class="info-value"><strong style="color: #f59e0b;">${data.processing}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Issued Today:</span>
          <span class="info-value"><strong style="color: #10b981;">${data.issued}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">On Hold:</span>
          <span class="info-value"><strong style="color: #6b7280;">${data.hold}</strong></span>
        </div>
        <div class="info-row">
          <span class="info-label">Rejected:</span>
          <span class="info-value"><strong style="color: #ef4444;">${data.rejected}</strong></span>
        </div>
      </div>
      
      ${data.overdueRequests > 0 ? `
      <div class="error-box">
        <p class="error-title">⚠️ Attention Required</p>
        <p class="error-text">
          <strong>${data.overdueRequests}</strong> request(s) have been pending for more than 3 days.
          Please review and process them as soon as possible.
        </p>
      </div>
      ` : ''}
      
      ${data.recentRequests.length > 0 ? `
      <div class="info-box-special">
        <p class="info-box-special-title">📋 Recent Requests</p>
        <table style="width: 100%; font-size: 12px; margin-top: 10px;">
          <thead>
            <tr style="text-align: left; color: #1d4ed8;">
              <th style="padding: 5px;">Control #</th>
              <th style="padding: 5px;">Type</th>
              <th style="padding: 5px;">Requestor</th>
              <th style="padding: 5px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.recentRequests.map(req => `
            <tr style="color: ${COLORS.darkGray};">
              <td style="padding: 5px; border-bottom: 1px solid #e5e7eb;">${req.controlNumber}</td>
              <td style="padding: 5px; border-bottom: 1px solid #e5e7eb;">${REQUEST_TYPE_NAMES[req.requestType] || req.requestType}</td>
              <td style="padding: 5px; border-bottom: 1px solid #e5e7eb;">${req.requestorName}</td>
              <td style="padding: 5px; border-bottom: 1px solid #e5e7eb;"><span class="status-badge ${getStatusBadgeClass(req.status)}" style="font-size: 10px; padding: 2px 8px;">${formatStatusLabel(req.status)}</span></td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      <div class="button-container">
        <a href="${dashboardUrl}" class="track-button">Go to Dashboard</a>
      </div>
    </div>

${getEmailFooter()}
`;
}

/**
 * Plain text versions for email clients that don't support HTML
 */
export function getRequestConfirmationPlainText(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken: string;
  estimatedDays?: number;
}): string {
  const trackingUrl = `${getBaseUrl()}/track?token=${data.trackingToken}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  const estimatedDays = data.estimatedDays || getEstimatedProcessingDays(data.requestType);
  
  return `
REQUEST SUBMITTED SUCCESSFULLY
University of Makati - Center for Student Formation and Development

Dear ${data.requestorName},

Thank you for submitting your ${requestTypeName} request. Your application has been received and is now being processed.

REQUEST DETAILS:
===========================================
  Control Number: ${data.controlNumber}
  Request Type: ${requestTypeName}
  Status: New
  Estimated Processing Time: ${estimatedDays} business day(s)
===========================================

IMPORTANT:
Please save your Control Number (${data.controlNumber}) for future reference.
You will need this to track your request status and claim your certificate.

WHAT HAPPENS NEXT:
1. Your request is reviewed by our staff
2. Processing and verification of documents
3. Certificate issuance or notification

Track your request: ${trackingUrl}

You will receive another email notification once your request has been processed.
If you have any questions, please contact the CSFD office.

---
This is an automated message from iCSFD+. Please do not reply to this email.

Center for Student Formation and Development
University of Makati
J.P. Rizal Extension, West Rembo, Makati City 1215
Email: csfd@umak.edu.ph | Tel: (02) 8883-1500 loc. 7200
`.trim();
}

export function getStatusUpdatePlainText(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  status: string;
  remarks?: string;
  trackingToken?: string;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  let statusMessage = '';
  switch (data.status) {
    case 'PROCESSING':
      statusMessage = 'Your request is now being processed. We will notify you once it\'s ready.';
      break;
    case 'READY_FOR_PICKUP':
      statusMessage = 'Your certificate is ready for pickup at the CSFD office.';
      break;
    case 'ISSUED':
      statusMessage = 'Your certificate has been issued. You can download it from the tracking page.';
      break;
    case 'HOLD':
      statusMessage = 'Your request has been put on hold. Please contact CSFD for more information.';
      break;
    case 'REJECTED':
      statusMessage = 'Your request has been rejected. Please review the remarks or contact CSFD.';
      break;
    default:
      statusMessage = 'Your request status has been updated.';
  }
  
  return `
REQUEST STATUS UPDATE
University of Makati - Center for Student Formation and Development

Dear ${data.requestorName},

${statusMessage}

REQUEST DETAILS:
===========================================
  Control Number: ${data.controlNumber}
  Request Type: ${requestTypeName}
  New Status: ${formatStatusLabel(data.status)}
${data.remarks ? `  Remarks: ${data.remarks}` : ''}
===========================================

${data.status === 'HOLD' ? 
'ACTION REQUIRED: Your request has been put on hold. Please contact the CSFD office for more information.' : 
''}

${data.status === 'REJECTED' ? 
'Your request has been rejected. Please contact the CSFD office for clarification.' : 
''}

Track your request: ${trackingUrl}

---
This is an automated message from iCSFD+. Please do not reply to this email.

Center for Student Formation and Development
University of Makati
J.P. Rizal Extension, West Rembo, Makati City 1215
Email: csfd@umak.edu.ph | Tel: (02) 8883-1500 loc. 7200
`.trim();
}

export function getCertificateReadyPlainText(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  claimLocation: string;
  validUntil?: string;
}): string {
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
CERTIFICATE READY FOR CLAIMING
University of Makati - Center for Student Formation and Development

Dear ${data.requestorName},

Great news! Your certificate is now ready for claiming.

REQUEST DETAILS:
===========================================
  Control Number: ${data.controlNumber}
  Document Type: ${requestTypeName}
  Claim Location: ${data.claimLocation}
${data.validUntil ? `  Valid Until: ${data.validUntil}` : ''}
===========================================

WHAT TO BRING:
- Valid ID (UMak ID or government-issued ID)
- Copy of your request confirmation or Control Number
- Authorization letter (if claiming on behalf of someone)

OFFICE HOURS: Monday to Friday, 8:00 AM - 5:00 PM
(Except on holidays and university suspensions)

If you are unable to claim personally, you may send an authorized representative with
a signed authorization letter and a copy of your valid ID.

---
This is an automated message from iCSFD+. Please do not reply to this email.

Center for Student Formation and Development
University of Makati
J.P. Rizal Extension, West Rembo, Makati City 1215
Email: csfd@umak.edu.ph | Tel: (02) 8883-1500 loc. 7200
`.trim();
}

export function getProcessingReminderPlainText(data: {
  controlNumber: string;
  requestType: string;
  requestorName: string;
  trackingToken?: string;
  daysPending: number;
}): string {
  const trackingUrl = data.trackingToken 
    ? `${getBaseUrl()}/track?token=${data.trackingToken}`
    : `${getBaseUrl()}/track?controlNumber=${data.controlNumber}`;
  const requestTypeName = REQUEST_TYPE_NAMES[data.requestType] || data.requestType;
  
  return `
REQUEST PROCESSING UPDATE
University of Makati - Center for Student Formation and Development

Dear ${data.requestorName},

We wanted to update you on the status of your ${requestTypeName} request.

REQUEST DETAILS:
===========================================
  Control Number: ${data.controlNumber}
  Request Type: ${requestTypeName}
  Days in Processing: ${data.daysPending} day(s)
  Status: Processing
===========================================

Your request is taking longer than usual to process. This could be due to:
- High volume of requests
- Additional verification needed
- Pending external confirmation

We appreciate your patience. If you have urgent concerns or would like to follow up,
please don't hesitate to contact our office.

Contact CSFD:
  Email: csfd@umak.edu.ph
  Phone: (02) 8883-1500 loc. 7200
  Reference: ${data.controlNumber}

Track your request: ${trackingUrl}

---
This is an automated message from iCSFD+. Please do not reply to this email.

Center for Student Formation and Development
University of Makati
J.P. Rizal Extension, West Rembo, Makati City 1215
Email: csfd@umak.edu.ph | Tel: (02) 8883-1500 loc. 7200
`.trim();
}

export function getDailySummaryPlainText(data: {
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
}): string {
  const dashboardUrl = `${getBaseUrl()}/dashboard/admin`;
  
  return `
DAILY SUMMARY REPORT
University of Makati - Center for Student Formation and Development

Date: ${data.date}

SUMMARY:
===========================================
  New Requests: ${data.newRequests}
  In Processing: ${data.processing}
  Issued Today: ${data.issued}
  On Hold: ${data.hold}
  Rejected: ${data.rejected}
  Total Pending: ${data.totalPending}
===========================================

${data.overdueRequests > 0 ? 
`⚠️ ATTENTION: ${data.overdueRequests} request(s) have been pending for more than 3 days.
Please review and process them as soon as possible.
` : ''}

RECENT REQUESTS:
${data.recentRequests.map(req => 
`  - ${req.controlNumber} | ${REQUEST_TYPE_NAMES[req.requestType] || req.requestType} | ${req.requestorName} | ${formatStatusLabel(req.status)}`
).join('\n')}

Go to Dashboard: ${dashboardUrl}

---
This is an automated message from iCSFD+.

Center for Student Formation and Development
University of Makati
J.P. Rizal Extension, West Rembo, Makati City 1215
Email: csfd@umak.edu.ph | Tel: (02) 8883-1500 loc. 7200
`.trim();
}

// Export status formatting utilities
export { formatStatusLabel, getStatusBadgeClass, REQUEST_TYPE_NAMES };
