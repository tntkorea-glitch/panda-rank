import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const db = await getDb()
  const rows = await db.all(
    'SELECT id, post_url, keyword, seo_score, readability_score, ranking_potential, analyzed_at FROM post_diagnostics WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 50',
    [session.id]
  )

  return NextResponse.json({ history: rows })
}
