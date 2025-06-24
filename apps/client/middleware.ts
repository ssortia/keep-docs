import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/auth/callback',
  '/verify-email',
]

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value ||
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  const isAuthenticated = !!token
  const pathname = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Удаляем принудительный редирект с auth страниц
  // Позволяем AuthLayout самому решать, что делать с авторизованными пользователями

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}