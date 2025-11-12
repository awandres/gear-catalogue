import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";
import { put } from "@vercel/blob";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Admin protection
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = await context.params;
    const { id: gearId } = params;

    // Verify gear exists
    const gear = await prisma.gear.findUnique({
      where: { id: gearId },
      include: { images: true },
    });

    if (!gear) {
      return NextResponse.json({ error: "Gear not found" }, { status: 404 });
    }

    // Check image limit
    const MAX_IMAGES = 10;
    if (gear.images.length >= MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images per gear item` },
        { status: 400 }
      );
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const filename = `${gearId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const blob = await put(`gear/${filename}`, file, {
      access: "public",
    });

    // Get image dimensions and format
    const format = file.type.split("/")[1] || "unknown";

    // Determine if this should be the primary image
    const isPrimary = gear.images.length === 0;

    // Save to database
    const gearImage = await prisma.gearImage.create({
      data: {
        gearId: gearId,
        url: blob.url,
        source: "upload",
        isPrimary: isPrimary,
        format: format,
        size: file.size,
      },
    });

    return NextResponse.json({
      success: true,
      image: gearImage,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

