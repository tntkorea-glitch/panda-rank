import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const db = await getDb()
  const history = await db.all(
    'SELECT id, keyword, title, seo_score, word_count, tone, created_at FROM ai_contents WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [session.id]
  )

  return NextResponse.json({ history })
}
