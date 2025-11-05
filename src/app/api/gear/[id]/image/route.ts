import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache to avoid repeated API calls
const imageCache = new Map<string, string>();

// Google Custom Search API configuration
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

// Simple in-memory rate limiting (resets on server restart)
const apiCallTracker = {
  count: 0,
  resetDate: new Date().toDateString(),
  
  canMakeRequest(): boolean {
    const today = new Date().toDateString();
    
    // Reset counter if it's a new day
    if (this.resetDate !== today) {
      this.count = 0;
      this.resetDate = today;
    }
    
    // Google CSE allows 100 requests per day on free tier
    return this.count < 100;
  },
  
  incrementCount() {
    this.count++;
  },
  
  getRemainingCalls(): number {
    const today = new Date().toDateString();
    if (this.resetDate !== today) {
      return 100;
    }
    return Math.max(0, 100 - this.count);
  }
};

// Fetch image from Google Custom Search API
async function fetchImageFromGoogle(searchQuery: string, startIndex: number = 1): Promise<{ url: string; thumbnail?: string } | null> {
  if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
    console.warn('Google CSE API credentials not configured');
    return null;
  }

  // Check rate limit
  if (!apiCallTracker.canMakeRequest()) {
    console.warn(`Google CSE API rate limit reached. Remaining calls today: ${apiCallTracker.getRemainingCalls()}`);
    return null;
  }

  try {
    apiCallTracker.incrementCount();
    const params = new URLSearchParams({
      key: GOOGLE_CSE_API_KEY,
      cx: GOOGLE_CSE_ID,
      q: `${searchQuery} professional audio equipment`,
      searchType: 'image',
      num: '3', // Fetch 3 results to have options
      start: startIndex.toString(),
      imgSize: 'large',
      safe: 'active',
      imgType: 'photo'
    });

    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params}`
    );

    if (!response.ok) {
      console.error('Google CSE API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      // Log successful API usage
      console.log(`Google CSE API: Found ${data.items.length} images. Remaining calls today: ${apiCallTracker.getRemainingCalls()}`);
      // Return the first image that hasn't been rejected
      const firstItem = data.items[0];
      return {
        url: firstItem.link,
        thumbnail: firstItem.image?.thumbnailLink
      };
    }

    console.log(`Google CSE API: No images found for "${searchQuery}"`);
    return null;
  } catch (error) {
    console.error('Error fetching image from Google:', error);
    return null;
  }
}

// Generate a deterministic color based on text
function generateColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }
  
  // Generate a hue between 200-280 (blues/purples)
  const hue = 200 + (Math.abs(hash) % 80);
  return `hsl(${hue}, 70%, 50%)`;
}

// Generate a simple SVG placeholder image
function generatePlaceholderSVG(text: string, brand: string): string {
  const color = generateColor(text + brand);
  const displayText = text.slice(0, 25) + (text.length > 25 ? '...' : '');
  const displayBrand = brand.slice(0, 30) + (brand.length > 30 ? '...' : '');
  
  // Create SVG with gear-themed design
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.7" />
        </linearGradient>
      </defs>
      
      <rect width="400" height="300" fill="url(#bg)"/>
      
      <!-- Gear icon background -->
      <g transform="translate(200, 120)" opacity="0.2">
        <circle r="40" fill="none" stroke="white" stroke-width="3"/>
        <circle r="15" fill="white"/>
        <path d="M-40,0 L40,0 M0,-40 L0,40 M-28,-28 L28,28 M-28,28 L28,-28" stroke="white" stroke-width="3"/>
      </g>
      
      <!-- Text background -->
      <rect x="20" y="180" width="360" height="90" fill="black" fill-opacity="0.3" rx="5"/>
      
      <!-- Main text -->
      <text x="200" y="210" font-family="system-ui, Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="white">
        ${displayText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
      
      <!-- Brand text -->
      <text x="200" y="235" font-family="system-ui, Arial, sans-serif" font-size="14" text-anchor="middle" fill="rgba(255,255,255,0.8)">
        ${displayBrand.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
      </text>
      
      <!-- Corner accent -->
      <circle cx="30" cy="30" r="20" fill="white" fill-opacity="0.1"/>
      <circle cx="370" cy="30" r="20" fill="white" fill-opacity="0.1"/>
    </svg>
  `.trim();
  
  // Convert to base64 data URI
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js 15, params is a Promise
    const { id } = await params;
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get('q') || '';
    const brand = searchParams.get('brand') || '';
    
    if (!id) {
      return NextResponse.json({ error: 'Gear ID is required' }, { status: 400 });
    }
    
    // Check cache first
    const cacheKey = `${id}-${query}-${brand}`;
    if (imageCache.has(cacheKey)) {
      return NextResponse.json({ imageUrl: imageCache.get(cacheKey) });
    }
    
    // Check database for stored images
    try {
      const gearWithImages = await prisma.gear.findUnique({
        where: { id },
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          }
        }
      });
      
      // If we have a primary image in the database, use it
      if (gearWithImages?.images?.[0]?.url) {
        const imageUrl = gearWithImages.images[0].url;
        imageCache.set(cacheKey, imageUrl);
        return NextResponse.json({ imageUrl });
      }
      
      // If no primary image, try to get any image
      if (gearWithImages) {
        const anyImage = await prisma.gearImage.findFirst({
          where: { gearId: id }
        });
        
        if (anyImage?.url) {
          imageCache.set(cacheKey, anyImage.url);
          return NextResponse.json({ imageUrl: anyImage.url });
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue to placeholder generation if database fails
    }
    
    // Try to fetch from Google Images
    const searchQuery = `${brand} ${query}`.trim();
    const googleImageResult = await fetchImageFromGoogle(searchQuery);
    
    if (googleImageResult) {
      // Store the fetched image in database for future use
      try {
        await prisma.gearImage.create({
          data: {
            gearId: id,
            url: googleImageResult.url,
            source: 'google',
            isPrimary: true
          }
        });
        
        imageCache.set(cacheKey, googleImageResult.url);
        return NextResponse.json({ imageUrl: googleImageResult.url });
      } catch (saveError) {
        console.error('Error saving image to database:', saveError);
        // Still return the image even if we couldn't save it
        imageCache.set(cacheKey, googleImageResult.url);
        return NextResponse.json({ imageUrl: googleImageResult.url });
      }
    }
    
    // Fall back to generated placeholder if Google search fails
    const placeholderUrl = generatePlaceholderSVG(query || 'Gear', brand || 'Studio');
    imageCache.set(cacheKey, placeholderUrl);
    
    return NextResponse.json({ imageUrl: placeholderUrl });
    
  } catch (error) {
    console.error('Error in image route:', error);
    return NextResponse.json({ 
      error: 'Failed to get image',
      imageUrl: '/placeholder-gear.svg'
    }, { status: 500 });
  }
}
