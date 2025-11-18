import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (!key) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    
    // Check if it's the full admin key
    if (key === process.env.ADMIN_ACCESS_KEY) {
      return NextResponse.json({ valid: true, accessLevel: 'full' });
    }
    
    // Check if it's the Vetted Trainers key
    if (key === process.env.VETTED_TRAINERS_KEY) {
      return NextResponse.json({ valid: true, accessLevel: 'vetted' });
    }
    
    return NextResponse.json({ valid: false });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}



