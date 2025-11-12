import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

// POST /api/projects/[id]/gear - Add gear to project (Admin only)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: projectId } = await context.params;
    const body = await request.json();

    // Validate input
    if (!body.gearId) {
      return NextResponse.json(
        { error: "Gear ID is required" },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if gear exists
    const gear = await prisma.gear.findUnique({
      where: { id: body.gearId },
    });

    if (!gear) {
      return NextResponse.json(
        { error: "Gear not found" },
        { status: 404 }
      );
    }

    // Check if gear already in project
    const existingEntry = await prisma.projectGear.findUnique({
      where: {
        projectId_gearId: {
          projectId,
          gearId: body.gearId,
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Gear already added to this project" },
        { status: 400 }
      );
    }

    // Add gear to project
    const projectGear = await prisma.projectGear.create({
      data: {
        projectId,
        gearId: body.gearId,
        notes: body.notes || null,
      },
      include: {
        gear: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
      },
    });

    return NextResponse.json(projectGear);
  } catch (error) {
    console.error("Error adding gear to project:", error);
    return NextResponse.json(
      { error: "Failed to add gear to project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/gear - Clear all gear from project (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: projectId } = await context.params;

    // Delete all project gear assignments for this project
    const result = await prisma.projectGear.deleteMany({
      where: { projectId },
    });

    return NextResponse.json({
      success: true,
      message: "All gear removed from project",
      count: result.count,
    });
  } catch (error) {
    console.error("Error clearing project loadout:", error);
    return NextResponse.json(
      { error: "Failed to clear project loadout" },
      { status: 500 }
    );
  }
}
