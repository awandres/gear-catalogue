import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";
import { GEAR_CATEGORIES } from "@/lib/types";

// Sample tags pool for randomization
const SAMPLE_TAGS = [
  ['vintage', 'classic', 'warm', 'smooth'],
  ['modern', 'digital', 'clean', 'precise'],
  ['tube', 'analog', 'rich', 'musical'],
  ['versatile', 'professional', 'studio', 'reliable'],
  ['punchy', 'aggressive', 'powerful', 'focused'],
];

const SAMPLE_TONES = [
  ['warm', 'smooth'], ['bright', 'clear'], ['dark', 'rich'], 
  ['aggressive', 'punchy'], ['clean', 'transparent'], ['vintage', 'classic']
];

const SAMPLE_QUALITIES = [
  ['musical', 'smooth'], ['accurate', 'detailed'], ['powerful', 'tight'],
  ['versatile', 'reliable'], ['rich', 'full'], ['clear', 'focused']
];

// Map common category keywords to actual categories
const CATEGORY_ALIASES: Record<string, string> = {
  'mics': 'microphone',
  'mic': 'microphone',
  'microphones': 'microphone',
  'guitars': 'guitar',
  'gtr': 'guitar',
  'bass': 'bass',
  'basses': 'bass',
  'keys': 'keyboard',
  'keyboards': 'keyboard',
  'synths': 'keyboard',
  'synth': 'keyboard',
  'amps': 'amplifier',
  'amp': 'amplifier',
  'amplifiers': 'amplifier',
  'cabs': 'cabinet',
  'cab': 'cabinet',
  'cabinets': 'cabinet',
  'preamps': 'preamp',
  'preamplifiers': 'preamp',
  'preamplifier': 'preamp',
  'pre': 'preamp',
  'i/o': 'monitoring',
  'converters': 'monitoring',
  'computing': 'monitoring',
  'interface': 'monitoring',
  'interfaces': 'monitoring',
  'compressors': 'dynamics',
  'comp': 'dynamics',
  'compression': 'dynamics',
  'dynamics': 'dynamics',
  'eq': 'eq',
  'equalizer': 'eq',
  'effects': 'effects',
  'fx': 'effects',
  'reverb': 'effects',
  'delay': 'effects',
  'monitors': 'monitoring',
  'monitoring': 'monitoring',
  'headphones': 'monitoring',
  'drums': 'drum',
  'percussion': 'drum',
};

// Helper to match category from text
function matchCategory(text: string): string | null {
  const normalized = text.toLowerCase().trim().replace(':', '');
  
  // Check aliases first
  if (CATEGORY_ALIASES[normalized]) {
    return CATEGORY_ALIASES[normalized];
  }
  
  // Check direct match with GEAR_CATEGORIES keys
  if (Object.keys(GEAR_CATEGORIES).includes(normalized)) {
    return normalized;
  }
  
  // Try to match any keyword from the text against aliases
  const words = normalized.split(/[\s,\/]+/); // Split by space, comma, or slash
  for (const word of words) {
    if (CATEGORY_ALIASES[word]) {
      return CATEGORY_ALIASES[word];
    }
  }
  
  return null;
}

// Helper to detect subcategory from name/description
function detectSubcategory(name: string, description: string, category: string): string {
  const text = `${name} ${description}`.toLowerCase();
  const categoryMap = GEAR_CATEGORIES as any;
  
  if (!categoryMap[category]) {
    return categoryMap[Object.keys(categoryMap)[0]][0];
  }

  const subcategories = categoryMap[category];
  
  // Try to match keywords
  for (const sub of subcategories) {
    const keywords = sub.split('-');
    if (keywords.some((keyword: string) => text.includes(keyword))) {
      return sub;
    }
  }
  
  // Default to first subcategory
  return subcategories[0];
}

// Sanitize text for use in IDs
function sanitizeForId(text: string): string {
  const sanitized = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  
  // Return a fallback if empty
  return sanitized || 'item';
}

