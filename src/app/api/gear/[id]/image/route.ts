import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache to avoid repeated generation
const imageCache = new Map<string, string>();

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
    
    // Generate a nice placeholder SVG locally (no external requests)
    const imageUrl = generatePlaceholderSVG(query || 'Gear', brand || 'Studio');
    imageCache.set(cacheKey, imageUrl);
    
    return NextResponse.json({ imageUrl });
    
  } catch (error) {
    console.error('Error in image route:', error);
    return NextResponse.json({ 
      error: 'Failed to get image',
      imageUrl: '/placeholder-gear.svg'
    }, { status: 500 });
  }
}
