'use client'

import { useState, useEffect } from 'react'
import { Users, Search, PenTool, BarChart3 } from 'lucide-react'
import Header from '@/components/Header'

interface Stats {
  totalUsers: number
  planDistribution: { plan: string; cnt: number }[]
  todayKeywordSearches: number
  todayAiCredits: number
  totalContents: number
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/admin/usage').then(r => r.json()).then(setStats)
  }, [])

  const cards = stats ? [
    { icon: Users, label: '전체 회원', value: stats.totalUsers, color: 'text-accent' },
    { icon: Search, label: '오늘 키워드 검색', value: stats.todayKeywordSearches, color: 'text-success' },
    { icon: PenTool, label: '오늘 AI 크레딧', value: stats.todayAiCredits, color: 'text-warning' },
    { icon: BarChart3, label: '총 생성 콘텐츠', value: stats.totalContents, color: 'text-danger' },
  ] : []

  return (
    <>
      <Header title="관리자 대시보드" />
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-border p-4">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {stats?.planDistribution && (
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-sm font-semibold mb-4">플랜별 회원 분포</h3>
            <div className="grid grid-cols-4 gap-4">
              {stats.planDistribution.map(({ plan, cnt }) => (
                <div key={plan} className="text-center">
                  <p className="text-xl font-bold">{cnt}</p>
                  <p className="text-xs text-gray-400 capitalize">{plan === 'premiumplus' ? 'Premium+' : plan}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          <a href="/admin/members" className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition">
            <Users className="w-6 h-6 text-accent mb-2" />
            <h3 className="font-semibold">회원 관리</h3>
            <p className="text-xs text-gray-400 mt-1">회원 목록, 플랜 변경, 삭제</p>
          </a>
          <a href="/admin/usage" className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition">
            <BarChart3 className="w-6 h-6 text-success mb-2" />
            <h3 className="font-semibold">이용 통계</h3>
            <p className="text-xs text-gray-400 mt-1">일별 검색량, AI 사용량</p>
          </a>
          <a href="/admin/keywords" className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition">
            <Search className="w-6 h-6 text-warning mb-2" />
            <h3 className="font-semibold">키워드 관리</h3>
            <p className="text-xs text-gray-400 mt-1">트렌딩 키워드 관리</p>
          </a>
        </div>
      </div>
    </>
  )
}