// Try to parse brand and name from a simple string
function parseBrandAndName(text: string): { brand: string; name: string } {
  // Clean the input text
  const cleanText = text.trim();
  
  // Try to detect common brand names
  const commonBrands = [
    'Neumann', 'Shure', 'AKG', 'Sennheiser', 'Audio-Technica', 'Rode', 'Electro-Voice',
    'Fender', 'Gibson', 'Martin', 'Taylor', 'Gretsch', 'Rickenbacker', 'PRS', 'Ibanez',
    'Marshall', 'Vox', 'Orange', 'Mesa Boogie', 'Ampeg', 'Fender',
    'Moog', 'Roland', 'Korg', 'Yamaha', 'Sequential', 'Dave Smith',
    'API', 'Neve', 'SSL', 'Universal Audio', 'UA', 'Avalon', 'Manley',
    'Pultec', 'Empirical Labs', 'Chandler', 'Rupert Neve',
    'Lexicon', 'Eventide', 'TC Electronic', 'Strymon'
  ];
  
  for (const brand of commonBrands) {
    if (cleanText.toLowerCase().includes(brand.toLowerCase())) {
      const name = cleanText.replace(new RegExp(brand, 'i'), '').trim();
      return { brand, name: name || cleanText };
    }
  }
  
  // If no brand detected, check for dash separator
  if (cleanText.includes(' - ')) {
    const parts = cleanText.split(' - ');
    return { brand: parts[0].trim(), name: parts[1].trim() };
  }
  
  // Default: first word is brand, rest is name
  const words = cleanText.split(/\s+/);
  if (words.length > 1) {
    return { brand: words[0], name: words.slice(1).join(' ') };
  }
  
  return { brand: 'Unknown', name: cleanText };
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Parse a single line of gear data with current category context
function parseGearLine(line: string, currentCategory: string | null): any | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Extract tags if present
  const tagRegex = /#(\w+[-\w]*)/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(trimmed)) !== null) {
    tags.push(match[1]);
  }

  // Remove tags from line
  const withoutTags = trimmed.replace(/#\w+[-\w]*/g, '').trim();

  // Check if this is complex format with pipes
  if (withoutTags.includes('|')) {
    const parts = withoutTags.split('|').map(p => p.trim());
    const brandNamePart = parts[0];
    const { brand, name } = parseBrandAndName(brandNamePart);
    const category = parts[1]?.toLowerCase().trim() || currentCategory || 'effects';
    const description = parts[2]?.trim() || `Professional ${category} by ${brand}`;
    
    const subcategory = detectSubcategory(name, description, category);
    const id = `${sanitizeForId(brand)}-${sanitizeForId(name)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      name,
      brand,
      category,
      subcategory,
      description,
      soundCharacteristics: {
        tone: tags.length > 0 ? tags.slice(0, 2) : getRandomElement(SAMPLE_TONES),
        qualities: getRandomElement(SAMPLE_QUALITIES)
      },
      tags: tags.length > 0 ? tags : getRandomElement(SAMPLE_TAGS),
      needsReview: false,
    };
  }

  // Simple format: just a gear name/description
  const { brand, name } = parseBrandAndName(withoutTags);
  const category = currentCategory || 'needs-review';
  const description = category === 'needs-review' 
    ? `${brand} ${name} - requires categorization and details`
    : `Professional studio ${category} equipment`;
  const subcategory = category === 'needs-review' ? 'uncategorized' : detectSubcategory(name, description, category);
  const id = `${sanitizeForId(brand)}-${sanitizeForId(name)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id,
    name,
    brand,
    category,
    subcategory,
    description,
    soundCharacteristics: {
      tone: tags.length > 0 ? tags.slice(0, 2) : getRandomElement(SAMPLE_TONES),
      qualities: getRandomElement(SAMPLE_QUALITIES)
    },
    tags: tags.length > 0 ? tags : getRandomElement(SAMPLE_TAGS),
    needsReview: false, // All items are created now
  };
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const text = body.text || '';
    const imageCount = body.imageCount; // User-specified image API call limit

    if (!text.trim()) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400 }
      );
    }

    const lines = text.split('\n').filter((line: string) => line.trim());
    const results = {
      created: 0,
      errors: [] as string[],
      items: [] as any[],
      needsReview: [] as any[],
    };

    let currentCategory: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      try {
        // Check if line is a category header (ends with :)
        if (line.trim().endsWith(':')) {
          const categoryText = line.trim().slice(0, -1);
          const matchedCategory = matchCategory(categoryText);
          
          if (matchedCategory) {
            currentCategory = matchedCategory;
            continue;
          } else {
            // Unknown category - items will be flagged for review
            currentCategory = null;
            results.errors.push(`Line ${lineNumber}: Unknown category "${categoryText}" - subsequent items will need review`);
            continue;
          }
        }

        const gearData = parseGearLine(line, currentCategory);
        
        if (!gearData) continue;

        // Create gear in database
        const newGear = await prisma.gear.create({
          data: {
            id: gearData.id,
            name: gearData.name,
            brand: gearData.brand,
            category: gearData.category,
            subcategory: gearData.subcategory,
            description: gearData.description,
            soundCharacteristics: gearData.soundCharacteristics,
            tags: gearData.tags,
            dateAdded: new Date(),
            lastUsed: new Date(),
          },
        });

        results.created++;
        results.items.push({
          id: newGear.id,
          name: newGear.name,
          brand: newGear.brand,
          category: newGear.category,
          tags: newGear.tags,
        });
        
        // Track items that need review
        if (newGear.category === 'needs-review') {
          results.needsReview.push({
            id: newGear.id,
            name: newGear.name,
            brand: newGear.brand,
          });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        results.errors.push(`Line ${lineNumber}: ${errorMsg}`);
      }
    }

    // Trigger image processing in background for bulk uploads
    if (results.created > 0) {
      // Fire and forget - process images asynchronously
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/process-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': request.headers.get('x-admin-key') || '',
        },
        body: JSON.stringify({ 
          mode: 'bulk',
          imageCount: imageCount
        }),
      }).catch(err => console.error('Error triggering image processing:', err));
    }

    return NextResponse.json({
      success: true,
      created: results.created,
      errors: results.errors,
      items: results.items,
      needsReview: results.needsReview,
    });
  } catch (error) {
    console.error("Error processing bulk upload:", error);
    return NextResponse.json(
      { error: "Failed to process bulk upload", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

