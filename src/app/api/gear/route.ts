import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { filterGear, paginateGear, validateGearItem } from '@/lib/utils';
import { GearFilters } from '@/lib/types';
import { isAdminRequest } from '@/lib/admin';

const prisma = new PrismaClient();

// GET /api/gear - List all gear with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params
    const filters: GearFilters = {
      category: searchParams.get('category') as any || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      tone: searchParams.get('tone')?.split(',').filter(Boolean) || undefined,
      search: searchParams.get('search') || undefined,
      projectId: searchParams.get('projectId') || undefined,
    };
    
    // Parse pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '24');
    
    // Check if user is admin
    const isAdmin = await isAdminRequest(request);
    
    // Build where clause for Prisma
    const where: any = {};
    
    // Filter out needs-review items for non-admin users
    if (!isAdmin) {
      where.category = { not: 'needs-review' };
    }
    
    if (filters.category) {
      where.category = filters.category;
    }
    
    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags };
    }
    
    if (filters.projectId) {
      where.projectGear = {
        some: {
          projectId: filters.projectId
        }
      };
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
    
    // Get paginated items with images
    const items = await prisma.gear.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { name: 'asc' },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        },
        projectGear: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                primaryColor: true,
                status: true,
              }
            }
          }
        }
      }
    });
    
    // Format items for frontend
    const formattedItems = items.map(item => ({
      ...item,
      dateAdded: item.dateAdded?.toISOString().split('T')[0],
      lastUsed: item.lastUsed?.toISOString().split('T')[0],
      media: {
        photos: item.images?.length > 0 ? [item.images[0].url] : []
      }
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

// POST /api/gear - Create new gear item (Admin only)
export async function POST(request: NextRequest) {
  // Check admin authorization
  if (!(await isAdminRequest(request))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    // Generate ID if not provided
    if (!body.id) {
      body.id = `${body.brand.toLowerCase().replace(/\s+/g, '-')}-${body.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    }
    
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
        id: body.id,
        name: body.name,
        brand: body.brand,
        category: body.category,
        subcategory: body.subcategory,
        description: body.description,
        soundCharacteristics: body.soundCharacteristics || { tone: [], qualities: [] },
        tags: body.tags || [],
        parameters: body.parameters || null,
        specifications: body.specifications || null,
        usage: body.usage || null,
        media: body.media || null,
        connections: body.connections || null,
        notes: body.notes || null,
        dateAdded: new Date(),
        lastUsed: new Date(),
      },
    });
    
    return NextResponse.json({
      ...newGear,
      dateAdded: newGear.dateAdded?.toISOString(),
      lastUsed: newGear.lastUsed?.toISOString(),
      createdAt: newGear.createdAt.toISOString(),
      updatedAt: newGear.updatedAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating gear:', error);
    return NextResponse.json(
      { error: 'Failed to create gear item' },
      { status: 500 }
    );
  }
}