import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  
  const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/']
  const authPaths = ['/login', '/signup', '/forgot-password', '/reset-password']

  const isPublicPath = publicPaths.some(p => nextUrl.pathname === p || nextUrl.pathname.startsWith('/api/auth'))
  const isAuthPath = authPaths.some(p => nextUrl.pathname === p)

  if (isLoggedIn && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
