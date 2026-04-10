import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PROTECTED = ['/keyword', '/write', '/mypage']
const ADMIN_ONLY = ['/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAdmin = ADMIN_ONLY.some(p => pathname.startsWith(p))

  if (!isProtected && !isAdmin) return NextResponse.next()

  const token = req.cookies.get('panda-rank-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const user = await verifyToken(token)
  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdmin && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/keyword', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/keyword/:path*', '/write/:path*', '/mypage/:path*', '/admin/:path*'],
}
