import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { generateId } from '@/lib/utils'
import { getPlanLimit, type PlanType } from '@/lib/plans'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const db = await getDb()
  const tracks = await db.all(
    `SELECT t.*,
      (SELECT h.rank FROM blog_rank_history h WHERE h.track_id = t.id ORDER BY h.recorded_at DESC LIMIT 1) as current_rank,
      (SELECT h.rank FROM blog_rank_history h WHERE h.track_id = t.id ORDER BY h.recorded_at DESC LIMIT 1 OFFSET 1) as previous_rank
    FROM blog_rank_tracks t
    WHERE t.user_id = ? AND t.is_active = 1
    ORDER BY t.created_at DESC`,
    [session.id]
  )

  return NextResponse.json({ tracks })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { blogUrl, postUrl, keyword } = await req.json()
  if (!blogUrl?.trim() || !postUrl?.trim() || !keyword?.trim()) {
    return NextResponse.json({ error: '블로그 URL, 게시글 URL, 키워드를 모두 입력해주세요.' }, { status: 400 })
  }

  const db = await getDb()
  const limits = getPlanLimit(session.plan as PlanType)

  // Check post limit
  const postCount = await db.get<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM blog_rank_tracks WHERE user_id = ? AND is_active = 1',
    [session.id]
  )
  if ((postCount?.cnt || 0) >= limits.blogRankPosts) {
    return NextResponse.json({ error: `순위 추적 게시글 한도(${limits.blogRankPosts}개)를 초과했습니다.` }, { status: 429 })
  }

  // Check keyword limit per post
  const kwCount = await db.get<{ cnt: number }>(
    'SELECT COUNT(*) as cnt FROM blog_rank_tracks WHERE user_id = ? AND post_url = ? AND is_active = 1',
    [session.id, postUrl.trim()]
  )
  if ((kwCount?.cnt || 0) >= limits.blogRankKeywords) {
    return NextResponse.json({ error: `게시글당 키워드 한도(${limits.blogRankKeywords}개)를 초과했습니다.` }, { status: 429 })
  }

  // Check duplicate
  const existing = await db.get(
    'SELECT id FROM blog_rank_tracks WHERE user_id = ? AND post_url = ? AND keyword = ? AND is_active = 1',
    [session.id, postUrl.trim(), keyword.trim()]
  )
  if (existing) return NextResponse.json({ error: '이미 동일한 키워드로 추적 중입니다.' }, { status: 409 })

  const id = generateId()
  await db.run(
    'INSERT INTO blog_rank_tracks (id, user_id, blog_url, post_url, keyword) VALUES (?, ?, ?, ?, ?)',
    [id, session.id, blogUrl.trim(), postUrl.trim(), keyword.trim()]
  )

  return NextResponse.json({ id, message: '순위 추적이 등록되었습니다.' })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const trackId = searchParams.get('id')
  if (!trackId) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 })

  const db = await getDb()
  await db.run(
    'UPDATE blog_rank_tracks SET is_active = 0 WHERE id = ? AND user_id = ?',
    [trackId, session.id]
  )

  return NextResponse.json({ message: '추적이 중지되었습니다.' })
}
