import type { UserRole } from './roles'

export type StoredUser = {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}

const USERS_KEY = 'oceaneye-users'
const API_BASE_KEY = 'oceaneye-api-base'

function getApiBase(): string {
  return localStorage.getItem(API_BASE_KEY) || 'http://localhost:4000'
}

export function setApiBase(url: string) {
  localStorage.setItem(API_BASE_KEY, url)
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as StoredUser[]
    return []
  } catch (_e) {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  try { // eslint-disable-next-line @typescript-eslint/no-unused-vars
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  } catch {}
}

export function findUserByEmail(email: string): StoredUser | undefined {
  if (!email) return undefined
  const users = loadUsers()
  return users.find(u => (u.email || '').toLowerCase() === email.toLowerCase())
}

export function findUserByPhone(phone: string): StoredUser | undefined {
  if (!phone) return undefined
  const users = loadUsers()
  return users.find(u => (u.phone || '') === phone)
}

export function registerUser(data: Omit<StoredUser, 'id'>): { ok: true; user: StoredUser } | { ok: false; error: string } {
  const users = loadUsers()
  const existsEmail = data.email ? users.some(u => (u.email || '').toLowerCase() === data.email.toLowerCase()) : false
  if (existsEmail) {
    return { ok: false, error: 'An account with this email already exists' }
  }
  const existsPhone = data.phone ? users.some(u => (u.phone || '') === data.phone) : false
  if (existsPhone) {
    return { ok: false, error: 'An account with this phone number already exists' }
  }
  const user: StoredUser = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    ...data
  }
  users.push(user)
  saveUsers(users)
  return { ok: true, user }
}

export function authenticate(identifier: string, password: string): { ok: true; user: StoredUser } | { ok: false; error: string } {
  let user: StoredUser | undefined
  if (identifier.includes('@')) {
    user = findUserByEmail(identifier)
  } else {
    user = findUserByPhone(identifier) || findUserByEmail(identifier)
  }
  if (!user) return { ok: false, error: 'Account not found. Please sign up.' }
  if (user.password !== password) return { ok: false, error: 'Invalid credentials' }
  return { ok: true, user }
}

export function persistSession(user: StoredUser) {
  localStorage.setItem('oceaneye-user-id', user.id)
  localStorage.setItem('oceaneye-user-role', user.role)
  localStorage.setItem('oceaneye-user-name', user.name)
  localStorage.setItem('oceaneye-user-email', user.email)
  localStorage.setItem('oceaneye-user-phone', user.phone)
}

export function clearSession() {
  localStorage.removeItem('oceaneye-user-id')
  localStorage.removeItem('oceaneye-user-role')
  localStorage.removeItem('oceaneye-user-name')
  localStorage.removeItem('oceaneye-user-email')
  localStorage.removeItem('oceaneye-user-phone')
}

export function getAllUsers(): StoredUser[] {
  return loadUsers()
}

// Backend-aware helpers
async function withTimeout<T>(p: Promise<T>, ms = 2000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    p.then((v) => { clearTimeout(timer); resolve(v) })
     .catch((err) => { clearTimeout(timer); reject(err) })
  })
}

async function pingBackend(): Promise<boolean> {
  try {
    const base = getApiBase()
    const res = await withTimeout(fetch(`${base}/api/health`, { method: 'GET' }), 1500)
    return res.ok
  } catch {
    return false
  }
}

export async function signup(data: { name: string; email: string; phone: string; password: string; role: UserRole }): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }>{
  const canUseServer = await pingBackend()
  if (canUseServer && data.email) {
    try {
      const base = getApiBase()
      const res = await withTimeout(fetch(`${base}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }), 4000)
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.ok) {
        return { ok: false, error: body?.error || `Signup failed (${res.status})` }
      }
      const user = body.user as Omit<StoredUser, 'password'>
      // also persist locally for offline usage (store with password for local login fallback)
      registerUser({ name: user.name, email: user.email, phone: (user as any).phone || data.phone, password: data.password, role: user.role, })
      return { ok: true, user: { ...user, password: data.password } as StoredUser }
    } catch (_e: any) {
      // fall through to local fallback
    }
  }
  // Fallback to local registration
  return registerUser(data)
}

export async function login(identifier: string, password: string): Promise<{ ok: true; user: StoredUser } | { ok: false; error: string }>{
  const canUseServer = await pingBackend()
  if (canUseServer && identifier.includes('@')) {
    try {
      const base = getApiBase()
      const res = await withTimeout(fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password })
      }), 4000)
      const body = await res.json().catch(() => ({}))
      if (!res.ok || !body?.ok) {
        return { ok: false, error: body?.error || `Login failed (${res.status})` }
      }
      const user = body.user as Omit<StoredUser, 'password'>
      // augment with given password to keep a local cached credential for offline
      const complete: StoredUser = { ...user, password }
      // Save/update local cache for offline support
      const existing = findUserByEmail(user.email)
      if (!existing) {
        registerUser({ name: user.name, email: user.email, phone: (user as any).phone || '', password, role: user.role })
      }
      return { ok: true, user: complete }
    } catch (_e: any) {
      // fall through to local fallback
    }
  }
  // Fallback to local authenticate
  return authenticate(identifier, password)
}
