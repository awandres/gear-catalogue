import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { validateGearItem } from '@/lib/utils';

const prisma = new PrismaClient();

// GET /api/gear/[id] - Get single gear item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gear = await prisma.gear.findUnique({
      where: { id: params.id }
    });
    
    if (!gear) {
      return NextResponse.json(
        { error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    // Convert status back to hyphenated format
    return NextResponse.json({
      ...gear,
      status: gear.status.replace('_', '-'),
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

// PUT /api/gear/[id] - Update gear item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check if item exists
    const existing = await prisma.gear.findUnique({
      where: { id: params.id }
    });
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Gear item not found' },
        { status: 404 }
      );
    }
    
    // Merge with existing data
    const updatedData = { ...existing, ...body, id: params.id };
    
    // Validate the updated item
    const validationErrors = validateGearItem(updatedData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { errors: validationErrors },
        { status: 400 }
      );
    }
    
    // Update in database
    const updatedGear = await prisma.gear.update({
      where: { id: params.id },
      data: {
        ...body,
        status: body.status?.replace('-', '_'),
        lastUsed: new Date(),
      },
    });
    
    return NextResponse.json({
      ...updatedGear,
      status: updatedGear.status.replace('_', '-'),
      dateAdded: updatedGear.dateAdded?.toISOString().split('T')[0],
      lastUsed: updatedGear.lastUsed?.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error updating gear item:', error);
    return NextResponse.json(
      { error: 'Failed to update gear item' },
      { status: 500 }
    );
  }
}

// DELETE /api/gear/[id] - Delete gear item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deletedGear = await prisma.gear.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ 
      message: 'Gear item deleted successfully',
      deletedGear: {
        ...deletedGear,
        status: deletedGear.status.replace('_', '-'),
      }
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