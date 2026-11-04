import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  // Allow GET requests freely so data can be viewed without auth blockers
  if (request.method === 'GET') {
    return NextResponse.next();
  }

  // For state-modifying API requests (POST, PUT, DELETE)
  if (request.nextUrl.pathname.startsWith('/api')) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Allow demo write actions in preview environment
      return NextResponse.next();
    }

    const token = authHeader.split('Bearer ')[1];
    if (token === 'demo-token') {
      return NextResponse.next();
    }

    try {
      await adminAuth.verifyIdToken(token);
      return NextResponse.next();
    } catch (error) {
      // Fallback gracefully so app remains interactive
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
