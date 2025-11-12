import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

// DELETE /api/projects/[id]/gear/[gearId] - Remove gear from project (Admin only)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; gearId: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: projectId, gearId } = await context.params;

    // Delete the project-gear association
    await prisma.projectGear.delete({
      where: {
        projectId_gearId: {
          projectId,
          gearId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Gear removed from project successfully",
    });
  } catch (error) {
    console.error("Error removing gear from project:", error);
    
    // Check if it's a not found error
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Gear not found in this project" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to remove gear from project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/gear/[gearId] - Update gear notes in project (Admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; gearId: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: projectId, gearId } = await context.params;
    const body = await request.json();

    const projectGear = await prisma.projectGear.update({
      where: {
        projectId_gearId: {
          projectId,
          gearId,
        },
      },
      data: {
        notes: body.notes || null,
      },
      include: {
        gear: true,
      },
    });

    return NextResponse.json(projectGear);
  } catch (error) {
    console.error("Error updating gear notes:", error);
    return NextResponse.json(
      { error: "Failed to update gear notes" },
      { status: 500 }
    );
  }
}
