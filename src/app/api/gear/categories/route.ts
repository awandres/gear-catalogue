import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GEAR_CATEGORIES } from '@/lib/types';

// GET /api/gear/categories - List all categories with counts
export async function GET() {
  try {
    // Get count of items grouped by category
    const categoryCounts = await prisma.gear.groupBy({
      by: ['category'],
      _count: true,
    });
    
    // Create a map for easier lookup
    const countMap = new Map(
      categoryCounts.map((item: any) => [item.category, item._count])
    );
    
    // Format response
    const categories = Object.keys(GEAR_CATEGORIES).map(category => ({
      name: category,
      subcategories: GEAR_CATEGORIES[category as keyof typeof GEAR_CATEGORIES],
      count: countMap.get(category) || 0
    }));
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}