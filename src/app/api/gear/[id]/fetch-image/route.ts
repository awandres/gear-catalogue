import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { canMakeApiCalls, incrementApiUsage } from '@/app/api/admin/api-usage/route';

const prisma = new PrismaClient();

// Google Custom Search API configuration
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, brand, startIndex = 1, action } = body;

    if (!id || !name || !brand) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Handle different actions
    if (action === 'save') {
      const { imageUrl } = body;
      if (!imageUrl) {
        return NextResponse.json({ error: 'Image URL required for save action' }, { status: 400 });
      }

      // Delete existing primary image if any
      await prisma.gearImage.updateMany({
        where: { gearId: id, isPrimary: true },
        data: { isPrimary: false }
      });

      // Save the new image as primary
      const savedImage = await prisma.gearImage.create({
        data: {
          gearId: id,
          url: imageUrl,
          source: 'google-manual',
          isPrimary: true
        }
      });

      // Also update the gear's media field to include this image
      const gear = await prisma.gear.findUnique({
        where: { id }
      });

      if (gear) {
        const currentMedia = (gear.media as Record<string, any>) || {};
        const currentPhotos = (currentMedia.photos || []) as string[];
        
        // Add the new image URL as the first photo
        const updatedPhotos = [imageUrl, ...currentPhotos.filter((p: string) => p !== imageUrl)];
        
        await prisma.gear.update({
          where: { id },
          data: {
            media: {
              ...currentMedia,
              photos: updatedPhotos.slice(0, 5) // Keep max 5 photos
            }
          }
        });
      }

      return NextResponse.json({ success: true, image: savedImage });
    }

    // Fetch new images action
    if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
      return NextResponse.json({ 
        error: 'Google API not configured',
        remainingCalls: 0 
      }, { status: 503 });
    }

    // Check database-tracked API usage
    const { allowed, available } = await canMakeApiCalls(1);
    
    if (!allowed || available === 0) {
      return NextResponse.json({ 
        error: 'Daily API limit reached',
        remainingCalls: 0 
      }, { status: 429 });
    }

    const searchQuery = `${brand} ${name} professional audio equipment`;
    const params = new URLSearchParams({
      key: GOOGLE_CSE_API_KEY,
      cx: GOOGLE_CSE_ID,
      q: searchQuery,
      searchType: 'image',
      num: '3', // Get 3 options for manual selection
      start: startIndex.toString(),
      imgSize: 'large',
      safe: 'active',
      imgType: 'photo'
    });

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params}`
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ 
        error: 'Google API error',
        details: error,
        remainingCalls: available
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Increment API usage counter in database
    await incrementApiUsage(1);
    console.log('✅ Google API call made - usage incremented');
    
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ 
        images: [],
        remainingCalls: available - 1, // Already incremented
        hasMore: false
      });
    }

    // Get already seen/rejected images to filter them out
    const existingImages = await prisma.gearImage.findMany({
      where: { gearId: id },
      select: { url: true }
    });
    const seenUrls = new Set(existingImages.map(img => img.url));

    // Filter out already seen images and format response
    const newImages = data.items
      .filter((item: Record<string, any>) => !seenUrls.has(item.link))
      .map((item: Record<string, any>) => ({
        url: item.link,
        thumbnail: item.image?.thumbnailLink,
        title: item.title,
        displayLink: item.displayLink,
        width: item.image?.width,
        height: item.image?.height
      }));

    return NextResponse.json({
      images: newImages,
      remainingCalls: available - 1, // Already incremented
      hasMore: data.queries?.nextPage ? true : false,
      nextStartIndex: data.queries?.nextPage?.[0]?.startIndex || null
    });

  } catch (error) {
    console.error('Error in manual image fetch:', error);
    
    // Get current usage for error response
    const { available: currentAvailable } = await canMakeApiCalls(1);
    
    return NextResponse.json({ 
      error: 'Failed to fetch images',
      remainingCalls: currentAvailable
    }, { status: 500 });
  }
}
