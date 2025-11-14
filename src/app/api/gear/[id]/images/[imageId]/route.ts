import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";
import { del } from "@vercel/blob";

export async function DELETE(
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
      include: { gear: { include: { images: true } } },
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

    // Delete from Vercel Blob if it's an uploaded image
    if (image.source === "upload" && image.url.includes("vercel-storage.com")) {
      try {
        await del(image.url);
      } catch (error) {
        console.error("Error deleting from blob storage:", error);
        // Continue with database deletion even if blob deletion fails
      }
    }

    // If deleting the primary image, promote another image to primary
    const wasPrimary = image.isPrimary;
    
    // Delete from database
    await prisma.gearImage.delete({
      where: { id: imageId },
    });

    // If this was the primary image and there are other images, set a new primary
    if (wasPrimary && image.gear.images.length > 1) {
      const remainingImage = image.gear.images.find((img) => img.id !== imageId);
      if (remainingImage) {
        await prisma.gearImage.update({
          where: { id: remainingImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}




