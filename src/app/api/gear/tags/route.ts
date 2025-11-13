import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/gear/tags - List all tags with counts
export async function GET() {
  try {
    // Get all gear items to extract tags
    const allGear = await prisma.gear.findMany({
      select: { tags: true }
    });
    
    // Count tags
    const tagCounts = new Map<string, number>();
    allGear.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    // Convert to array and sort
    const tagsWithCounts = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
    
    // Group tags by category (based on MD file tag taxonomy)
    const tagCategories = {
      technical: ['analog', 'tube', 'solid-state', 'FET', 'transformer', 'class-a', 'tape', 'monophonic'],
      sound: ['warm', 'aggressive', 'color', 'fast-attack', 'versatile', 'classic', 'british', 'german'],
      usage: ['vocal', 'drums', 'bass', 'lead', 'guitar', 'eq'],
      era: ['vintage', 'vintage-style', 'modern', 'classic', 'anniversary-edition', 'blueline', 'boutique'],
      power: ['100-watt', '300-watt', 'four-channel', '4x12', 'cardioid', 'omni', 'greenback', 'blackback'],
      brand: ['neve', 'ampeg', 'marshall', 'moog', 'telefunken', '1073', 'strat', '1979', 'british-mod', 'duncan', 'humbucker'],
      quality: ['studio-standard', 'premium', 'high-gain', 'metal', 'delay', 'echo']
    };
    
    // Categorize tags
    const categorizedTags = Object.entries(tagCategories).reduce((acc, [category, tags]) => {
      acc[category] = tagsWithCounts.filter(item => tags.includes(item.tag));
      return acc;
    }, {} as Record<string, typeof tagsWithCounts>);
    
    // Find uncategorized tags
    const allCategorizedTags = Object.values(tagCategories).flat();
    const uncategorized = tagsWithCounts.filter(item => !allCategorizedTags.includes(item.tag));
    
    if (uncategorized.length > 0) {
      categorizedTags.other = uncategorized;
    }
    
    return NextResponse.json({
      total: tagsWithCounts.length,
      categories: categorizedTags,
      all: tagsWithCounts
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}