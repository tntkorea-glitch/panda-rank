import { NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'
import { claudeStream } from '@/lib/anthropic'
import { checkUsageLimit, incrementUsage } from '@/lib/usage'
import type { PlanType } from '@/lib/plans'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return new Response(JSON.stringify({ error: '로그인이 필요합니다.' }), { status: 401, headers: { 'Content-Type': 'application/json' } })
  }

  const { allowed } = await checkUsageLimit(session.id, 'ai_credit_count', session.plan as PlanType)
  if (!allowed) {
    return new Response(JSON.stringify({ error: 'AI 크레딧 한도를 초과했습니다.' }), { status: 429, headers: { 'Content-Type': 'application/json' } })
  }

  const { keyword, title, wordCount = 1500, tone = '해요', emphasisContent } = await req.json()

  const toneMap: Record<string, string> = {
    '해요': '~해요 (친근한 톤)',
    '합니다': '~합니다 (존댓말)',
    '한다': '~한다 (반말)',
  }

  const prompt = `당신은 한국 네이버 블로그 SEO 전문가입니다.

아래 정보를 바탕으로 네이버 블로그에 최적화된 블로그 본문을 작성해주세요.

- 핵심 키워드: ${keyword}
- 블로그 제목: ${title}
- 말투: ${toneMap[tone] || tone}
${emphasisContent ? `- 강조할 내용: ${emphasisContent}` : ''}

본문 작성 규칙:
1. 전체 길이: ${wordCount}자 내외
2. 구조: 도입부(공감) -> 핵심 내용 -> 상세 설명 -> 마무리(CTA)
3. 핵심 키워드를 자연스럽게 3~5회 반복
4. 소제목(##)을 3~4개 사용하여 가독성 향상
5. 독자의 고민에 공감하는 친근한 말투 사용
6. 과장/허위 표현 금지
7. 네이버 블로그 특성에 맞는 줄바꿈과 이모지 활용
8. 실제 방문/행동을 유도하는 자연스러운 CTA 포함
9. C-Rank와 D.I.A+ 알고리즘에 최적화

본문만 출력하세요. 제목은 제외합니다.`

  try {
    await incrementUsage(session.id, 'ai_credit_count')

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const text of claudeStream(prompt, { temperature: 0.7, maxTokens: 3000 })) {
            if (text) controller.enqueue(encoder.encode(text))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch {
    return new Response(JSON.stringify({ error: '콘텐츠 생성에 실패했습니다.' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
