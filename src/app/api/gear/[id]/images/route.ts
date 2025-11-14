import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id: gearId } = params;

    // Find all images for this gear
    const images = await prisma.gearImage.findMany({
      where: { gearId },
      orderBy: [
        { isPrimary: 'desc' }, // Primary images first
        { createdAt: 'asc' },  // Then by creation date
      ],
    });

    return NextResponse.json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}




