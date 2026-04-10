'use client'

import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import Header from '@/components/Header'

interface Keyword {
  id: number; keyword: string; platform: string; rank: number
  volume: number; change_direction: string; captured_at: string
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([])

  useEffect(() => {
    fetch('/api/admin/keywords').then(r => r.json()).then(d => setKeywords(d.keywords || []))
  }, [])

  const deleteKeyword = async (id: number) => {
    await fetch('/api/admin/keywords', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setKeywords(prev => prev.filter(k => k.id !== id))
  }

  return (
    <>
      <Header title="키워드 관리" />
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-500">순위</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">키워드</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">플랫폼</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">검색량</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">변동</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">수집일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">삭제</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map(k => (
                <tr key={k.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-bold text-accent">{k.rank}</td>
                  <td className="px-4 py-3 font-medium">{k.keyword}</td>
                  <td className="px-4 py-3 text-gray-400">{k.platform}</td>
                  <td className="px-4 py-3">{k.volume.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs">{k.change_direction}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(k.captured_at).toLocaleString('ko-KR')}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteKeyword(k.id)} className="text-danger hover:text-danger/70">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {keywords.length === 0 && <p className="text-sm text-gray-400 text-center py-8">수집된 키워드가 없습니다.</p>}
        </div>
      </div>
    </>
  )
}
