import { db } from "@/lib/db";
import { UserRole } from "@prisma/client";

// Notification types
export type NotificationType = "info" | "success" | "warning" | "error";

// Interface for creating notification
interface CreateNotificationData {
  userId?: string | null; // null for broadcast notifications
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

/**
 * Create a notification for a specific user
 */
export async function createNotification(data: CreateNotificationData) {
  try {
    const notification = await db.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
      },
    });
    return { success: true, data: notification };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, error };
  }
}

/**
 * Create broadcast notification for all users
 */
export async function createBroadcastNotification(data: Omit<CreateNotificationData, "userId">) {
  return createNotification({ ...data, userId: null });
}

/**
 * Create notifications for all users with specific roles
 */
export async function notifyUsersByRole(
  roles: UserRole[],
  data: Omit<CreateNotificationData, "userId">
) {
  try {
    const users = await db.user.findMany({
      where: {
        role: { in: roles },
        status: "ACTIVE",
      },
      select: { id: true },
    });

    const notifications = await Promise.all(
      users.map((user) =>
        db.notification.create({
          data: {
            userId: user.id,
            title: data.title,
            message: data.message,
            type: data.type,
            link: data.link,
          },
        })
      )
    );

    return { success: true, count: notifications.length };
  } catch (error) {
    console.error("Error notifying users by role:", error);
    return { success: false, error };
  }
}

/**
 * Notify admins when a new request is submitted
 */
export async function notifyAdminsNewRequest(
  controlNumber: string,
  requestType: string,
  requestorName: string
) {
  return notifyUsersByRole(["ADMIN", "SUPER_ADMIN"], {
    title: "New Request Submitted",
    message: `${requestType} request from ${requestorName} (${controlNumber})`,
    type: "info",
    link: `/dashboard/requests`,
  });
}

/**
 * Notify user when their request status is updated
 * Note: Since requests can be anonymous, we need to check if the user exists
 */
export async function notifyRequestStatusUpdate(
  userId: string | undefined,
  controlNumber: string,
  status: string,
  requestType: string
) {
  if (!userId) {
    // No user to notify (anonymous request)
    return { success: true, message: "No user to notify (anonymous request)" };
  }

  const statusMessages: Record<string, { title: string; type: NotificationType }> = {
    PROCESSING: { title: "Request is Being Processed", type: "info" },
    ISSUED: { title: "Certificate Ready!", type: "success" },
    HOLD: { title: "Request On Hold", type: "warning" },
    REJECTED: { title: "Request Rejected", type: "error" },
  };

  const statusInfo = statusMessages[status] || { title: "Request Updated", type: "info" };

  return createNotification({
    userId,
    title: statusInfo.title,
    message: `Your ${requestType} request (${controlNumber}) has been ${status.toLowerCase()}.`,
    type: statusInfo.type,
    link: `/track?token=${controlNumber}`,
  });
}

/**
 * Notify all users about a new announcement
 */
export async function notifyNewAnnouncement(title: string, announcementId: string) {
  return createBroadcastNotification({
    title: "New Announcement",
    message: title,
    type: "info",
    link: `/announcements/${announcementId}`,
  });
}

/**
 * Notify specific user about a complaint update
 */
export async function notifyComplaintUpdate(
  userId: string,
  controlNumber: string,
  status: string
) {
  const statusMessages: Record<string, { title: string; type: NotificationType }> = {
    UNDER_REVIEW: { title: "Complaint Under Review", type: "info" },
    RESOLVED: { title: "Complaint Resolved", type: "success" },
    DISMISSED: { title: "Complaint Dismissed", type: "warning" },
    REOPENED: { title: "Complaint Reopened", type: "info" },
  };

  const statusInfo = statusMessages[status] || { title: "Complaint Updated", type: "info" };

  return createNotification({
    userId,
    title: statusInfo.title,
    message: `Your complaint (${controlNumber}) status has been updated.`,
    type: statusInfo.type,
    link: `/dashboard/complaints`,
  });
}
