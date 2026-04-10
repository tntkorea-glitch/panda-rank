'use client'

import { useState } from 'react'
import { Check, Crown } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/useAuth'
import { PLAN_LIMITS, type PlanType } from '@/lib/plans'

const PLANS: PlanType[] = ['free', 'basic', 'premium', 'premiumplus']

const FEATURES = [
  { key: 'keywordsPerMin', label: '키워드 분석 (분당)' },
  { key: 'aiCreditsPerDay', label: 'AI 크레딧 (일)' },
  { key: 'blogDiagnosisPerDay', label: '블로그 진단 (일)' },
  { key: 'postDiagnosisPerDay', label: '게시글 진단 (일)' },
  { key: 'influencerSearchPerDay', label: '인플루언서 찾기 (일)' },
  { key: 'blogRankPosts', label: '블로그 순위 등록 게시글' },
  { key: 'blogRankKeywords', label: '블로그 순위 등록 키워드' },
  { key: 'concurrent', label: '동시 접속' },
  { key: 'adFree', label: '광고 제거' },
]

export default function MembershipPage() {
  const [annual, setAnnual] = useState(false)
  const { user } = useAuth()

  return (
    <>
      <Header title="멤버십" />
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">나에게 맞는 플랜을 선택하세요</h2>
          <p className="text-sm text-gray-500 mt-2">크리에이터 + 셀러 통합 멤버십</p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${!annual ? 'font-semibold text-foreground' : 'text-gray-400'}`}>월간 결제</span>
            <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition ${annual ? 'bg-accent' : 'bg-gray-300'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm ${annual ? 'font-semibold text-foreground' : 'text-gray-400'}`}>
              연간 결제 <span className="text-accent text-xs">(2개월 무료)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {PLANS.map(plan => {
            const info = PLAN_LIMITS[plan]
            const isCurrent = user?.plan === plan
            const price = annual ? info.annualPrice : info.price
            const isPopular = plan === 'premium'

            return (
              <div key={plan} className={`rounded-xl border p-6 relative ${isPopular ? 'border-accent shadow-lg' : 'border-border'} ${isCurrent ? 'ring-2 ring-accent' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs px-3 py-1 rounded-full font-medium">인기</div>
                )}
                <div className="text-center mb-4">
                  <Crown className={`w-6 h-6 mx-auto mb-2 ${plan === 'free' ? 'text-gray-400' : 'text-accent'}`} />
                  <h3 className="font-bold text-lg">{info.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold">{price === 0 ? '무료' : `${(annual ? Math.round(price / 12) : price).toLocaleString()}원`}</span>
                    {price > 0 && <span className="text-xs text-gray-400">/월</span>}
                  </div>
                  {annual && price > 0 && (
                    <p className="text-xs text-accent mt-1">연 {price.toLocaleString()}원</p>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  {FEATURES.map(f => {
                    const val = info[f.key as keyof typeof info]
                    return (
                      <li key={f.key} className="flex items-center gap-2">
                        <Check className={`w-3.5 h-3.5 flex-shrink-0 ${val ? 'text-accent' : 'text-gray-300'}`} />
                        <span className="text-gray-600">{f.label}: <strong>{typeof val === 'boolean' ? (val ? 'O' : 'X') : val}{''}
                          {f.key === 'concurrent' ? '명' : f.key.includes('Per') ? '회' : '개'}
                        </strong></span>
                      </li>
                    )
                  })}
                </ul>

                <button
                  disabled={isCurrent}
                  className={`mt-6 w-full py-2.5 rounded-lg text-sm font-medium transition ${
                    isCurrent ? 'bg-gray-100 text-gray-400 cursor-default' :
                    isPopular ? 'bg-accent text-white hover:bg-accent/90' :
                    'border border-border text-foreground hover:bg-gray-50'
                  }`}
                >
                  {isCurrent ? '현재 플랜' : price === 0 ? '무료로 시작' : '시작하기'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
