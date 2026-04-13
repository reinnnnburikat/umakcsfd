import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - List all users with filtering, pagination, and sorting
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const roleFilter = searchParams.get("role");
    const statusFilter = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    
    // Role filter
    if (roleFilter && roleFilter !== "all") {
      where.role = roleFilter;
    }
    
    // Status filter
    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter;
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, password, name, role, status } = body;

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Password length validation
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as UserRole,
        status: (status || "ACTIVE") as UserStatus,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "CREATE_USER",
        module: "USERS",
        recordId: user.id,
        newValue: JSON.stringify(user),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

// PUT - Update user (single or bulk)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ids, name, role, status, password } = body;

    // Bulk update
    if (ids && Array.isArray(ids) && ids.length > 0) {
      const updateData: any = {};
      if (status) updateData.status = status;

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: "No update data provided" }, { status: 400 });
      }

      // Update multiple users
      const updatePromises = ids.map((userId: string) =>
        db.user.update({
          where: { id: userId },
          data: updateData,
        })
      );

      await Promise.all(updatePromises);

      // Create audit log for bulk action
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || "Unknown",
          action: "BULK_UPDATE_USERS",
          module: "USERS",
          newValue: JSON.stringify({ ids, status }),
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: `Updated ${ids.length} user(s)` 
      });
    }

    // Single user update
    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 });
    }

    // Get old user data for audit log
    const oldUser = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "UPDATE_USER",
        module: "USERS",
        recordId: id,
        oldValue: JSON.stringify(oldUser),
        newValue: JSON.stringify(user),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// PATCH - Update user (legacy support)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, role, status, password } = body;

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update data provided" }, { status: 400 });
    }

    // Get old user data for audit log
    const oldUser = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || "Unknown",
        action: "UPDATE_USER",
        module: "USERS",
        recordId: id,
        oldValue: JSON.stringify(oldUser),
        newValue: JSON.stringify(user),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE - Soft delete user (change status to INACTIVE)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const hard = searchParams.get("hard") === "true";

    if (!id) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Get user data for audit log
    const userToDelete = await db.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (hard) {
      // Hard delete - actually remove from database
      await db.user.delete({ where: { id } });
      
      // Create audit log
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || "Unknown",
          action: "DELETE_USER",
          module: "USERS",
          recordId: id,
          oldValue: JSON.stringify(userToDelete),
        },
      });

      return NextResponse.json({ 
        success: true, 
        message: "User permanently deleted" 
      });
    } else {
      // Soft delete - change status to INACTIVE
      const user = await db.user.update({
        where: { id },
        data: { status: UserStatus.INACTIVE },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
        },
      });

      // Create audit log
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || "Unknown",
          action: "SOFT_DELETE_USER",
          module: "USERS",
          recordId: id,
          oldValue: JSON.stringify(userToDelete),
          newValue: JSON.stringify(user),
        },
      });

      return NextResponse.json({ 
        success: true, 
        data: user,
        message: "User deactivated (soft delete)" 
      });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
