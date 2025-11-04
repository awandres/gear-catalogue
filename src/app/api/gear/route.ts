import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { filterGear, paginateGear, validateGearItem } from '@/lib/utils';
import { GearFilters } from '@/lib/types';

const prisma = new PrismaClient();

// GET /api/gear - List all gear with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params
    const filters: GearFilters = {
      category: searchParams.get('category') as any || undefined,
      status: searchParams.get('status')?.split(',').filter(Boolean) as any || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      tone: searchParams.get('tone')?.split(',').filter(Boolean) || undefined,
      search: searchParams.get('search') || undefined,
    };
    
    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '24');
    
    // Build where clause for Prisma
    const where: any = {};
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.status?.length) {
      where.status = { in: filters.status.map(s => s.replace('-', '_')) };
    }
    
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags };
    }
    
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { brand: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { tags: { has: filters.search } },
      ];
    }
    
    // Get total count
    const totalItems = await prisma.gear.count({ where });
    
    // Get paginated items
    const items = await prisma.gear.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' },
    });
    
    // Convert status back to hyphenated format for frontend
    const formattedItems = items.map(item => ({
      ...item,
      status: item.status.replace('_', '-'),
      dateAdded: item.dateAdded?.toISOString().split('T')[0],
      lastUsed: item.lastUsed?.toISOString().split('T')[0],
    }));
    
    return NextResponse.json({
      items: formattedItems,
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    console.error('Error fetching gear:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gear' },
      { status: 500 }
    );
  }
}

// POST /api/gear - Create new gear item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the gear item
    const validationErrors = validateGearItem(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { errors: validationErrors },
        { status: 400 }
      );
    }
    
    // Check if ID already exists
    const existing = await prisma.gear.findUnique({ where: { id: body.id } });
    if (existing) {
      return NextResponse.json(
        { error: 'Gear item with this ID already exists' },
        { status: 409 }
      );
    }
    
    // Create in database
    const newGear = await prisma.gear.create({
      data: {
        ...body,
        status: body.status.replace('-', '_'),
        soundCharacteristics: body.soundCharacteristics || {},
        dateAdded: new Date(),
        lastUsed: new Date(),
      },
    });
    
    return NextResponse.json({
      ...newGear,
      status: newGear.status.replace('_', '-'),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating gear:', error);
    return NextResponse.json(
      { error: 'Failed to create gear item' },
      { status: 500 }
    );
  }
}