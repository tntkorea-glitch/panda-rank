import { claudeComplete } from './anthropic'

interface KeywordStats {
  keyword: string
  monthlySearchVolume: number
  competition: 'high' | 'medium' | 'low'
  competitionValue: number
  trend: 'up' | 'down' | 'same'
  monthlyTrend: { month: string; score: number }[]
  relatedKeywords: { keyword: string; volume: number; competition: string }[]
}

// Naver Search Ad API client
// Requires: NAVER_AD_API_KEY, NAVER_AD_SECRET, NAVER_AD_CUSTOMER_ID
async function fetchNaverAdApi(keyword: string): Promise<KeywordStats | null> {
  const apiKey = process.env.NAVER_AD_API_KEY
  const secret = process.env.NAVER_AD_SECRET
  const customerId = process.env.NAVER_AD_CUSTOMER_ID

  if (!apiKey || !secret || !customerId) return null

  try {
    const timestamp = Date.now().toString()
    const crypto = await import('crypto')
    const signature = crypto.createHmac('sha256', secret)
      .update(`${timestamp}.GET./keywordstool`)
      .digest('base64')

    const url = `https://api.naver.com/keywordstool?hintKeywords=${encodeURIComponent(keyword)}&showDetail=1`
    const res = await fetch(url, {
      headers: {
        'X-Timestamp': timestamp,
        'X-API-KEY': apiKey,
        'X-Customer': customerId,
        'X-Signature': signature,
      },
    })

    if (!res.ok) return null
    const data = await res.json()
    const kw = data.keywordList?.[0]
    if (!kw) return null

    return {
      keyword: kw.relKeyword || keyword,
      monthlySearchVolume: (kw.monthlyPcQcCnt || 0) + (kw.monthlyMobileQcCnt || 0),
      competition: kw.compIdx === '높음' ? 'high' : kw.compIdx === '중간' ? 'medium' : 'low',
      competitionValue: kw.compIdx === '높음' ? 80 : kw.compIdx === '중간' ? 50 : 20,
      trend: 'same',
      monthlyTrend: [],
      relatedKeywords: (data.keywordList || []).slice(1, 6).map((k: Record<string, unknown>) => ({
        keyword: k.relKeyword as string,
        volume: ((k.monthlyPcQcCnt as number) || 0) + ((k.monthlyMobileQcCnt as number) || 0),
        competition: k.compIdx as string,
      })),
    }
  } catch {
    return null
  }
}

// AI fallback when Naver API is not available
async function fetchAIEstimate(keyword: string): Promise<KeywordStats> {
  const now = new Date()
  const months: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const prompt = `"${keyword}" 키워드의 네이버 검색 트렌드를 분석해주세요.

아래 JSON 형식으로만 응답하세요:
{
  "monthlySearchVolume": 10000,
  "competition": "high",
  "competitionValue": 75,
  "trend": "up",
  "monthlyTrend": [${months.map(m => `{"month":"${m}","score":50}`).join(',')}],
  "relatedKeywords": [
    {"keyword":"관련1","volume":5000,"competition":"medium"},
    {"keyword":"관련2","volume":3000,"competition":"low"},
    {"keyword":"관련3","volume":2000,"competition":"high"},
    {"keyword":"관련4","volume":1500,"competition":"low"},
    {"keyword":"관련5","volume":1000,"competition":"medium"}
  ]
}

monthlyTrend의 score는 0~100 상대 검색량 지수 (최고=100).
competition은 "high","medium","low" 중 하나.
competitionValue는 0~100 숫자.
한국 시장 특성을 고려하여 현실적으로 추정해주세요.`

  const raw = await claudeComplete(prompt, {
    system: '한국 키워드 검색 트렌드 전문 분석가입니다. JSON만 응답하세요.',
    temperature: 0.7,
    maxTokens: 2000,
  })

  const match = raw.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      const data = JSON.parse(match[0])
      return { keyword, ...data }
    } catch { /* fall through */ }
  }

  return {
    keyword,
    monthlySearchVolume: 0,
    competition: 'medium',
    competitionValue: 50,
    trend: 'same',
    monthlyTrend: months.map(m => ({ month: m, score: 50 })),
    relatedKeywords: [],
  }
}

export async function getKeywordStats(keyword: string): Promise<KeywordStats> {
  const naverData = await fetchNaverAdApi(keyword)
  if (naverData) return naverData
  return fetchAIEstimate(keyword)
}

export async function getTrendingKeywords(platform: string = 'naver'): Promise<{ keyword: string; rank: number; volume: number; prevRank: number | null; change: string }[]> {
  const prompt = `현재 한국에서 가장 인기 있는 검색 키워드 20개를 ${platform === 'google' ? '구글' : '네이버'} 기준으로 알려주세요.

JSON 배열로만 응답하세요:
[
  {"keyword":"키워드1","rank":1,"volume":50000,"prevRank":2,"change":"up"},
  {"keyword":"키워드2","rank":2,"volume":45000,"prevRank":1,"change":"down"},
  ...
]
change는 "up","down","same","new" 중 하나.
prevRank가 없으면 null.
현재 시점의 실제 트렌딩 키워드를 최대한 현실적으로 추정해주세요.`

  const raw = await claudeComplete(prompt, {
    system: '한국 실시간 검색 트렌드 전문가입니다. JSON 배열만 응답하세요.',
    temperature: 0.8,
    maxTokens: 2000,
  })

  const match = raw.match(/\[[\s\S]*\]/)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch { /* fall through */ }
  }
  return []
}
