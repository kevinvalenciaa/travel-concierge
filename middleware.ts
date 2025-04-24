import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware redirects from the root path to the dashboard path
export function middleware(request: NextRequest) {
  // Only redirect if the request is for the root path
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

// See "Matching Paths" below to learn more about path matching with middleware
export const config = {
  matcher: ['/'],
} 