import bcrypt from 'bcryptjs'
import { getDb } from './db'
import { generateId, generateReferralCode } from './utils'
import type { OAuthProvider } from './oauth'
import type { PlanType } from './plans'

export interface User {
  id: string
  email: string
  name: string
  password_hash: string
  role: 'user' | 'admin'
  plan: PlanType
  plan_expiry: string | null
  referral_code: string
  referred_by: string | null
  provider: OAuthProvider | null
  provider_id: string | null
  created_at: string
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  referralCode?: string
): Promise<User | null> {
  const db = await getDb()
  const existing = await db.get<User>('SELECT * FROM users WHERE email = ?', [email])
  if (existing) return null

  let referredBy: string | null = null
  if (referralCode) {
    const referrer = await db.get<User>('SELECT id FROM users WHERE referral_code = ?', [referralCode])
    if (referrer) referredBy = referrer.id
  }

  const user: User = {
    id: generateId(),
    email,
    name,
    password_hash: bcrypt.hashSync(password, 10),
    role: 'user',
    plan: 'free',
    plan_expiry: null,
    referral_code: generateReferralCode(),
    referred_by: referredBy,
    provider: null,
    provider_id: null,
    created_at: new Date().toISOString(),
  }

  await db.run(
    `INSERT INTO users (id, email, name, password_hash, role, plan, plan_expiry, referral_code, referred_by, provider, provider_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user.id, user.email, user.name, user.password_hash, user.role, user.plan, user.plan_expiry, user.referral_code, user.referred_by, user.provider, user.provider_id, user.created_at]
  )

  return user
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const db = await getDb()
  const user = await db.get<User>('SELECT * FROM users WHERE email = ?', [email])
  if (!user) return null
  if (!user.password_hash) return null
  const valid = bcrypt.compareSync(password, user.password_hash)
  return valid ? user : null
}

export async function upsertOAuthUser(
  provider: OAuthProvider,
  providerId: string,
  email: string,
  name: string
): Promise<User> {
  const db = await getDb()

  // 1) provider + providerId로 기존 사용자 찾기
  let user = await db.get<User>('SELECT * FROM users WHERE provider = ? AND provider_id = ?', [provider, providerId])
  if (user) return user

  // 2) 이메일로 매칭
  if (email) {
    user = await db.get<User>('SELECT * FROM users WHERE email = ?', [email])
    if (user) {
      await db.run('UPDATE users SET provider = ?, provider_id = ? WHERE id = ?', [provider, providerId, user.id])
      return { ...user, provider, provider_id: providerId }
    }
  }

  // 3) 신규 생성
  const newUser: User = {
    id: generateId(),
    email: email || `${provider}_${providerId}`,
    name: name || '사용자',
    password_hash: '',
    role: 'user',
    plan: 'free',
    plan_expiry: null,
    referral_code: generateReferralCode(),
    referred_by: null,
    provider,
    provider_id: providerId,
    created_at: new Date().toISOString(),
  }

  await db.run(
    `INSERT INTO users (id, email, name, password_hash, role, plan, plan_expiry, referral_code, referred_by, provider, provider_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [newUser.id, newUser.email, newUser.name, newUser.password_hash, newUser.role, newUser.plan, newUser.plan_expiry, newUser.referral_code, newUser.referred_by, newUser.provider, newUser.provider_id, newUser.created_at]
  )

  return newUser
}

export async function findUserById(id: string): Promise<User | null> {
  const db = await getDb()
  return (await db.get<User>('SELECT * FROM users WHERE id = ?', [id])) || null
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb()
  return db.all<User>('SELECT * FROM users ORDER BY created_at DESC')
}

export async function updateUserPlan(userId: string, plan: PlanType, expiryDays?: number): Promise<boolean> {
  const db = await getDb()
  const planExpiry = expiryDays ? new Date(Date.now() + expiryDays * 86400000).toISOString() : null
  const { rowsAffected } = await db.run('UPDATE users SET plan = ?, plan_expiry = ? WHERE id = ?', [plan, planExpiry, userId])
  return rowsAffected > 0
}

export async function deleteUser(userId: string): Promise<boolean> {
  const db = await getDb()
  const { rowsAffected } = await db.run('DELETE FROM users WHERE id = ?', [userId])
  return rowsAffected > 0
}

export async function getReferralCount(userId: string): Promise<number> {
  const db = await getDb()
  const result = await db.get<{ cnt: number }>('SELECT COUNT(*) as cnt FROM users WHERE referred_by = ?', [userId])
  return result?.cnt || 0
}
