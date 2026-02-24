import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { firestoreEnabled } from '../lib/firestoreService'
import type { User } from '../types'
import { DUMMY_MEMBERS } from '../lib/dummyData'

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  switchRole: (role: 'admin' | 'member') => void
  updateUser: (updates: Partial<User>) => void
  switchChild: (uid: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isAuthenticated: false,
  loading: true,
  login: async () => ({ success: false }),
  switchRole: () => {},
  updateUser: () => {},
  switchChild: () => {},
  logout: async () => {},
})

// ---- デモモード用 ----

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

/** デモモード: メールアドレスからユーザーを特定（保護者メールにも対応） */
function findUserByEmail(email: string): { user: User; guardianId?: string } | null {
  if (email === ADMIN_USER.email) {
    return { user: { ...ADMIN_USER } }
  }
  const directMember = DUMMY_MEMBERS.find(m => m.email === email)
  if (directMember) {
    return { user: { ...directMember } }
  }
  for (const member of DUMMY_MEMBERS) {
    if (!member.guardians) continue
    const guardian = member.guardians.find(g => g.email === email)
    if (guardian) {
      return { user: { ...member }, guardianId: guardian.id }
    }
  }
  return null
}

// ---- Firestore からユーザードキュメントを取得 ----

async function fetchUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  return { uid: snap.id, ...snap.data() } as unknown as User
}

// ---- Firebase Auth エラーメッセージを日本語化 ----

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません'
    case 'auth/user-disabled':
      return 'このアカウントは無効になっています'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'メールアドレスまたはパスワードが正しくありません'
    case 'auth/too-many-requests':
      return 'ログイン試行回数が多すぎます。しばらく待ってから再度お試しください'
    case 'auth/network-request-failed':
      return 'ネットワークエラーが発生しました。接続を確認してください'
    default:
      return 'ログインに失敗しました'
  }
}

// ---- Provider ----

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(firestoreEnabled)
  const [, setActiveGuardianId] = useState<string | null>(null)

  // Firebase Auth: セッション復元（リロード対応）
  useEffect(() => {
    if (!firestoreEnabled) return
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await fetchUserDoc(firebaseUser.uid)
        setUser(userDoc)
      } else {
        setUser(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  // ログイン
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Firestore モード: Firebase Auth でログイン
    if (firestoreEnabled) {
      try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        const userDoc = await fetchUserDoc(credential.user.uid)
        if (!userDoc) {
          await signOut(auth)
          return { success: false, error: 'ユーザー情報が見つかりません。管理者にお問い合わせください' }
        }
        setUser(userDoc)
        return { success: true }
      } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? ''
        return { success: false, error: getAuthErrorMessage(code) }
      }
    }

    // デモモード: メールアドレスのみで認証
    const result = findUserByEmail(email)
    if (!result) {
      return { success: false, error: 'メールアドレスまたはパスワードが正しくありません' }
    }
    setUser(result.user)
    setActiveGuardianId(result.guardianId ?? null)
    return { success: true }
  }, [])

  // ロール切替（デモモード用）
  const switchRole = useCallback((newRole: 'admin' | 'member') => {
    if (firestoreEnabled) return
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

  // ユーザー情報更新
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
  }, [])

  // 子ども切替（デモモード用）
  const switchChild = useCallback((uid: string) => {
    if (firestoreEnabled) return
    const sibling = DUMMY_MEMBERS.find(m => m.uid === uid)
    if (sibling) setUser({ ...sibling })
  }, [])

  // ログアウト
  const logout = useCallback(async () => {
    if (firestoreEnabled) {
      await signOut(auth)
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
        loading,
        login,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}
