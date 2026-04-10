'use client'

import { useState, useEffect } from 'react'
import { Search, Clock, ChevronRight } from 'lucide-react'
import Header from '@/components/Header'

interface SeoDetail {
  score: number
  feedback: string
}

interface DiagnosisResult {
  id: string
  title: string
  seoScore: number
  readabilityScore: number
  rankingPotential: number
  overallScore: number
  summary: string
  seoAnalysis: {
    titleOptimization: SeoDetail
    keywordUsage: SeoDetail
    structure: SeoDetail
    metaDescription: SeoDetail
    imageOptimization: SeoDetail
  }
  recommendations: { title: string; description: string; impact: string }[]
  competitorTips: string[]
}

interface HistoryItem {
  id: string
  post_url: string
  keyword: string | null
  seo_score: number
  readability_score: number
  ranking_potential: number
  analyzed_at: string
}

function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'bg-success' : score >= 40 ? 'bg-warning' : 'bg-danger'
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-secondary">{label}</span>
        <span className="font-semibold">{score}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

function ImpactBadge({ impact }: { impact: string }) {
  const styles: Record<string, string> = {
    high: 'bg-danger/10 text-danger',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-success/10 text-success',
  }
  const labels: Record<string, string> = { high: '높음', medium: '보통', low: '낮음' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[impact] || styles.medium}`}>
      영향도: {labels[impact] || impact}
    </span>
  )
}

const SEO_LABELS: Record<string, string> = {
  titleOptimization: '제목 최적화',
  keywordUsage: '키워드 활용',
  structure: '글 구조',
  metaDescription: '메타 설명',
  imageOptimization: '이미지 최적화',
}

export default function PostDiagnosePage() {
  const [postUrl, setPostUrl] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/post/history')
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {})
  }, [])

  const handleDiagnose = async () => {
    if (!postUrl.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/post/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postUrl: postUrl.trim(), keyword: keyword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
      fetch('/api/post/history').then(r => r.json()).then(d => setHistory(d.history || []))
    } catch {
      setError('게시글 진단에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header title="게시글 진단" />
      <div className="space-y-6">
        {/* Input */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">게시글 분석</h2>
          <div className="space-y-3">
            <input
              type="url"
              value={postUrl}
              onChange={e => setPostUrl(e.target.value)}
              placeholder="게시글 URL (https://blog.naver.com/example/12345)"
              className="input w-full"
            />
            <div className="flex gap-3">
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleDiagnose()}
                placeholder="타겟 키워드 (선택사항)"
                className="input flex-1"
              />
              <button onClick={handleDiagnose} disabled={loading} className="btn-primary whitespace-nowrap">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    분석 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2"><Search className="w-4 h-4" /> 진단하기</span>
                )}
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </div>

        {/* Result */}
        {result && (
          <>
            {/* Overview */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{result.title}</h2>
                <div className="text-3xl font-bold text-accent">{result.overallScore}<span className="text-base text-muted font-normal">/100</span></div>
              </div>
              <p className="text-sm text-secondary mb-4">{result.summary}</p>
              <div className="grid grid-cols-3 gap-4">
                <ScoreBar score={result.seoScore} label="SEO 점수" />
                <ScoreBar score={result.readabilityScore} label="가독성" />
                <ScoreBar score={result.rankingPotential} label="순위 가능성" />
              </div>
            </div>

            {/* SEO Detail */}
            <div className="card">
              <h3 className="font-semibold mb-4">SEO 상세 분석</h3>
              <div className="space-y-4">
                {result.seoAnalysis && Object.entries(result.seoAnalysis).map(([key, detail]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{SEO_LABELS[key] || key}</span>
                      <span className={`text-sm font-bold ${detail.score >= 70 ? 'text-success' : detail.score >= 40 ? 'text-warning' : 'text-danger'}`}>
                        {detail.score}점
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${detail.score >= 70 ? 'bg-success' : detail.score >= 40 ? 'bg-warning' : 'bg-danger'}`}
                        style={{ width: `${detail.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-secondary">{detail.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="card">
              <h3 className="font-semibold mb-4">개선 권고사항</h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <ChevronRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{rec.title}</span>
                        <ImpactBadge impact={rec.impact} />
                      </div>
                      <p className="text-sm text-secondary">{rec.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Competitor Tips */}
            {result.competitorTips?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold mb-4">경쟁력 향상 팁</h3>
                <ul className="space-y-2">
                  {result.competitorTips.map((tip, i) => (
                    <li key={i} className="text-sm text-secondary flex items-start gap-2">
                      <span className="text-accent font-bold">{i + 1}.</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> 진단 이력</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-2 font-medium">게시글 URL</th>
                    <th className="pb-2 font-medium">키워드</th>
                    <th className="pb-2 font-medium text-center">SEO</th>
                    <th className="pb-2 font-medium text-center">가독성</th>
                    <th className="pb-2 font-medium text-center">순위</th>
                    <th className="pb-2 font-medium text-right">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b border-border/50">
                      <td className="py-2 truncate max-w-[200px]">{h.post_url}</td>
                      <td className="py-2 text-muted">{h.keyword || '-'}</td>
                      <td className="py-2 text-center font-semibold">{h.seo_score}</td>
                      <td className="py-2 text-center">{h.readability_score}</td>
                      <td className="py-2 text-center">{h.ranking_potential}</td>
                      <td className="py-2 text-right text-muted">{new Date(h.analyzed_at).toLocaleDateString('ko-KR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
