'use client'

import Link from 'next/link'
import { TrendingUp, Search, PenTool, BarChart3, Users, Zap } from 'lucide-react'

const FEATURES = [
  { icon: Search, title: '키워드 분석', desc: '검색량, 경쟁도, 트렌드를 한눈에 파악하세요' },
  { icon: PenTool, title: 'AI 글쓰기', desc: 'AI가 SEO 최적화된 블로그 글을 자동 생성합니다' },
  { icon: BarChart3, title: '블로그 진단', desc: '채널 영향력과 신뢰도를 등급으로 분석합니다' },
  { icon: Users, title: '인플루언서 찾기', desc: '23만명+ 인플루언서 중 최적의 파트너를 찾으세요' },
  { icon: Zap, title: '실시간 트렌딩', desc: '지금 가장 뜨는 키워드를 실시간으로 확인하세요' },
  { icon: TrendingUp, title: '순위 추적', desc: '내 게시글의 검색 순위를 매일 자동 추적합니다' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-accent" />
          <span className="text-xl font-bold text-foreground tracking-tight">Ranktica</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-3 py-2">로그인</Link>
          <Link href="/register" className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition">무료로 시작하기</Link>
        </div>
      </header>

      <section className="text-center py-20 px-6">
        <div className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-medium rounded-full mb-6">데이터 기반 크리에이터 성장</div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
          데이터와 AI로<br />채널 성장을 만듭니다
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">키워드 분석부터 AI 글쓰기, 블로그 진단까지 — 올인원 크리에이터 플랫폼</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register" className="bg-accent text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-accent/90 transition">무료로 시작하기</Link>
          <Link href="/membership" className="border border-border text-foreground px-8 py-3 rounded-lg text-base font-medium hover:bg-gray-50 transition">요금제 보기</Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">주요 기능</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-6 rounded-xl border border-border hover:shadow-md transition">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-sidebar-bg text-white text-center py-16 px-6">
        <h2 className="text-2xl font-bold mb-4">지금 바로 시작하세요</h2>
        <p className="text-sidebar-text mb-8">무료 플랜으로 핵심 기능을 체험할 수 있습니다</p>
        <Link href="/register" className="bg-accent text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-accent-light transition">무료로 시작하기</Link>
      </section>

      <footer className="text-center text-sm text-gray-400 py-8 px-6">
        <p>&copy; 2025-2026 Ranktica. All rights reserved.</p>
      </footer>
    </div>
  )
}
