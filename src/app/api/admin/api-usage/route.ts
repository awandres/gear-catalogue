import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdminRequest } from '@/lib/admin';

const DAILY_LIMIT = 100;

// GET /api/admin/api-usage - Get today's API usage
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log('Fetching API usage for date:', today.toISOString());

    const usage = await prisma.apiUsage.findUnique({
      where: { date: today }
    });

    console.log('Found usage:', usage);

    const used = usage?.imageSearchCalls || 0;
    const remaining = Math.max(0, DAILY_LIMIT - used);

    return NextResponse.json({
      date: today.toISOString(),
      used,
      remaining,
      limit: DAILY_LIMIT,
      percentage: Math.round((used / DAILY_LIMIT) * 100)
    });
  } catch (error) {
    console.error('Error fetching API usage:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch API usage', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to increment usage (can be called from other routes)
export async function incrementApiUsage(count: number = 1) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const usage = await prisma.apiUsage.upsert({
    where: { date: today },
    create: {
      date: today,
      imageSearchCalls: count
    },
    update: {
      imageSearchCalls: {
        increment: count
      }
    }
  });

  return usage;
}

// Helper function to check if we can make more API calls
export async function canMakeApiCalls(requestedCount: number = 1): Promise<{ allowed: boolean; available: number }> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const usage = await prisma.apiUsage.findUnique({
    where: { date: today }
  });

  const used = usage?.imageSearchCalls || 0;
  const remaining = Math.max(0, DAILY_LIMIT - used);
  const allowed = remaining >= requestedCount;

  return { allowed, available: remaining };
}

