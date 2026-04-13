import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Duplicate a template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
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
    const { sourceId, newName } = body;

    if (!sourceId) {
      return NextResponse.json(
        { error: "Source template ID is required" },
        { status: 400 }
      );
    }

    // Get source template
    const sourceTemplate = await db.template.findUnique({
      where: { id: sourceId },
    });

    if (!sourceTemplate) {
      return NextResponse.json(
        { error: "Source template not found" },
        { status: 404 }
      );
    }

    // Create duplicate
    const duplicatedTemplate = await db.template.create({
      data: {
        name: newName || `${sourceTemplate.name} (Copy)`,
        templateType: sourceTemplate.templateType,
        filename: sourceTemplate.filename,
        storagePath: sourceTemplate.storagePath,
        placeholders: sourceTemplate.placeholders,
        subject: sourceTemplate.subject,
        bodyHtml: sourceTemplate.bodyHtml,
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
        action: "DUPLICATE",
        module: "Templates",
        recordId: duplicatedTemplate.id,
        oldValue: JSON.stringify({ sourceId }),
        newValue: JSON.stringify(duplicatedTemplate),
      },
    });

    return NextResponse.json({ data: duplicatedTemplate }, { status: 201 });
  } catch (error) {
    console.error("Error duplicating template:", error);
    return NextResponse.json(
      { error: "Failed to duplicate template" },
      { status: 500 }
    );
  }
}
