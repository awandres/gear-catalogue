import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

// Curated color palette for project branding
const PROJECT_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#a855f7', // Violet
  '#22c55e', // Green
];

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const limitParam = searchParams.get("limit");
    
    // Build where clause
    const where: any = {};
    if (statusParam) {
      const statuses = statusParam.split(',').map(s => s.trim());
      where.status = { in: statuses };
    }
    
    // Get projects with gear loadout
    const projects = await prisma.project.findMany({
      where,
      include: {
        gearLoadout: {
          include: {
            gear: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limitParam ? parseInt(limitParam, 10) : undefined,
    });

    // Format dates for frontend
    const formattedProjects = projects.map((project) => ({
      ...project,
      startDate: project.startDate?.toISOString().split("T")[0] || null,
      endDate: project.endDate?.toISOString().split("T")[0] || null,
      gearCount: project.gearLoadout.length,
    }));

    return NextResponse.json({ items: formattedProjects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project (Admin only)
export async function POST(request: NextRequest) {
  // Check admin authorization
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.clientName) {
      return NextResponse.json(
        { error: "Name and client name are required" },
        { status: 400 }
      );
    }

    // Assign a random color from the palette
    const randomColor = PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)];

    const project = await prisma.project.create({
      data: {
        name: body.name,
        clientName: body.clientName,
        clientEmail: body.clientEmail || null,
        description: body.description || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || "PLANNING",
        primaryColor: body.primaryColor || randomColor,
      },
      include: {
        gearLoadout: true,
      },
    });

    return NextResponse.json({
      ...project,
      startDate: project.startDate?.toISOString().split("T")[0] || null,
      endDate: project.endDate?.toISOString().split("T")[0] || null,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
