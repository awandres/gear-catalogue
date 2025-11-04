import { PrismaClient } from '@prisma/client';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Load environment variables - check both .env.local and .env
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv might not be available
}

const prisma = new PrismaClient();

// Configuration
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY || '';
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID || '';
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

// Types
interface ImageSearchResult {
  url: string;
  width?: number;
  height?: number;
  source: string;
}

// Delay function to respect rate limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Search for images using Google Custom Search API
async function searchGoogleImages(query: string, limit: number = 3): Promise<ImageSearchResult[]> {
  if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('⚠️  Google CSE credentials not configured');
    return [];
  }

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/customsearch/v1?q=${searchQuery}&cx=${GOOGLE_CSE_ID}&key=${GOOGLE_CSE_API_KEY}&searchType=image&num=${limit}&imgSize=large&imgType=photo`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.items || []).map((item: any) => ({
      url: item.link,
      width: item.image?.width,
      height: item.image?.height,
      source: 'google'
    }));
  } catch (error) {
    console.error('Google image search error:', error);
    return [];
  }
}

// Search for images using Unsplash API
async function searchUnsplashImages(query: string, limit: number = 3): Promise<ImageSearchResult[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('⚠️  Unsplash API key not configured');
    return [];
  }

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=${limit}&orientation=landscape`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    return (data.results || []).map((item: any) => ({
      url: item.urls.regular || item.urls.full,
      width: item.width,
      height: item.height,
      source: 'unsplash'
    }));
  } catch (error) {
    console.error('Unsplash image search error:', error);
    return [];
  }
}

// Generate sample image URLs (fallback when APIs are not configured)
function generateSampleImages(gearName: string, brand: string): ImageSearchResult[] {
  // List of reputable music equipment image sources
  const domains = [
    'https://images.reverb.com/image/upload',
    'https://media.sweetwater.com/images/items',
    'https://media.guitarcenter.com/is/image/MMGS7',
    'https://www.thomannmusic.com/pics/prod',
    'https://andertons-productimages.s3.amazonaws.com',
  ];

  // Generate plausible image URLs
  return domains.slice(0, 3).map((domain, index) => ({
    url: `${domain}/${brand.toLowerCase()}-${gearName.toLowerCase().replace(/\s+/g, '-')}-${index + 1}.jpg`,
    width: 800,
    height: 600,
    source: 'sample'
  }));
}

// Main function to fetch images for all gear
async function fetchGearImages() {
  console.log('🎸 Starting Gear Image Fetcher...\n');

  try {
    // Get all gear items
    const gearItems = await prisma.gear.findMany({
      include: {
        images: true
      }
    });

    console.log(`Found ${gearItems.length} gear items to process\n`);

    let processedCount = 0;
    let newImagesCount = 0;

    for (const gear of gearItems) {
      // Skip if gear already has images
      if (gear.images.length > 0) {
        console.log(`✅ ${gear.name} already has ${gear.images.length} images`);
        processedCount++;
        continue;
      }

      console.log(`\n🔍 Searching images for: ${gear.name} by ${gear.brand}`);

      // Build search query
      const searchQuery = `${gear.brand} ${gear.name} professional music equipment`;
      
      // Try different image sources
      let images: ImageSearchResult[] = [];
      
      // Try Google first
      const googleImages = await searchGoogleImages(searchQuery);
      images = [...images, ...googleImages];
      
      // Add a small delay to avoid rate limiting
      await delay(1000);
      
      // Try Unsplash if we need more images
      if (images.length < 3) {
        const unsplashImages = await searchUnsplashImages(searchQuery);
        images = [...images, ...unsplashImages];
        await delay(1000);
      }
      
      // Use sample images if no API results
      if (images.length === 0) {
        console.log('  Using sample image URLs (configure APIs for real images)');
        images = generateSampleImages(gear.name, gear.brand);
      }

      // Save images to database
      let savedCount = 0;
      for (let i = 0; i < Math.min(images.length, 5); i++) {
        const image = images[i];
        try {
          await prisma.gearImage.create({
            data: {
              gearId: gear.id,
              url: image.url,
              source: image.source,
              isPrimary: i === 0, // First image is primary
              width: image.width,
              height: image.height,
              format: image.url.match(/\.(jpg|jpeg|png|webp)$/i)?.[1] || 'jpg'
            }
          });
          savedCount++;
          newImagesCount++;
        } catch (error) {
          console.error(`  ❌ Failed to save image: ${error}`);
        }
      }

      console.log(`  ✨ Saved ${savedCount} images for ${gear.name}`);
      processedCount++;
      
      // Respect rate limits
      if (processedCount < gearItems.length) {
        await delay(2000);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  - Processed: ${processedCount}/${gearItems.length} gear items`);
    console.log(`  - New images added: ${newImagesCount}`);
    console.log('\n✅ Image fetching complete!');

    // Generate a report
    const report = {
      timestamp: new Date().toISOString(),
      totalGearItems: gearItems.length,
      processedItems: processedCount,
      newImagesAdded: newImagesCount,
      gearWithoutImages: gearItems.filter(g => g.images.length === 0).map(g => ({
        id: g.id,
        name: g.name,
        brand: g.brand
      }))
    };

    // Save report
    const reportsDir = join(process.cwd(), 'scripts', 'reports');
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = join(reportsDir, `image-fetch-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Show usage instructions if APIs are not configured
function showSetupInstructions() {
  console.log('\n📋 Setup Instructions:\n');
  
  if (!GOOGLE_CSE_API_KEY || !GOOGLE_CSE_ID) {
    console.log('Google Custom Search API:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project or select existing');
    console.log('3. Enable "Custom Search API"');
    console.log('4. Create credentials (API Key)');
    console.log('5. Go to https://cse.google.com/cse/');
    console.log('6. Create a new search engine');
    console.log('7. Set "Search the entire web" option');
    console.log('8. Add to .env.local:');
    console.log('   GOOGLE_CSE_API_KEY=your-api-key');
    console.log('   GOOGLE_CSE_ID=your-search-engine-id\n');
  }

  if (!UNSPLASH_ACCESS_KEY) {
    console.log('Unsplash API:');
    console.log('1. Go to https://unsplash.com/developers');
    console.log('2. Create a new application');
    console.log('3. Copy your Access Key');
    console.log('4. Add to .env.local:');
    console.log('   UNSPLASH_ACCESS_KEY=your-access-key\n');
  }

  console.log('Note: The script will use sample URLs if APIs are not configured.\n');
}

// Run the script
console.log('🎵 Gear Catalogue Image Fetcher\n');

if (!GOOGLE_CSE_API_KEY && !UNSPLASH_ACCESS_KEY) {
  showSetupInstructions();
  console.log('🚀 Running with sample images...\n');
}

fetchGearImages().catch(console.error);
