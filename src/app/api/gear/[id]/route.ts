import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validateGearItem } from '@/lib/utils';
import { isAdminRequest } from '@/lib/admin';

// GET /api/gear/[id] - Get single gear item
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const gear = await prisma.gear.findUnique({
      where: { id },
      include: {
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
    
    if (!gear) {
      return NextResponse.json(
        { error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...gear,
      dateAdded: gear.dateAdded?.toISOString().split('T')[0],
      lastUsed: gear.lastUsed?.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching gear item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gear item' },
      { status: 500 }
    );
  }
}

// PUT /api/gear/[id] - Update gear item (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authorization
  if (!(await isAdminRequest(request))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    
    // Check if item exists
    const existing = await prisma.gear.findUnique({
      where: { id }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.brand !== undefined) updateData.brand = body.brand;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.soundCharacteristics !== undefined) updateData.soundCharacteristics = body.soundCharacteristics;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.parameters !== undefined) updateData.parameters = body.parameters;
    if (body.specifications !== undefined) updateData.specifications = body.specifications;
    if (body.usage !== undefined) updateData.usage = body.usage;
    if (body.media !== undefined) updateData.media = body.media;
    if (body.connections !== undefined) updateData.connections = body.connections;
    if (body.notes !== undefined) updateData.notes = body.notes;
    
    // Update in database
    const updatedGear = await prisma.gear.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      ...updatedGear,
      dateAdded: updatedGear.dateAdded?.toISOString(),
      lastUsed: updatedGear.lastUsed?.toISOString(),
      createdAt: updatedGear.createdAt.toISOString(),
      updatedAt: updatedGear.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating gear item:', error);
    return NextResponse.json(
      { error: 'Failed to update gear item' },
      { status: 500 }
    );
  }
}

// DELETE /api/gear/[id] - Delete gear item (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Check admin authorization
  if (!(await isAdminRequest(request))) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await context.params;
    const deletedGear = await prisma.gear.delete({
      where: { id }
    });
    
    return NextResponse.json({ 
      message: 'Gear item deleted successfully',
      deletedGear
    });
  } catch (error) {
    console.error('Error deleting gear item:', error);
    
    // Check if it's a not found error
    if ((error as any).code === 'P2025') {
      return NextResponse.json(
        { error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete gear item' },
      { status: 500 }
    );
  }
}