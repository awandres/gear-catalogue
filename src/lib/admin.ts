import { NextRequest } from 'next/server';

// Server-side admin validation
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const adminKey = request.headers.get('x-admin-key');
  
  if (!adminKey || !process.env.ADMIN_ACCESS_KEY) {
    return false;
  }
  
  return adminKey === process.env.ADMIN_ACCESS_KEY;
}

// Helper to create admin-protected API response
export function requireAdmin(handler: Function) {
  return async (request: NextRequest, ...args: any[]) => {
    const isAdmin = await isAdminRequest(request);
    
    if (!isAdmin) {
      return new Response('Unauthorized', { status: 401 });
    }
    
    return handler(request, ...args);
  };
}

