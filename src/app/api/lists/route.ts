import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get managed lists (colleges, purposes, etc.)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listType = searchParams.get("type");

    const where: any = { isActive: true };
    if (listType) {
      where.listType = listType;
    }

    const lists = await prisma.managedList.findMany({
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
    }, {} as Record<string, any[]>);

    return NextResponse.json({ data: groupedLists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}
