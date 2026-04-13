import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyNewAnnouncement } from "@/lib/notifications";

// GET - List all announcements
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get("activeOnly") === "true";
    const pinnedOnly = searchParams.get("pinnedOnly") === "true";
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (activeOnly) {
      where.isActive = true;
      where.OR = [
        { postedTo: null },
        { postedTo: { gte: new Date() } },
      ];
    }

    if (pinnedOnly) {
      where.isPinned = true;
    }

    const [announcements, total] = await Promise.all([
      db.announcement.findMany({
        where,
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      db.announcement.count({ where }),
    ]);

    return NextResponse.json({
      data: announcements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST - Create a new announcement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create announcements
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, isPinned, postedFrom, postedTo } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const announcement = await db.announcement.create({
      data: {
        title,
        content,
        isPinned: isPinned || false,
        isActive: true,
        postedFrom: postedFrom ? new Date(postedFrom) : new Date(),
        postedTo: postedTo ? new Date(postedTo) : null,
        createdBy: session.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "CREATE_ANNOUNCEMENT",
        module: "ANNOUNCEMENTS",
        recordId: announcement.id,
        newValue: JSON.stringify(announcement),
      },
    });

    // Notify all users about the new announcement (broadcast)
    notifyNewAnnouncement(title, announcement.id)
      .catch(err => console.error("Failed to notify users about announcement:", err));

    return NextResponse.json({
      success: true,
      data: announcement,
      message: "Announcement created successfully",
    });
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}

// PUT - Update an announcement
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can update announcements
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, content, isPinned, isActive, postedFrom, postedTo } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    // Get existing announcement
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (postedFrom !== undefined) updateData.postedFrom = new Date(postedFrom);
    if (postedTo !== undefined) updateData.postedTo = postedTo ? new Date(postedTo) : null;

    const updatedAnnouncement = await db.announcement.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "UPDATE_ANNOUNCEMENT",
        module: "ANNOUNCEMENTS",
        recordId: id,
        oldValue: JSON.stringify(existingAnnouncement),
        newValue: JSON.stringify(updatedAnnouncement),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAnnouncement,
      message: "Announcement updated successfully",
    });
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an announcement
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete announcements
    if (!["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    // Get existing announcement for audit log
    const existingAnnouncement = await db.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Delete the announcement
    await db.announcement.delete({
      where: { id },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "DELETE_ANNOUNCEMENT",
        module: "ANNOUNCEMENTS",
        recordId: id,
        oldValue: JSON.stringify(existingAnnouncement),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Announcement deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
