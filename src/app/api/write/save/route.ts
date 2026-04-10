import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { generateId } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { keyword, title, content, hashtags, seoScore, wordCount, tone } = await req.json()

  const db = await getDb()
  const id = generateId()
  await db.run(
    'INSERT INTO ai_contents (id, user_id, keyword, title, content, hashtags, seo_score, word_count, tone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, session.id, keyword, title, content, JSON.stringify(hashtags), seoScore || 0, wordCount || 0, tone || '']
  )

  return NextResponse.json({ id })
}
