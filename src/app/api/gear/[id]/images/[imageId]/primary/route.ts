import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  // Admin protection
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const { id: gearId, imageId } = params;

    // Find the image
    const image = await prisma.gearImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    if (image.gearId !== gearId) {
      return NextResponse.json(
        { error: "Image does not belong to this gear" },
        { status: 400 }
      );
    }

    // If already primary, nothing to do
    if (image.isPrimary) {
      return NextResponse.json({
        success: true,
        message: "Image is already primary",
      });
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction([
      // Unset all other images as primary for this gear
      prisma.gearImage.updateMany({
        where: {
          gearId: gearId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      }),
      // Set this image as primary
      prisma.gearImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Primary image set successfully",
    });
  } catch (error) {
    console.error("Error setting primary image:", error);
    return NextResponse.json(
      { error: "Failed to set primary image" },
      { status: 500 }
    );
  }
}


