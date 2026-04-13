import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";

// GET - Fetch all templates or filter by type
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const templateType = searchParams.get("type");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Record<string, unknown> = {};
    
    if (templateType) {
      where.templateType = templateType;
    }
    
    if (!includeInactive) {
      where.isActive = true;
    }

    const templates = await db.template.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

// POST - Create a new template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user ID from email
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, templateType, filename, storagePath, placeholders, subject, bodyHtml } = body;

    if (!name || !templateType) {
      return NextResponse.json(
        { error: "Name and template type are required" },
        { status: 400 }
      );
    }

    const template = await db.template.create({
      data: {
        name,
        templateType,
        filename: filename || null,
        storagePath: storagePath || null,
        placeholders: placeholders || null,
        subject: subject || null,
        bodyHtml: bodyHtml || null,
        createdBy: user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: session.user.name || session.user.email,
        action: "CREATE",
        module: "Templates",
        recordId: template.id,
        newValue: JSON.stringify(template),
      },
    });

    return NextResponse.json({ data: template }, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PUT - Update a template
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { id, name, templateType, filename, storagePath, placeholders, subject, bodyHtml, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Get old template for audit log
    const oldTemplate = await db.template.findUnique({
      where: { id },
    });

    if (!oldTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const template = await db.template.update({
      where: { id },
      data: {
        name,
        templateType,
        filename,
        storagePath,
        placeholders,
        subject,
        bodyHtml,
        isActive,
      },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: session.user.name || session.user.email,
        action: "UPDATE",
        module: "Templates",
        recordId: template.id,
        oldValue: JSON.stringify(oldTemplate),
        newValue: JSON.stringify(template),
      },
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template (soft delete by setting isActive to false)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    // Get old template for audit log
    const oldTemplate = await db.template.findUnique({
      where: { id },
    });

    if (!oldTemplate) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Soft delete
    const template = await db.template.update({
      where: { id },
      data: { isActive: false },
    });

    // Log audit
    await db.auditLog.create({
      data: {
        userId: user.id,
        userName: session.user.name || session.user.email,
        action: "DELETE",
        module: "Templates",
        recordId: template.id,
        oldValue: JSON.stringify(oldTemplate),
      },
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
