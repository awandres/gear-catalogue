import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import { isAdminRequest } from "@/lib/admin";
import { canMakeApiCalls, incrementApiUsage } from "../api-usage/route";

// Check if gear only has placeholder image
async function hasOnlyPlaceholder(gearId: string): Promise<boolean> {
  const images = await prisma.gearImage.findMany({
    where: { gearId },
  });
  
  return images.length === 0;
}

// Fetch image for a gear item
async function fetchImageForGear(gearId: string, name: string, brand: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gear/${gearId}/fetch-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        brand,
        action: 'auto-fetch',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error(`Error fetching image for ${gearId}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const mode = body.mode || 'bulk'; // 'bulk' or 'daily'
    const requestedImageCount = body.imageCount; // User-specified limit
    const defaultMaxImages = mode === 'bulk' ? 40 : 20;
    
    // Check available API calls
    const { allowed, available } = await canMakeApiCalls(1);
    
    if (!allowed || available === 0) {
      return NextResponse.json({
        success: false,
        message: 'Daily API limit reached. No images will be fetched.',
        processed: 0,
        succeeded: 0,
        failed: 0,
        remaining: available
      });
    }
    
    // Determine actual limit based on user input and available calls
    let maxImages = defaultMaxImages;
    if (requestedImageCount && requestedImageCount > 0) {
      maxImages = Math.min(requestedImageCount, available);
    } else {
      maxImages = Math.min(defaultMaxImages, available);
    }
    
    // Get all gear items
    const allGear = await prisma.gear.findMany({
      where: {
        category: { not: 'needs-review' }
      },
      select: {
        id: true,
        name: true,
        brand: true,
      },
    });

    // Filter to gear that only has placeholder
    const gearNeedingImages = [];
    for (const gear of allGear) {
      if (await hasOnlyPlaceholder(gear.id)) {
        gearNeedingImages.push(gear);
      }
    }

    if (gearNeedingImages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All gear items have images',
        processed: 0,
        succeeded: 0,
        failed: 0,
      });
    }

    // Select random subset up to maxImages
    const toProcess = gearNeedingImages
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, Math.min(maxImages, gearNeedingImages.length));

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      items: [] as any[],
    };

    // Process images one by one
    for (const gear of toProcess) {
      results.processed++;
      
      const success = await fetchImageForGear(gear.id, gear.name, gear.brand);
      
      if (success) {
        results.succeeded++;
        results.items.push({ id: gear.id, name: gear.name, status: 'success' });
      } else {
        results.failed++;
        results.items.push({ id: gear.id, name: gear.name, status: 'failed' });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Increment API usage counter
    await incrementApiUsage(results.succeeded);

    return NextResponse.json({
      success: true,
      message: `Processed ${results.processed} images`,
      apiCallsUsed: results.succeeded,
      ...results,
    });
  } catch (error) {
    console.error("Error processing images:", error);
    return NextResponse.json(
      { error: "Failed to process images", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

