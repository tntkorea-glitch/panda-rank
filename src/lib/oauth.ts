export type OAuthProvider = 'kakao' | 'naver' | 'google'

export interface OAuthProviderConfig {
  authorizeUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
  clientId: () => string | undefined
  clientSecret: () => string | undefined
  parseUser: (raw: Record<string, unknown>) => { providerId: string; email: string; name: string }
}

export const OAUTH_PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  kakao: {
    authorizeUrl: 'https://kauth.kakao.com/oauth/authorize',
    tokenUrl: 'https://kauth.kakao.com/oauth/token',
    userInfoUrl: 'https://kapi.kakao.com/v2/user/me',
    scope: 'profile_nickname',
    clientId: () => process.env.KAKAO_CLIENT_ID,
    clientSecret: () => process.env.KAKAO_CLIENT_SECRET,
    parseUser: (raw: Record<string, unknown>) => ({
      providerId: String(raw.id),
      email: (raw.kakao_account as Record<string, unknown>)?.email as string || '',
      name: ((raw.kakao_account as Record<string, unknown>)?.profile as Record<string, unknown>)?.nickname as string
        || (raw.properties as Record<string, unknown>)?.nickname as string || '카카오 사용자',
    }),
  },
  naver: {
    authorizeUrl: 'https://nid.naver.com/oauth2.0/authorize',
    tokenUrl: 'https://nid.naver.com/oauth2.0/token',
    userInfoUrl: 'https://openapi.naver.com/v1/nid/me',
    scope: '',
    clientId: () => process.env.NAVER_CLIENT_ID,
    clientSecret: () => process.env.NAVER_CLIENT_SECRET,
    parseUser: (raw: Record<string, unknown>) => {
      const resp = raw.response as Record<string, unknown> | undefined
      return {
        providerId: String(resp?.id || ''),
        email: (resp?.email as string) || '',
        name: (resp?.nickname as string) || (resp?.name as string) || '네이버 사용자',
      }
    },
  },
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scope: 'openid email profile',
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    parseUser: (raw: Record<string, unknown>) => ({
      providerId: String(raw.id || raw.sub || ''),
      email: (raw.email as string) || '',
      name: (raw.name as string) || (raw.given_name as string) || '구글 사용자',
    }),
  },
}

export function isValidProvider(p: string): p is OAuthProvider {
  return p === 'kakao' || p === 'naver' || p === 'google'
}

export function getRedirectUri(origin: string, provider: OAuthProvider): string {
  return `${origin}/api/auth/oauth/${provider}/callback`
}
