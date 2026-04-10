'use client'

import { useState, useEffect } from 'react'
import { Search, Activity, FileText, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import Header from '@/components/Header'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

interface DiagnosisResult {
  id: string
  blogName: string
  platform: string
  overallScore: number
  seoScore: number
  contentScore: number
  activityScore: number
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendations: { category: string; title: string; description: string; priority: string }[]
}

interface HistoryItem {
  id: string
  blog_url: string
  overall_score: number
  seo_score: number
  content_score: number
  activity_score: number
  analyzed_at: string
}

function ScoreCircle({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" className="text-gray-200" />
          <circle cx="40" cy="40" r="36" stroke={color} strokeWidth="6" fill="none"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{score}</span>
        </div>
      </div>
      <span className="text-sm text-muted font-medium">{label}</span>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: 'bg-danger/10 text-danger',
    medium: 'bg-warning/10 text-warning',
    low: 'bg-success/10 text-success',
  }
  const labels: Record<string, string> = { high: '높음', medium: '보통', low: '낮음' }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority] || styles.medium}`}>
      {labels[priority] || priority}
    </span>
  )
}

export default function BlogDiagnosePage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/blog/history')
      .then(r => r.json())
      .then(d => setHistory(d.history || []))
      .catch(() => {})
  }, [])

  const handleDiagnose = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/blog/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogUrl: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setResult(data)
      // Refresh history
      fetch('/api/blog/history').then(r => r.json()).then(d => setHistory(d.history || []))
    } catch {
      setError('블로그 진단에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const radarData = result ? [
    { subject: 'SEO', value: result.seoScore },
    { subject: '콘텐츠', value: result.contentScore },
    { subject: '활동성', value: result.activityScore },
  ] : []

  return (
    <>
      <Header title="블로그 진단" />
      <div className="space-y-6">
        {/* Search */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">블로그 URL 입력</h2>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDiagnose()}
              placeholder="https://blog.naver.com/example"
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
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
        </div>

        {/* Result */}
        {result && (
          <>
            {/* Overview */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{result.blogName}</h2>
                  <p className="text-sm text-muted">{url} · {result.platform}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-accent">{result.overallScore}<span className="text-base text-muted font-normal">/100</span></div>
                  <p className="text-sm text-muted">종합 점수</p>
                </div>
              </div>
              <p className="text-sm text-secondary">{result.summary}</p>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card flex justify-center gap-8">
                <ScoreCircle score={result.seoScore} label="SEO" color="var(--color-accent)" />
                <ScoreCircle score={result.contentScore} label="콘텐츠" color="var(--color-success)" />
                <ScoreCircle score={result.activityScore} label="활동성" color="var(--color-warning)" />
              </div>
              <div className="card">
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} />
                    <Radar dataKey="value" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" /> 강점</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-secondary flex items-start gap-2">
                      <span className="text-success mt-0.5">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-danger" /> 약점</h3>
                <ul className="space-y-2">
                  {result.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-secondary flex items-start gap-2">
                      <span className="text-danger mt-0.5">-</span> {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card">
              <h3 className="font-semibold mb-4">개선 권고사항</h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">{rec.category}</span>
                      <PriorityBadge priority={rec.priority} />
                      <span className="font-medium text-sm">{rec.title}</span>
                    </div>
                    <p className="text-sm text-secondary">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
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
                    <th className="pb-2 font-medium">블로그 URL</th>
                    <th className="pb-2 font-medium text-center">종합</th>
                    <th className="pb-2 font-medium text-center">SEO</th>
                    <th className="pb-2 font-medium text-center">콘텐츠</th>
                    <th className="pb-2 font-medium text-center">활동성</th>
                    <th className="pb-2 font-medium text-right">날짜</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b border-border/50">
                      <td className="py-2 truncate max-w-[200px]">{h.blog_url}</td>
                      <td className="py-2 text-center font-semibold">{h.overall_score}</td>
                      <td className="py-2 text-center">{h.seo_score}</td>
                      <td className="py-2 text-center">{h.content_score}</td>
                      <td className="py-2 text-center">{h.activity_score}</td>
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
