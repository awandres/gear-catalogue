import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const options = {
      clearGear: body.clearGear ?? true,
      clearProjects: body.clearProjects ?? true,
      clearImages: body.clearImages ?? true,
      clearProjectAssignments: body.clearProjectAssignments ?? true,
    };

    const deleted = {
      gear: 0,
      projects: 0,
      gearImages: 0,
      projectGear: 0,
    };

    // Delete in order due to foreign key constraints
    
    // Always delete project assignments first if clearing projects or gear
    if (options.clearProjectAssignments || options.clearProjects || options.clearGear) {
      const result = await prisma.projectGear.deleteMany({});
      deleted.projectGear = result.count;
    }
    
    // Delete GearImages
    if (options.clearImages || options.clearGear) {
      const result = await prisma.gearImage.deleteMany({});
      deleted.gearImages = result.count;
    }
    
    // Delete Projects
    if (options.clearProjects) {
      const result = await prisma.project.deleteMany({});
      deleted.projects = result.count;
    }
    
    // Delete Gear
    if (options.clearGear) {
      const result = await prisma.gear.deleteMany({});
      deleted.gear = result.count;
    }

    return NextResponse.json({
      success: true,
      message: "Database cleared successfully",
      deleted,
    });
  } catch (error) {
    console.error("Error clearing database:", error);
    return NextResponse.json(
      { error: "Failed to clear database", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

