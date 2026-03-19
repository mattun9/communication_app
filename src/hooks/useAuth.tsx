import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { signInWithCustomToken, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { firestoreEnabled } from '../lib/firestoreService'
import { getLiffAccessToken } from '../lib/liff'
import type { User } from '../types'
import { DUMMY_MEMBERS } from '../lib/dummyData'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  loginWithCustomToken: (token: string) => Promise<boolean>
  loginWithLiff: () => Promise<{ success: boolean; status?: 'linked' | 'not_linked'; lineUserId?: string; lineDisplayName?: string }>
  switchRole: (role: 'admin' | 'member') => void
  updateUser: (updates: Partial<User>) => void
  switchChild: (uid: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  login: () => false,
  loginWithCustomToken: async () => false,
  loginWithLiff: async () => ({ success: false }),
  switchRole: () => {},
  updateUser: () => {},
  switchChild: () => {},
  logout: () => {},
})

const ADMIN_USER: User = {
  uid: 'admin-001',
  name: '田中コーチ',
  nameKana: 'タナカ コーチ',
  role: 'admin',
  classId: 'class-a',
  classIds: ['class-a'],
  email: 'tanaka@example.com',
  createdAt: new Date(),
}

/** メールアドレスからユーザーを特定（保護者メールにも対応） */
function findUserByEmail(email: string): { user: User; guardianId?: string } | null {
  // 管理者チェック
  if (email === ADMIN_USER.email) {
    return { user: { ...ADMIN_USER } }
  }

  // 会員本人のメールチェック
  const directMember = DUMMY_MEMBERS.find(m => m.email === email)
  if (directMember) {
    return { user: { ...directMember } }
  }

  // 保護者メールチェック（guardians 配列を持つ会員を検索）
  for (const member of DUMMY_MEMBERS) {
    if (!member.guardians) continue
    const guardian = member.guardians.find(g => g.email === email)
    if (guardian) {
      return { user: { ...member }, guardianId: guardian.id }
    }
  }

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [_activeGuardianId, setActiveGuardianId] = useState<string | null>(null)

  const login = useCallback((email: string, _password: string): boolean => {
    const result = findUserByEmail(email)
    if (!result) return false
    setUser(result.user)
    setActiveGuardianId(result.guardianId ?? null)
    return true
  }, [])

  const loginWithCustomToken = useCallback(async (token: string): Promise<boolean> => {
    if (!firestoreEnabled) return false
    try {
      await signInWithCustomToken(auth, token)
      // User will be set via onAuthStateChanged in a production setup
      // For now, return true to indicate success
      return true
    } catch (error) {
      console.error('Custom token login failed:', error)
      return false
    }
  }, [])

  const loginWithLiff = useCallback(async (): Promise<{ success: boolean; status?: 'linked' | 'not_linked'; lineUserId?: string; lineDisplayName?: string }> => {
    const accessToken = getLiffAccessToken()
    if (!accessToken) return { success: false }

    const functionsBaseUrl = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL as string | undefined
    if (!functionsBaseUrl) return { success: false }

    try {
      const res = await fetch(`${functionsBaseUrl}/liffAuth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liffAccessToken: accessToken }),
      })

      if (!res.ok) return { success: false }

      const data = await res.json()

      if (data.status === 'linked' && data.customToken) {
        await signInWithCustomToken(auth, data.customToken)
        return { success: true, status: 'linked', lineUserId: data.lineUserId, lineDisplayName: data.lineDisplayName }
      }

      return { success: false, status: 'not_linked', lineUserId: data.lineUserId, lineDisplayName: data.lineDisplayName }
    } catch (error) {
      console.error('LIFF login failed:', error)
      return { success: false }
    }
  }, [])

  const switchRole = useCallback((newRole: 'admin' | 'member') => {
    if (newRole === 'admin') {
      setUser({ ...ADMIN_USER })
      setActiveGuardianId(null)
    } else {
      const member = DUMMY_MEMBERS.find(m => m.uid === 'member-001')
      if (member) {
        setUser({ ...member })
        setActiveGuardianId(member.guardians?.[0]?.id ?? null)
      }
    }
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  const switchChild = useCallback((uid: string) => {
    const sibling = DUMMY_MEMBERS.find(m => m.uid === uid)
    if (sibling) setUser({ ...sibling })
  }, [])

  const logout = useCallback(async () => {
    if (firestoreEnabled) {
      try {
        await signOut(auth)
      } catch {
        // ignore sign out errors in demo mode
      }
    }
    setUser(null)
    setActiveGuardianId(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        isAuthenticated: user !== null,
        login,
        loginWithCustomToken,
        loginWithLiff,
        switchRole,
        updateUser,
        switchChild,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
