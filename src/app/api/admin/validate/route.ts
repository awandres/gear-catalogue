import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (!key) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }
    
    const isValid = key === process.env.ADMIN_ACCESS_KEY;
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}


