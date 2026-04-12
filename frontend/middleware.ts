import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 不需要登录就能访问的路径
const PUBLIC_PATHS = ['/login', '/register', '/api', '/_next', '/images', '/favicon.ico']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 检查是否是公开路径
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname.startsWith(path)
  )
  
  if (isPublicPath) {
    return NextResponse.next()
  }
  
  // 检查是否有登录 token
  const token = request.cookies.get('mealie_token')?.value
  
  if (!token) {
    // 未登录，重定向到登录页
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
}
