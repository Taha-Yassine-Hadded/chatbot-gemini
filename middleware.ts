// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // Protéger les routes /chat et /history
  if (!session && (req.nextUrl.pathname.startsWith('/chat') || req.nextUrl.pathname.startsWith('/history'))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Rediriger vers /chat si déjà connecté et sur /login ou /signup
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/chat', req.url))
  }

  return res
}

export const config = {
  matcher: ['/chat/:path*', '/history/:path*', '/login', '/signup']
}