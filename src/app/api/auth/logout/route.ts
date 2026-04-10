import { NextResponse } from 'next/server'
import { getLogoutCookieOptions } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(getLogoutCookieOptions())
  return res
}
