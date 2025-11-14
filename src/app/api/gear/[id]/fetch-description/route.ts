import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin';

// Fetch description using Claude API
async function fetchDescriptionWithClaude(brand: string, name: string, category: string): Promise<string> {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!ANTHROPIC_API_KEY) {
    return `Professional ${category} by ${brand}`;
  }

  try {
    const prompt = `Write a concise 1-2 sentence description for this studio equipment:

Brand: ${brand}
Model: ${name}
Category: ${category}

Focus on what makes this gear unique, its sound characteristics, and typical use cases. Write as if for a professional studio catalog. Be factual and informative, not marketing hype.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: prompt
        }]
      }),
    });

    if (!response.ok) {
      console.warn('Claude API failed:', response.status);
      return `Professional ${category} by ${brand}`;
    }

    const data = await response.json();
    const description = data.content?.[0]?.text?.trim();
    
    return description || `Professional ${category} by ${brand}`;
  } catch (error) {
    console.error('Error fetching description from Claude:', error);
    return `Professional ${category} by ${brand}`;
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const { brand, name, category } = body;

    if (!brand || !name || !category) {
      return NextResponse.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    const description = await fetchDescriptionWithClaude(brand, name, category);

    return NextResponse.json({ 
      success: true,
      description 
    });
  } catch (error) {
    console.error('Error in fetch-description:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch description'
    }, { status: 500 });
  }
}

