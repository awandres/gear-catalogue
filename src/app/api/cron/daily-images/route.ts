import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// This endpoint should be called by a cron service once per day
// For Vercel: Add vercel.json with cron configuration
// For development: Can be triggered manually

async function hasOnlyPlaceholder(gearId: string): Promise<boolean> {
  const images = await prisma.gearImage.findMany({
    where: { gearId },
  });
  
  return images.length === 0;
}

async function fetchImageForGear(gearId: string, name: string, brand: string): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/gear/${gearId}/fetch-image`, {
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

export async function GET(request: NextRequest) {
  // Verify this is a valid cron request
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-production';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log('[CRON] Starting daily image fetch job...');
    
    // Get gear items that need images (excluding needs-review)
    const allGear = await prisma.gear.findMany({
      where: {
        category: { not: 'needs-review' }
      },
      select: {
        id: true,
        name: true,
        brand: true,
      },
      orderBy: {
        dateAdded: 'desc', // Prioritize recently added
      },
    });

    // Filter to only items with placeholder
    const gearNeedingImages = [];
    for (const gear of allGear) {
      if (await hasOnlyPlaceholder(gear.id)) {
        gearNeedingImages.push(gear);
      }
      
      // Stop checking if we have enough
      if (gearNeedingImages.length >= 20) break;
    }

    if (gearNeedingImages.length === 0) {
      console.log('[CRON] No gear items need images. Skipping.');
      return NextResponse.json({
        success: true,
        message: 'No items need images',
        processed: 0,
        skipped: true,
      });
    }

    console.log(`[CRON] Found ${gearNeedingImages.length} items needing images. Processing...`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      items: [] as any[],
    };

    // Process up to 20 items
    const toProcess = gearNeedingImages.slice(0, 20);

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
      
      // Delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`[CRON] Completed. Processed: ${results.processed}, Succeeded: ${results.succeeded}, Failed: ${results.failed}`);

    return NextResponse.json({
      success: true,
      message: `Daily image fetch completed`,
      ...results,
    });
  } catch (error) {
    console.error("[CRON] Error in daily image fetch:", error);
    return NextResponse.json(
      { error: "Failed to process daily images", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}



