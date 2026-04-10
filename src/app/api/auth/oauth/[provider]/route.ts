import { NextRequest, NextResponse } from 'next/server'
import { OAUTH_PROVIDERS, isValidProvider, getRedirectUri } from '@/lib/oauth'
import crypto from 'crypto'

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params
  if (!isValidProvider(provider)) {
    return NextResponse.json({ error: '지원하지 않는 소셜 로그인입니다.' }, { status: 400 })
  }

  const config = OAUTH_PROVIDERS[provider]
  const clientId = config.clientId()
  if (!clientId) {
    return NextResponse.json({ error: `${provider} 로그인이 설정되지 않았습니다.` }, { status: 500 })
  }

  const state = crypto.randomBytes(16).toString('hex')
  const origin = req.nextUrl.origin
  const redirectUri = getRedirectUri(origin, provider)

  const url = new URL(config.authorizeUrl)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('state', state)
  if (config.scope) url.searchParams.set('scope', config.scope)

  const res = NextResponse.redirect(url.toString())
  res.cookies.set('oauth_state', state, { httpOnly: true, maxAge: 600, path: '/' })
  return res
}
