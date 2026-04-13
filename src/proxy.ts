import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const isAuth = request.cookies.has('iklanin_admin_auth')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // Jika belum login dan bukan di halaman login, lemparkan ke /login
  if (!isAuth && !isLoginPage && !request.nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Jika sudah login tapi buka /login, lemparkan ke dashboard
  if (isAuth && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
