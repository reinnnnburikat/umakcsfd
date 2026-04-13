import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Get managed lists (colleges, purposes, etc.)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listType = searchParams.get("type");
    const includeInactive = searchParams.get("includeInactive") === "true";

    const where: Record<string, unknown> = {};
    if (listType) {
      where.listType = listType;
    }
    if (!includeInactive) {
      where.isActive = true;
    }

    const lists = await db.managedList.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    // Group by list type
    const groupedLists = lists.reduce((acc, item) => {
      if (!acc[item.listType]) {
        acc[item.listType] = [];
      }
      acc[item.listType].push(item);
      return acc;
    }, {} as Record<string, typeof lists>);

    return NextResponse.json({ data: groupedLists, items: lists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

// POST - Add a new list item
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listType, label, value } = body;

    if (!listType || !label) {
      return NextResponse.json(
        { error: "List type and label are required" },
        { status: 400 }
      );
    }

    // Get max sort order for this list type
    const maxSort = await db.managedList.aggregate({
      where: { listType },
      _max: { sortOrder: true },
    });

    const sortOrder = (maxSort._max.sortOrder || 0) + 1;

    const listItem = await db.managedList.create({
      data: {
        listType,
        label,
        value: value || label.toLowerCase().replace(/\s+/g, "_"),
        sortOrder,
      },
    });

    return NextResponse.json({ data: listItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating list item:", error);
    return NextResponse.json(
      { error: "Failed to create list item" },
      { status: 500 }
    );
  }
}

// PUT - Update a list item or reorder items
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, label, value, isActive, reorderItems } = body;

    // Handle reordering multiple items
    if (reorderItems && Array.isArray(reorderItems)) {
      const updatePromises = reorderItems.map((item: { id: string; sortOrder: number }) =>
        db.managedList.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      );
      
      await Promise.all(updatePromises);
      return NextResponse.json({ success: true });
    }

    // Single item update
    if (!id) {
      return NextResponse.json(
        { error: "List item ID is required" },
        { status: 400 }
      );
    }

    const listItem = await db.managedList.update({
      where: { id },
      data: {
        label,
        value,
        isActive,
      },
    });

    return NextResponse.json({ data: listItem });
  } catch (error) {
    console.error("Error updating list item:", error);
    return NextResponse.json(
      { error: "Failed to update list item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a list item (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "List item ID is required" },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const listItem = await db.managedList.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: listItem });
  } catch (error) {
    console.error("Error deleting list item:", error);
    return NextResponse.json(
      { error: "Failed to delete list item" },
      { status: 500 }
    );
  }
}
