'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, RefreshCw, ArrowUp, ArrowDown, Minus, TrendingUp } from 'lucide-react'
import Header from '@/components/Header'

interface Track {
  id: string
  blog_url: string
  post_url: string
  keyword: string
  current_rank: number | null
  previous_rank: number | null
  created_at: string
}

function RankChange({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null) return <span className="text-muted text-xs">순위권 밖</span>
  if (previous === null) return <span className="text-accent text-xs font-medium">NEW</span>
  const diff = previous - current
  if (diff > 0) return <span className="text-success text-xs font-medium flex items-center gap-0.5"><ArrowUp className="w-3 h-3" />{diff}</span>
  if (diff < 0) return <span className="text-danger text-xs font-medium flex items-center gap-0.5"><ArrowDown className="w-3 h-3" />{Math.abs(diff)}</span>
  return <span className="text-muted text-xs flex items-center gap-0.5"><Minus className="w-3 h-3" />-</span>
}

export default function RankPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [blogUrl, setBlogUrl] = useState('')
  const [postUrl, setPostUrl] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  const loadTracks = useCallback(() => {
    fetch('/api/rank/track')
      .then(r => r.json())
      .then(d => setTracks(d.tracks || []))
      .catch(() => {})
  }, [])

  useEffect(() => { loadTracks() }, [loadTracks])

  const handleAdd = async () => {
    if (!blogUrl.trim() || !postUrl.trim() || !keyword.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/rank/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogUrl: blogUrl.trim(), postUrl: postUrl.trim(), keyword: keyword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setBlogUrl('')
      setPostUrl('')
      setKeyword('')
      setShowForm(false)
      loadTracks()
    } catch {
      setError('등록에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/rank/track?id=${id}`, { method: 'DELETE' })
    loadTracks()
  }

  const handleCheck = async (trackId: string) => {
    setChecking(trackId)
    try {
      const res = await fetch('/api/rank/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId }),
      })
      if (res.ok) loadTracks()
    } catch { /* ignore */ }
    finally { setChecking(null) }
  }

  const handleCheckAll = async () => {
    for (const track of tracks) {
      await handleCheck(track.id)
    }
  }

  return (
    <>
      <Header title="순위 추적" />
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">등록된 추적: {tracks.length}개</p>
          <div className="flex gap-2">
            {tracks.length > 0 && (
              <button onClick={handleCheckAll} disabled={checking !== null} className="btn-secondary text-sm flex items-center gap-1.5">
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} /> 전체 순위 체크
              </button>
            )}
            <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> 새 추적 등록
            </button>
          </div>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">순위 추적 등록</h2>
            <div className="space-y-3">
              <input
                type="url"
                value={blogUrl}
                onChange={e => setBlogUrl(e.target.value)}
                placeholder="블로그 URL (https://blog.naver.com/example)"
                className="input w-full"
              />
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
                  onKeyDown={e => e.key === 'Enter' && handleAdd()}
                  placeholder="추적할 키워드"
                  className="input flex-1"
                />
                <button onClick={handleAdd} disabled={loading} className="btn-primary whitespace-nowrap">
                  {loading ? '등록 중...' : '등록'}
                </button>
              </div>
              {error && <p className="text-sm text-danger">{error}</p>}
            </div>
          </div>
        )}

        {/* Tracks List */}
        {tracks.length === 0 ? (
          <div className="card text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-muted">등록된 순위 추적이 없습니다.</p>
            <p className="text-sm text-muted mt-1">블로그 게시글의 검색 순위를 추적해보세요.</p>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 font-medium">키워드</th>
                  <th className="pb-3 font-medium">게시글</th>
                  <th className="pb-3 font-medium text-center">현재 순위</th>
                  <th className="pb-3 font-medium text-center">변동</th>
                  <th className="pb-3 font-medium text-right">액션</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map(t => (
                  <tr key={t.id} className="border-b border-border/50">
                    <td className="py-3">
                      <span className="font-medium">{t.keyword}</span>
                    </td>
                    <td className="py-3 truncate max-w-[250px]">
                      <span className="text-muted">{t.post_url}</span>
                    </td>
                    <td className="py-3 text-center">
                      {t.current_rank !== null ? (
                        <span className="text-lg font-bold text-accent">{t.current_rank}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <RankChange current={t.current_rank} previous={t.previous_rank} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCheck(t.id)}
                          disabled={checking === t.id}
                          className="p-1.5 rounded hover:bg-gray-100 text-muted hover:text-accent transition-colors"
                          title="순위 체크"
                        >
                          <RefreshCw className={`w-4 h-4 ${checking === t.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 rounded hover:bg-gray-100 text-muted hover:text-danger transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
